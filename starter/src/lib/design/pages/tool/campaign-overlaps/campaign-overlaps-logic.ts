/**
 * Campaign overlap analysis and resolution logic
 */

import type { Card, Deck } from '@5argon/arkham-kohaku';
import { card as cardUtility } from '@5argon/arkham-kohaku';

export type CampaignSide = 'A' | 'B';
export type DeckPart = 'main' | 'side' | 'extra';
export type SubPriority = 'investigator' | 'main-deck';

export interface CampaignDeckEntry {
	deck: Deck;
	campaign: CampaignSide;
	importIndex: number;
}

export interface CardCopy {
	card: Card;
	deck: Deck;
	deckPart: DeckPart;
	campaign: CampaignSide;
	importIndex: number;
}

export interface OverlapEntry {
	card: Card;
	campaignACopies: CardCopy[];
	campaignBCopies: CardCopy[];
}

export interface ResolutionMapping {
	source: CardCopy;
	destination: CardCopy;
}

export type MappingAlgorithm = 'deck-import-order' | 'same-deck-index';

/**
 * Extracts all card copies from imported decks with their metadata
 */
export function extractCardCopies(decks: CampaignDeckEntry[], forwardToRcore: boolean): CardCopy[] {
	const copies: CardCopy[] = [];

	for (const deckEntry of decks) {
		const { deck, campaign, importIndex } = deckEntry;

		// Helper to map a card code
		const mapCode = (code: string) => (forwardToRcore ? cardUtility.coreToRcore(code) : code);

		// Main deck
		for (const entry of deck.mainDeck) {
			const mappedCode = mapCode(entry.card.code);
			for (let i = 0; i < entry.quantity; i++) {
				copies.push({
					card: { ...entry.card, code: mappedCode },
					deck,
					deckPart: 'main',
					campaign,
					importIndex
				});
			}
		}

		// Side deck
		for (const entry of deck.sideDeck) {
			const mappedCode = mapCode(entry.card.code);
			for (let i = 0; i < entry.quantity; i++) {
				copies.push({
					card: { ...entry.card, code: mappedCode },
					deck,
					deckPart: 'side',
					campaign,
					importIndex
				});
			}
		}

		// Extra deck (from meta, like parallel Jim's spirit deck)
		if (deck.meta.extraDeck) {
			for (const entry of deck.meta.extraDeck) {
				const mappedCode = mapCode(entry.card.code);
				for (let i = 0; i < entry.quantity; i++) {
					copies.push({
						card: { ...entry.card, code: mappedCode },
						deck,
						deckPart: 'extra',
						campaign,
						importIndex
					});
				}
			}
		}
	}

	return copies;
}

/**
 * Calculates overlapping cards between two campaigns
 */
export function calculateOverlaps(
	campaignADecks: CampaignDeckEntry[],
	campaignBDecks: CampaignDeckEntry[],
	forwardToRcore: boolean
): OverlapEntry[] {
	const campaignACopies = extractCardCopies(campaignADecks, forwardToRcore);
	const campaignBCopies = extractCardCopies(campaignBDecks, forwardToRcore);

	// Group by card code
	const cardMap = new Map<string, { a: CardCopy[]; b: CardCopy[] }>();

	for (const copy of campaignACopies) {
		if (!cardMap.has(copy.card.code)) {
			cardMap.set(copy.card.code, { a: [], b: [] });
		}
		cardMap.get(copy.card.code)!.a.push(copy);
	}

	for (const copy of campaignBCopies) {
		if (!cardMap.has(copy.card.code)) {
			cardMap.set(copy.card.code, { a: [], b: [] });
		}
		cardMap.get(copy.card.code)!.b.push(copy);
	}

	// Filter to only overlapping cards (present in both campaigns)
	const overlaps: OverlapEntry[] = [];
	for (const [, { a, b }] of cardMap.entries()) {
		if (a.length > 0 && b.length > 0) {
			overlaps.push({
				card: a[0].card, // Use card from campaign A
				campaignACopies: a,
				campaignBCopies: b
			});
		}
	}

	// Sort by card code
	overlaps.sort((a, b) => a.card.code.localeCompare(b.card.code));

	return overlaps;
}

/**
 * Resolves overlap mappings using Deck Import Order Priority algorithm
 */
