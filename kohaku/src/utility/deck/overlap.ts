import { Card } from '../../type/data/player-card.js';
import { CardQuantity, Deck } from '../../type/data/deck.js';
import { isRandomBasicWeakness } from '../card/util.js';

export interface DeckOverlapInfo {
	cardCode: string;
	card: Card;
	totalQuantity: number;
	cardLimit: number;
	/**
	 * Map of deck ID to quantity of this card in that deck
	 */
	deckQuantities: Map<string | number, number>;
}

export interface DeckCombinationOverlap {
	decks: Deck[];
	overlaps: DeckOverlapInfo[];
}

/**
 * Find overlapping cards across multiple decks.
 * A card is considered overlapping if the combined quantity across all decks
 * exceeds the card's per-deck limit.
 * 
 * @param decks - Array of decks to check for overlaps
 * @param includeLinkedCards - Whether to include bonded and customizable linked cards (default: true)
 * @returns Array of overlap information for cards that exceed limits
 */
export function findDeckOverlaps(
	decks: Deck[],
	includeLinkedCards: boolean = true
): DeckOverlapInfo[] {
	const cardTotals: Map<string, { card: Card; total: number; deckQuantities: Map<string | number, number> }> = new Map();

	// Count total quantity of each card across all decks (main deck only, not side deck)
	for (const deck of decks) {
		const cardsToProcess: CardQuantity[] = deck.mainDeck;

		for (const cq of cardsToProcess) {
			const code = cq.card.code;

			// Skip random basic weaknesses
			if (isRandomBasicWeakness(cq.card)) {
				continue;
			}

			if (!cardTotals.has(code)) {
				cardTotals.set(code, {
					card: cq.card,
					total: 0,
					deckQuantities: new Map()
				});
			}

			const entry = cardTotals.get(code)!;
			entry.total += cq.quantity;
			entry.deckQuantities.set(deck.id, (entry.deckQuantities.get(deck.id) || 0) + cq.quantity);
		}
	}

	// Find cards that exceed their limit
	const overlaps: DeckOverlapInfo[] = [];
	for (const [code, entry] of cardTotals.entries()) {
		const card = entry.card;
		if (card.quantity > 0 && entry.total > card.quantity) {
			overlaps.push({
				cardCode: code,
				card: card,
				totalQuantity: entry.total,
				cardLimit: card.quantity,
				deckQuantities: entry.deckQuantities
			});
		}
	}

	return overlaps;
}

/**
 * Generate all possible combinations of decks of a specific size
 * @param decks - Array of all available decks
 * @param size - Size of each combination (e.g., 2 for pairs, 3 for triplets)
 * @returns Array of deck combinations
 */
export function generateDeckCombinations(decks: Deck[], size: number): Deck[][] {
	const combinations: Deck[][] = [];

	function combine(start: number, current: Deck[]) {
		if (current.length === size) {
			combinations.push([...current]);
			return;
		}

		for (let i = start; i < decks.length; i++) {
			current.push(decks[i]);
			combine(i + 1, current);
			current.pop();
		}
	}

	combine(0, []);
	return combinations;
}

/**
 * Find overlaps for all possible combinations of decks of a given size
 * @param decks - Array of all available decks
 * @param teamSize - Size of each team (2, 3, or 4)
 * @returns Array of combinations with their overlaps, sorted by fewest overlaps first
 */
export function findTeamOverlaps(decks: Deck[], teamSize: number): DeckCombinationOverlap[] {
	const combinations = generateDeckCombinations(decks, teamSize);
	const results: DeckCombinationOverlap[] = [];

	for (const combo of combinations) {
		const overlaps = findDeckOverlaps(combo);
		results.push({
			decks: combo,
			overlaps: overlaps
		});
	}

	// Sort by number of overlaps (fewest first)
	results.sort((a, b) => a.overlaps.length - b.overlaps.length);

	return results;
}
