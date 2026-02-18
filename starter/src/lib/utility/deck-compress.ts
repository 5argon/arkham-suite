import pako from 'pako';
import type { AhdbDeck, CardCode } from '@5argon/arkham-kohaku';
import {
	CompactDeck,
	Faction,
	CustomizableEntry,
	CustomizationOption,
	CustomizationDetails,
	Skill
} from '$lib/proto/generated/deck';
import type { PartialMessage } from '@protobuf-ts/runtime';

/**
 * Parse card code into fully bit-packed CardEntry with deck type
 * Encoding: (card_code << 4) | ((quantity - 1) << 2) | deck_type
 * - bits 0-1: deck_type (0=slots, 1=side_slots, 2=ignore_deck_limit_slots, 3=extra_deck)
 * - bits 2-3: quantity - 1 (0-3 represents quantities 1-4)
 * - bits 4-20: card_code as integer (0-131071, 17 bits, covers 00000-99999)
 * Format: 5-digit card code (e.g., "01684" → 1684), quantity 1-4
 * Total: 21 bits packed into single uint32 field = 1 tag + 3 varint bytes = 4 bytes per card
 *
 * @param code Card code (e.g., "01001" or "01684")
 * @param quantity Quantity 1-4 (stored as 0-3 in bits 2-3)
 * @param deckType 0=slots, 1=side_slots, 2=ignore_deck_limit_slots, 3=extra_deck
 * @returns Packed uint32 value
 */
function parseCardEntry(code: CardCode, quantity: number = 1, deckType: number = 0): number {
	const cardCodeInt = parseInt(code, 10);
	// Pack: card_code (bits 4-20) + (quantity-1) (bits 2-3) + deck_type (bits 0-1)
	return (cardCodeInt << 4) | ((quantity - 1) << 2) | deckType;
}

/**
 * Convert uint32 back to card code string (ignoring quantity and deck type)
 */
function cardEntryToCode(entry: number): CardCode {
	const packed = entry;
	// Unpack: extract card code integer, ignore quantity and deck type
	const cardCodeInt = (packed >> 4) & 0x1ffff; // bits 4-20 (17 bits)
	return cardCodeInt.toString().padStart(5, '0');
}

/**
 * Convert uint32 back to card code string, quantity, and deck type
 */
function cardEntryToCodeAndQty(entry: number): {
	code: CardCode;
	quantity: number;
	deckType: number;
} {
	const packed = entry;
	// Unpack all fields
	const deckType = packed & 0x3; // bits 0-1
	const quantityMinus1 = (packed >> 2) & 0x3; // bits 2-3
	const quantity = quantityMinus1 + 1; // Convert back to 1-4
	const cardCodeInt = (packed >> 4) & 0x1ffff; // bits 4-20 (17 bits)
	const code = cardCodeInt.toString().padStart(5, '0');
	return { code, quantity, deckType };
}

/**
 * Convert faction string to Faction enum
 */
function factionStringToEnum(
	faction: 'guardian' | 'seeker' | 'rogue' | 'mystic' | 'survivor' | undefined
): Faction {
	if (!faction) return Faction.FACTION_UNSPECIFIED;
	switch (faction) {
		case 'guardian':
			return Faction.GUARDIAN;
		case 'seeker':
			return Faction.SEEKER;
		case 'rogue':
			return Faction.ROGUE;
		case 'mystic':
			return Faction.MYSTIC;
		case 'survivor':
			return Faction.SURVIVOR;
		default:
			return Faction.FACTION_UNSPECIFIED;
	}
}

/**
 * Convert Faction enum back to string
 */
function factionEnumToString(
	faction: Faction
): 'guardian' | 'seeker' | 'rogue' | 'mystic' | 'survivor' | undefined {
	switch (faction) {
		case Faction.GUARDIAN:
			return 'guardian';
		case Faction.SEEKER:
			return 'seeker';
		case Faction.ROGUE:
			return 'rogue';
		case Faction.MYSTIC:
			return 'mystic';
		case Faction.SURVIVOR:
			return 'survivor';
		default:
			return undefined;
	}
}

/**
 * Convert skill string to Skill enum
 */
function skillStringToEnum(skill: 'willpower' | 'intellect' | 'combat' | 'agility'): Skill {
	switch (skill) {
		case 'willpower':
			return Skill.WILLPOWER;
		case 'intellect':
			return Skill.INTELLECT;
		case 'combat':
			return Skill.COMBAT;
		case 'agility':
			return Skill.AGILITY;
		default:
			return Skill.SKILL_UNSPECIFIED;
	}
}

/**
 * Parse meta JSON string and populate CompactDeck fields directly
 */
