import { Card } from '../../type/data/player-card.js';
import { Deck } from '../../type/data/deck.js';
import { isRandomBasicWeakness } from '../card/util.js';

/**
 * A card whose copies across a group of decks exceed what is available.
 */
export interface QuantityOverlap {
	code: string;
	used: number;
	available: number;
	/**
	 * Copies in each deck, by the deck's position in the input.
	 */
	perDeck: number[];
}

/**
 * Cards whose combined copies across decks exceed what is available. Each
 * tool supplies its own idea of availability (one copy of each product, the
 * products the player owns, ...).
 *
 * @param decks - Each deck's copies, as card code and quantity pairs. A code
 * may repeat within a deck (main and side deck); its copies add up.
 * @param availableOf - Copies available of a code; `undefined` leaves the
 * card out entirely.
 */
export function findQuantityOverlaps(
	decks: Iterable<readonly [string, number]>[],
	availableOf: (code: string) => number | undefined
): QuantityOverlap[] {
	const perCode = new Map<string, number[]>();
	decks.forEach((deck, deckIndex) => {
		for (const [code, quantity] of deck) {
			let perDeck = perCode.get(code);
			if (perDeck === undefined) {
				perDeck = decks.map(() => 0);
				perCode.set(code, perDeck);
			}
			perDeck[deckIndex] += quantity;
		}
	});

	const overlaps: QuantityOverlap[] = [];
	for (const [code, perDeck] of perCode) {
		const available = availableOf(code);
		if (available === undefined) continue;
		const used = perDeck.reduce((sum, quantity) => sum + quantity, 0);
		if (used > available) overlaps.push({ code, used, available, perDeck });
	}
	return overlaps;
}

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
 * Find overlapping cards across multiple decks, assuming one copy of each
 * product: a card overlaps when the combined quantity across all decks
 * exceeds the quantity its product contains. Random basic weaknesses are
 * never counted.
 *
 * @param decks - Array of decks to check for overlaps
 * @param options.includeSideDeck - Count side deck copies too (default: main deck only)
 * @returns Array of overlap information for cards that exceed limits
 */
export function findDeckOverlaps(
	decks: Deck[],
	options: { includeSideDeck?: boolean } = {}
): DeckOverlapInfo[] {
	const cards = new Map<string, Card>();
	const counted = decks.map((deck) => {
		const zones = options.includeSideDeck ? [...deck.mainDeck, ...deck.sideDeck] : deck.mainDeck;
		return zones.map((cq): [string, number] => {
			cards.set(cq.card.code, cq.card);
			return [cq.card.code, cq.quantity];
		});
	});

	return findQuantityOverlaps(counted, (code) => {
		const card = cards.get(code);
		if (card === undefined || isRandomBasicWeakness(card) || card.quantity <= 0) return undefined;
		return card.quantity;
	}).map((overlap) => {
		const deckQuantities = new Map<string | number, number>();
		overlap.perDeck.forEach((quantity, deckIndex) => {
			if (quantity === 0) return;
			const id = decks[deckIndex].id;
			deckQuantities.set(id, (deckQuantities.get(id) ?? 0) + quantity);
		});
		const card = cards.get(overlap.code)!;
		return {
			cardCode: overlap.code,
			card,
			totalQuantity: overlap.used,
			cardLimit: overlap.available,
			deckQuantities
		};
	});
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
 * Copies a team needs beyond what is available, across all its overlapping
 * cards: 8 copies of a card limited to 4 counts as 4.
 */
function excessCopies(overlaps: DeckOverlapInfo[]): number {
	return overlaps.reduce((sum, overlap) => sum + overlap.totalQuantity - overlap.cardLimit, 0);
}

/**
 * Find overlaps for all possible combinations of decks of a given size
 * @param decks - Array of all available decks
 * @param teamSize - Size of each team (2, 3, or 4)
 * @returns Array of combinations with their overlaps, sorted by fewest overlaps
 * first, then by fewest copies beyond what is available
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

	results.sort(
		(a, b) =>
			a.overlaps.length - b.overlaps.length || excessCopies(a.overlaps) - excessCopies(b.overlaps)
	);

	return results;
}
