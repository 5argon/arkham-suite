/** Deck chains as stored on a record ⇄ kohaku decks for display and import. */
import {
	deck as deckUtility,
	linearizeDeck,
	linkedAhdbDeckToDeck,
	type AhdbDeck,
	type CardResolver,
	type Deck,
	type TabooLists,
	type service
} from '@5argon/arkham-kohaku';
import { getAllCards, resolveCardOrNull } from '$lib/card-data';
import { deckExperience, xpRangeTier, type XpTier } from '$lib/campaign/utils/deck-experience';
import type { DeckInvestigator, DeckRecord, DeckVersion } from '$lib/database/document';

/** Investigator + meta selections of an AhdbDeck. */
export function investigatorFromAhdbDeck(deck: AhdbDeck): DeckInvestigator {
	let meta: Record<string, unknown> = {};
	try {
		meta = JSON.parse(deck.meta ?? '{}') as Record<string, unknown>;
	} catch {
		meta = {};
	}
	const str = (k: string) => (typeof meta[k] === 'string' ? (meta[k] as string) : null);
	return {
		investigatorCode: deck.investigator_code,
		alternateFrontCode: str('alternate_front'),
		alternateBackCode: str('alternate_back'),
		factionSelected: str('faction_selected'),
		faction1: str('faction_1'),
		faction2: str('faction_2'),
		optionSelected: str('option_selected'),
		deckSizeSelected:
			typeof meta['deck_size_selected'] === 'number' ? (meta['deck_size_selected'] as number) : null
	};
}

/** The upgrade chain as one kohaku deck (latest version with its history), or null if unreadable. */
export function buildDeckFromVersions(
	versions: DeckVersion[],
	cardResolver: CardResolver,
	tabooLists: TabooLists
): Deck | null {
	if (versions.length === 0) return null;
	try {
		const nodes: service.LinkedAhdbDeck[] = [...versions]
			.sort((a, b) => a.sequenceIndex - b.sequenceIndex)
			.map((v) => ({ deck: JSON.parse(v.ahdbJson) as AhdbDeck }));
		for (let i = 0; i < nodes.length - 1; i++) {
			nodes[i].next = nodes[i + 1];
			nodes[i + 1].previous = nodes[i];
		}
		return linkedAhdbDeckToDeck(nodes[0], cardResolver, tabooLists);
	} catch {
		return null;
	}
}

/** An empty AhdbDeck, so an investigator recorded without a deck renders like a deck. */
function blankDeckJson(investigatorCode: string): string {
	const name = resolveCardOrNull(investigatorCode)?.name ?? investigatorCode;
	const epoch = '1970-01-01T00:00:00Z';
	const blank: AhdbDeck = {
		id: `deckless-${investigatorCode}`,
		name,
		date_creation: epoch,
		date_update: epoch,
		description_md: '',
		user_id: null,
		investigator_code: investigatorCode,
		investigator_name: name,
		slots: null,
		sideSlots: null,
		ignoreDeckLimitSlots: null,
		version: '0',
		xp: null,
		xp_spent: null,
		xp_adjustment: null,
		exile_string: null,
		taboo_id: 0,
		meta: '{}',
		tags: '',
		previous_deck: null,
		next_deck: null
	};
	return JSON.stringify(blank);
}

/** The deck to show for a record's deck; a deck-less investigator shows an empty deck. */
export function deckPreview(
	deck: DeckRecord,
	cardResolver: CardResolver,
	tabooLists: TabooLists
): Deck | null {
	const versions = deck.versions.length
		? deck.versions
		: [{ sequenceIndex: 0, ahdbJson: blankDeckJson(deck.investigator.investigatorCode) }];
	return buildDeckFromVersions(versions, cardResolver, tabooLists);
}

/** An imported deck's upgrade chain, oldest first. `singleDeck` keeps only the latest version
 *  (a standalone deck has no upgrades); `trimmed` says whether that dropped anything. */
export function importedVersions(
	deck: Deck,
	singleDeck: boolean
): { investigator: DeckInvestigator; versions: DeckVersion[]; trimmed: boolean } {
	const chain = linearizeDeck(deck).map((d) => {
		if (!d.compressedJson) throw new Error('Missing compressedJson on deck version');
		return deckUtility.decompressDeck(d.compressedJson);
	});
	const kept = singleDeck ? chain.slice(-1) : chain;
	return {
		investigator: investigatorFromAhdbDeck(kept[0]),
		versions: kept.map((v, i) => ({ sequenceIndex: i, ahdbJson: JSON.stringify(v) })),
		trimmed: kept.length < chain.length
	};
}

let xpByCode: Map<string, number> | null = null;

/** Higher-level XP in a deck's latest version and its Standalone Mode tier (null tier = over the
 *  cap), or null for a deck-less entry. */
export function standaloneDeckXp(versions: DeckVersion[]): { total: number; tier: XpTier | null } | null {
	const latest = [...versions].sort((a, b) => a.sequenceIndex - b.sequenceIndex).at(-1);
	if (!latest) return null;
	xpByCode ??= new Map(getAllCards().map((c) => [c.code, c.xp ?? 0]));
	const total = deckExperience(latest.ahdbJson, xpByCode);
	return { total, tier: xpRangeTier(total) };
}