function parseMetaIntoCompactDeck(
	metaString: string,
	compactDeck: PartialMessage<CompactDeck>
): void {
	if (!metaString || metaString === '{}') return;

	try {
		const meta = JSON.parse(metaString);

		// Alternate front/back cards
		if (meta.alternate_front) {
			compactDeck.alternateFront = parseCardEntry(meta.alternate_front);
		}
		if (meta.alternate_back) {
			compactDeck.alternateBack = parseCardEntry(meta.alternate_back);
		}

		// Option selected (string)
		if (meta.option_selected) {
			compactDeck.optionSelected = meta.option_selected;
		}

		// Number selected: deck_size_selected OR packed factions
		if (meta.deck_size_selected) {
			// Deck size takes priority (30, 40, 50, etc.)
			compactDeck.numberSelected = parseInt(meta.deck_size_selected, 10);
		} else if (meta.faction_1 && meta.faction_2) {
			// Dual faction: pack both (faction_1 in bits 0-2, faction_2 in bits 3-5)
			const f1 = factionStringToEnum(meta.faction_1);
			const f2 = factionStringToEnum(meta.faction_2);
			compactDeck.numberSelected = (f1 & 0x7) | ((f2 & 0x7) << 3);
		} else if (meta.faction_selected) {
			// Single faction: use bits 0-2 only
			const f = factionStringToEnum(meta.faction_selected);
			compactDeck.numberSelected = f & 0x7;
		}

		// Encode customizable meta
		const customizables: CustomizableEntry[] = [];
		Object.entries(meta).forEach(([key, value]) => {
			if (key.startsWith('cus_') && typeof value === 'string') {
				const custCard = key.slice(4);
				const custSep = (value as string).split(',');

				const options: CustomizationOption[] = [];
				custSep.forEach((x) => {
					const custValue = x.split('|');
					if (custValue.length >= 2) {
						// Pack index (4 bits) and checked (3 bits) into single field
						const index = parseInt(custValue[0]);
						const checked = parseInt(custValue[1]);
						const packed = (index << 3) | (checked & 0x7);
						const option: PartialMessage<CustomizationOption> = {
							packed
						};

						if (custValue.length > 2) {
							const detailsString = custValue[2];
							const detailsSep = detailsString.split('^');
							const details: PartialMessage<CustomizationDetails> = {
								recordedCards: [],
								recordedTraits: [],
								recordedSkills: []
							};

							const skillStrings = ['willpower', 'intellect', 'combat', 'agility'];
							detailsSep.forEach((y) => {
								switch (y) {
									case 'willpower':
									case 'intellect':
									case 'combat':
									case 'agility':
										details.recordedSkills?.push(skillStringToEnum(y));
										break;
									default:
										if (y.match(/\d+/)) {
											details.recordedCards?.push(parseCardEntry(y));
										} else if (!skillStrings.includes(y)) {
											details.recordedTraits?.push(y);
										}
								}
							});

							option.details = details as CustomizationDetails;
						}

						options.push(option as CustomizationOption);
					}
				});

				if (options.length > 0) {
					customizables.push({
						forCard: parseCardEntry(custCard),
						options
					});
				}
			}
		});

		if (customizables.length > 0) {
			compactDeck.customizables = customizables;
		}
	} catch (error) {
		console.error('Failed to parse meta:', error);
	}
}

/**
 * Reconstruct meta JSON string from CompactDeck fields
 */
function reconstructMetaFromCompactDeck(compactDeck: CompactDeck): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const meta: Record<string, any> = {};

	// Alternate front/back cards
	if (compactDeck.alternateFront) {
		meta.alternate_front = cardEntryToCode(compactDeck.alternateFront);
	}
	if (compactDeck.alternateBack) {
		meta.alternate_back = cardEntryToCode(compactDeck.alternateBack);
	}

	// Option selected
	if (compactDeck.optionSelected) {
		meta.option_selected = compactDeck.optionSelected;
	}

	// Number selected: decode as deck_size or factions based on value
	if (compactDeck.numberSelected) {
		if (compactDeck.numberSelected > 6) {
			// Likely a deck size (30, 40, 50, etc.)
			meta.deck_size_selected = compactDeck.numberSelected.toString();
		} else {
			// Likely packed factions (6 bits max = 63)
			const faction1 = compactDeck.numberSelected & 0x7; // bits 0-2
			const faction2 = (compactDeck.numberSelected >> 3) & 0x7; // bits 3-5
			if (faction2 !== 0) {
				// Dual faction
				meta.faction_1 = factionEnumToString(faction1 as Faction);
				meta.faction_2 = factionEnumToString(faction2 as Faction);
			} else {
				// Single faction
				meta.faction_selected = factionEnumToString(faction1 as Faction);
			}
		}
	}

	// Decode customizable meta
	if (compactDeck.customizables) {
		compactDeck.customizables.forEach((customizable) => {
			if (!customizable.forCard) return;

			const custCard = cardEntryToCode(customizable.forCard);
			const custValues: string[] = [];

			customizable.options.forEach((option) => {
				// Unpack index (4 bits) and checked (3 bits)
				const index = option.packed >> 3;
				const checked = option.packed & 0x7;
				let custValue = `${index}|${checked}`;

				if (option.details) {
					const details: string[] = [];

					option.details.recordedCards.forEach((card) => {
						details.push(cardEntryToCode(card));
					});

					option.details.recordedTraits.forEach((trait) => {
						details.push(trait);
					});

					option.details.recordedSkills.forEach((skill) => {
						switch (skill) {
							case Skill.WILLPOWER:
								details.push('willpower');
								break;
							case Skill.INTELLECT:
								details.push('intellect');
								break;
							case Skill.COMBAT:
								details.push('combat');
								break;
							case Skill.AGILITY:
								details.push('agility');
								break;
						}
					});

					if (details.length > 0) {
						custValue += `|${details.join('^')}`;
					}
				}

				custValues.push(custValue);
			});

			if (custValues.length > 0) {
				meta[`cus_${custCard}`] = custValues.join(',');
			}
		});
	}

	return Object.keys(meta).length > 0 ? JSON.stringify(meta) : '{}';
}