function resolveDeckImportOrder(
	overlaps: OverlapEntry[],
	subPriority: SubPriority
): ResolutionMapping[] {
	const mappings: ResolutionMapping[] = [];

	for (const overlap of overlaps) {
		// Sort copies based on sub-priority
		const sortedA = [...overlap.campaignACopies].sort((a, b) => {
			if (subPriority === 'investigator') {
				// Investigator priority: sort by import index first, then deck part
				if (a.importIndex !== b.importIndex) return a.importIndex - b.importIndex;
				return deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
			} else {
				// Main deck priority: sort by deck part first, then import index
				const partDiff = deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
				if (partDiff !== 0) return partDiff;
				return a.importIndex - b.importIndex;
			}
		});

		const sortedB = [...overlap.campaignBCopies].sort((a, b) => {
			if (subPriority === 'investigator') {
				// Investigator priority: sort by import index first, then deck part
				if (a.importIndex !== b.importIndex) return a.importIndex - b.importIndex;
				return deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
			} else {
				// Main deck priority: sort by deck part first, then import index
				const partDiff = deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
				if (partDiff !== 0) return partDiff;
				return a.importIndex - b.importIndex;
			}
		});

		// Pair up copies from A to B
		const pairCount = Math.min(sortedA.length, sortedB.length);
		for (let i = 0; i < pairCount; i++) {
			mappings.push({
				source: sortedA[i],
				destination: sortedB[i]
			});
		}
	}

	return mappings;
}

/**
 * Resolves overlap mappings using Same Deck Index Priority algorithm
 */
function resolveSameDeckIndex(
	overlaps: OverlapEntry[],
	subPriority: SubPriority
): ResolutionMapping[] {
	const mappings: ResolutionMapping[] = [];

	for (const overlap of overlaps) {
		const remainingA = [...overlap.campaignACopies];
		const remainingB = [...overlap.campaignBCopies];

		// First pass: Try to pair copies from decks with the same import index
		const pairedA = new Set<number>();
		const pairedB = new Set<number>();

		// Group by import index
		const aByIndex = groupByImportIndex(remainingA);
		const bByIndex = groupByImportIndex(remainingB);

		// Find common indices
		const commonIndices = Array.from(aByIndex.keys()).filter((index) => bByIndex.has(index));
		commonIndices.sort((a, b) => a - b);

		for (const index of commonIndices) {
			const aCopies = aByIndex.get(index)!;
			const bCopies = bByIndex.get(index)!;

			const pairCount = Math.min(aCopies.length, bCopies.length);
			for (let i = 0; i < pairCount; i++) {
				mappings.push({
					source: aCopies[i],
					destination: bCopies[i]
				});
				pairedA.add(remainingA.indexOf(aCopies[i]));
				pairedB.add(remainingB.indexOf(bCopies[i]));
			}
		}

		// Second pass: Use deck import order for remaining copies
		const unpairedA = remainingA.filter((_, index) => !pairedA.has(index));
		const unpairedB = remainingB.filter((_, index) => !pairedB.has(index));

		// Sort by import order based on sub-priority
		unpairedA.sort((a, b) => {
			if (subPriority === 'investigator') {
				// Investigator priority: sort by import index first, then deck part
				if (a.importIndex !== b.importIndex) return a.importIndex - b.importIndex;
				return deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
			} else {
				// Main deck priority: sort by deck part first, then import index
				const partDiff = deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
				if (partDiff !== 0) return partDiff;
				return a.importIndex - b.importIndex;
			}
		});

		unpairedB.sort((a, b) => {
			if (subPriority === 'investigator') {
				// Investigator priority: sort by import index first, then deck part
				if (a.importIndex !== b.importIndex) return a.importIndex - b.importIndex;
				return deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
			} else {
				// Main deck priority: sort by deck part first, then import index
				const partDiff = deckPartOrder(a.deckPart) - deckPartOrder(b.deckPart);
				if (partDiff !== 0) return partDiff;
				return a.importIndex - b.importIndex;
			}
		});

		const remainingPairCount = Math.min(unpairedA.length, unpairedB.length);
		for (let i = 0; i < remainingPairCount; i++) {
			mappings.push({
				source: unpairedA[i],
				destination: unpairedB[i]
			});
		}
	}

	return mappings;
}

/**
 * Applies the selected mapping algorithm to resolve overlaps
 */
export function resolveMappings(
	overlaps: OverlapEntry[],
	algorithm: MappingAlgorithm,
	subPriority: SubPriority = 'main-deck'
): ResolutionMapping[] {
	switch (algorithm) {
		case 'deck-import-order':
			return resolveDeckImportOrder(overlaps, subPriority);
		case 'same-deck-index':
			return resolveSameDeckIndex(overlaps, subPriority);
		default:
			return [];
	}
}

/**
 * Helper: Get deck part order for sorting
 */
function deckPartOrder(part: DeckPart): number {
	switch (part) {
		case 'main':
			return 0;
		case 'extra':
			return 1;
		case 'side':
			return 2;
		default:
			return 3;
	}
}

/**
 * Helper: Group card copies by import index
 */
function groupByImportIndex(copies: CardCopy[]): Map<number, CardCopy[]> {
	const map = new Map<number, CardCopy[]>();
	for (const copy of copies) {
		if (!map.has(copy.importIndex)) {
			map.set(copy.importIndex, []);
		}
		map.get(copy.importIndex)!.push(copy);
	}
	return map;
}