/**
 * Compresses an AhdbDeck to a base64url-encoded, gzipped, protobuf string.
 * Uses minimal fields for QR code sharing.
 */
export function compressDeckProtobuf(ahdbDeck: AhdbDeck): string {
	// Consolidate all cards into single array with deck type encoded
	const cards: number[] = [];

	// Add main deck cards (deckType=0)
	Object.entries(ahdbDeck.slots || {}).forEach(([code, qty]) => {
		cards.push(parseCardEntry(code, qty, 0));
	});

	// Add side deck cards (deckType=1)
	Object.entries(ahdbDeck.sideSlots || {}).forEach(([code, qty]) => {
		cards.push(parseCardEntry(code, qty, 1));
	});

	// Add ignore deck limit cards (deckType=2)
	Object.entries(ahdbDeck.ignoreDeckLimitSlots || {}).forEach(([code, qty]) => {
		cards.push(parseCardEntry(code, qty, 2));
	});

	const compactDeck: PartialMessage<CompactDeck> = {
		investigatorCode: parseCardEntry(ahdbDeck.investigator_code, 1, 0),
		cards,
		tabooId: ahdbDeck.taboo_id || 0
	};

	// Parse meta and populate flat fields directly
	parseMetaIntoCompactDeck(ahdbDeck.meta || '{}', compactDeck);

	// Serialize to protobuf binary
	const binary = CompactDeck.toBinary(CompactDeck.create(compactDeck));

	// Encode to base64url (URL-safe without encodeURIComponent)
	const base64 = btoa(String.fromCharCode(...binary));
	const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

	return base64url;
}

/**
 * Decompresses a base64url-encoded, gzipped, protobuf string back to an AhdbDeck.
 */
export function decompressDeckProtobuf(compressed: string): AhdbDeck {
	try {
		// Convert base64url back to base64
		let base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
		// Add padding if needed
		while (base64.length % 4) {
			base64 += '=';
		}
		
		// Decode from base64
		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Deserialize from protobuf
		const compactDeck = CompactDeck.fromBinary(bytes);

		// Separate cards by deck type into slot objects
		const slots: Record<CardCode, number> = {};
		const sideSlots: Record<CardCode, number> = {};
		const ignoreDeckLimitSlots: Record<CardCode, number> = {};

		compactDeck.cards.forEach((entry) => {
			const { code, quantity, deckType } = cardEntryToCodeAndQty(entry);
			switch (deckType) {
				case 0: // slots
					slots[code] = quantity;
					break;
				case 1: // side_slots
					sideSlots[code] = quantity;
					break;
				case 2: // ignore_deck_limit_slots
					ignoreDeckLimitSlots[code] = quantity;
					break;
				case 3: // extra_deck (future use)
					// For now, add to slots
					slots[code] = quantity;
					break;
			}
		});

		// Reconstruct AhdbDeck with default values
		return {
			id: 0,
			name: '',
			date_creation: new Date().toISOString(),
			date_update: new Date().toISOString(),
			description_md: '',
			user_id: null,
			investigator_code: compactDeck.investigatorCode
				? cardEntryToCode(compactDeck.investigatorCode)
				: '',
			investigator_name: '',
			slots,
			sideSlots,
			ignoreDeckLimitSlots,
			version: '0.1',
			xp: null,
			xp_spent: null,
			xp_adjustment: null,
			exile_string: null,
			taboo_id: compactDeck.tabooId,
			meta: reconstructMetaFromCompactDeck(compactDeck),
			tags: '',
			previous_deck: null,
			next_deck: null,
			problem: null
		};
	} catch (error) {
		throw new Error(
			`Failed to decompress protobuf deck: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
