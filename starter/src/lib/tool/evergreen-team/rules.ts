import { type Card, type CardCode, CardType, card as cardUtils, Slot } from '@5argon/arkham-kohaku';

import type {
	EvergreenDeckState,
	EvergreenFocus,
	EvergreenState,
	EvergreenZone,
	PoolEntry
} from './types';

/**
 * Whether a card belongs to the focused aspect (everything matches 'none').
 */
export function matchesFocus(card: Card, focus: EvergreenFocus): boolean {
	switch (focus) {
		case 'none':
			return true;
		case 'hand':
			return (card.slots ?? []).some((slot) => slot === Slot.Hand || slot === Slot.HandX2);
		case 'ally':
			return (card.slots ?? []).includes(Slot.Ally);
		case 'skill':
			return card.cardType === CardType.Skill;
	}
}

/**
 * Copies in one deck (both zones) of every printing sharing the given title
 * key - the per-deck limit counts by title, so picking one M1911 from two
 * different boxes still tops out at the card's usual limit.
 */
export function titleCountInDeck(
	deck: EvergreenDeckState,
	pool: Map<CardCode, PoolEntry>,
	titleKey: string
): number {
	let count = 0;
	for (const zone of ['main', 'side'] as const) {
		for (const [code, qty] of Object.entries(deck[zone])) {
			if (pool.get(code)?.titleKey === titleKey) count += qty;
		}
	}
	return count;
}

/**
 * The tool's simplification: level 0 goes to the main deck, level 1+ always
 * goes to the side deck.
 */
export function routeZone(card: Card): EvergreenZone {
	return (card.xp ?? 0) === 0 ? 'main' : 'side';
}

export function deckLimitOf(card: Card): number {
	return card.deckLimit ?? 2;
}

/**
 * Copies of a canonical code held in one deck across both zones.
 */
export function inDeckOf(deck: EvergreenDeckState, code: CardCode): number {
	return (deck.main[code] ?? 0) + (deck.side[code] ?? 0);
}

/**
 * Copies drafted across every deck.
 */
export function draftedOf(state: EvergreenState, code: CardCode): number {
	return state.decks.reduce((sum, deck) => sum + inDeckOf(deck, code), 0);
}

/**
 * Copies a pickup may take from the collection: what is physically left, or
 * a full deck limit's worth when the unlimited preference is on.
 */
export function availableOf(
	state: EvergreenState,
	pool: Map<CardCode, PoolEntry>,
	code: CardCode
): number {
	const entry = pool.get(code);
	if (entry === undefined) return 0;
	return state.unlimited ? deckLimitOf(entry.card) : remainingOf(state, pool, code);
}

/**
 * Cards claimed by the decks beyond what the products physically contain.
 * Only possible for teams assembled from published decks; a whole stack
 * counts as overlapping wherever it sits.
 */
export function overlappingCodes(
	state: EvergreenState,
	pool: Map<CardCode, PoolEntry>
): Set<CardCode> {
	const result = new Set<CardCode>();
	for (const deck of state.decks) {
		for (const code of [...Object.keys(deck.main), ...Object.keys(deck.side)]) {
			if (result.has(code)) continue;
			const entry = pool.get(code);
			if (entry !== undefined && draftedOf(state, code) > entry.total) result.add(code);
		}
	}
	return result;
}

/**
 * Stacks of one deck that take part in an overlap.
 */
export function overlappingStacksOf(
	deck: EvergreenDeckState,
	overlaps: ReadonlySet<CardCode>
): number {
	return [...Object.keys(deck.main), ...Object.keys(deck.side)].filter((code) => overlaps.has(code))
		.length;
}

/**
 * Copies still in the collection.
 */
export function remainingOf(
	state: EvergreenState,
	pool: Map<CardCode, PoolEntry>,
	code: CardCode
): number {
	const entry = pool.get(code);
	if (entry === undefined) return 0;
	return Math.max(0, entry.total - draftedOf(state, code));
}

/**
 * Copies one pickup asks for, before availability clamps: 1 in one-at-a-time
 * mode, otherwise up to the card's deck limit.
 */
export function wantOf(state: EvergreenState, card: Card): number {
	return state.pickMode === 'one' ? 1 : deckLimitOf(card);
}

/**
 * The single clamp implementation shared by drag-drop and the click picker:
 * how many copies one pickup actually moves into a target deck.
 */
export function computeMoveQuantity(args: {
	want: number;
	remainingAtSource: number;
	deckLimit: number;
	inTargetDeck: number;
}): number {
	return Math.max(
		0,
		Math.min(args.want, args.remainingAtSource, args.deckLimit - args.inTargetDeck)
	);
}

/**
 * Eligibility per pool card per player, computed once when planning starts
 * (setup is immutable). Values are parallel to state.setup.investigators.
 */
export function buildEligibility(
	investigators: Card[],
	pool: Map<CardCode, PoolEntry>
): Map<CardCode, boolean[]> {
	const map = new Map<CardCode, boolean[]>();
	for (const entry of pool.values()) {
		map.set(
			entry.card.code,
			investigators.map((inv) => cardUtils.canUse(inv, {}, entry.card))
		);
	}
	return map;
}

function addToZone(deck: EvergreenDeckState, zone: EvergreenZone, code: CardCode, qty: number) {
	deck[zone][code] = (deck[zone][code] ?? 0) + qty;
}

function removeFromZone(
	deck: EvergreenDeckState,
	zone: EvergreenZone,
	code: CardCode,
	qty: number
): number {
	const held = deck[zone][code] ?? 0;
	const removed = Math.min(held, qty);
	if (removed === 0) return 0;
	if (held - removed === 0) {
		delete deck[zone][code];
	} else {
		deck[zone][code] = held - removed;
	}
	return removed;
}

/**
 * Collection -> deck. Returns how many copies actually moved (0 = rejected).
 */
export function moveToDeck(
	state: EvergreenState,
	pool: Map<CardCode, PoolEntry>,
	card: Card,
	deckIndex: number,
	want: number = wantOf(state, card)
): number {
	const deck = state.decks[deckIndex];
	if (deck === undefined) return 0;
	const entry = pool.get(card.code);
	const qty = computeMoveQuantity({
		want,
		remainingAtSource: availableOf(state, pool, card.code),
		deckLimit: deckLimitOf(card),
		inTargetDeck: entry ? titleCountInDeck(deck, pool, entry.titleKey) : inDeckOf(deck, card.code)
	});
	if (qty === 0) return 0;
	addToZone(deck, routeZone(card), card.code, qty);
	return qty;
}

/**
 * Deck -> collection. Returns how many copies actually returned.
 */
export function returnToCollection(
	state: EvergreenState,
	card: Card,
	deckIndex: number,
	zone: EvergreenZone,
	want: number = wantOf(state, card)
): number {
	const deck = state.decks[deckIndex];
	if (deck === undefined) return 0;
	return removeFromZone(deck, zone, card.code, want);
}

/**
 * Deck -> another deck. Copies that do not fit the target (its deck limit)
 * stay in the source. Returns how many copies actually moved.
 */
export function moveBetweenDecks(
	state: EvergreenState,
	pool: Map<CardCode, PoolEntry>,
	card: Card,
	fromIndex: number,
	fromZone: EvergreenZone,
	toIndex: number,
	want: number = wantOf(state, card)
): number {
	const from = state.decks[fromIndex];
	const to = state.decks[toIndex];
	if (from === undefined || to === undefined || fromIndex === toIndex) return 0;
	const held = from[fromZone][card.code] ?? 0;
	const entry = pool.get(card.code);
	const qty = computeMoveQuantity({
		want,
		remainingAtSource: held,
		deckLimit: deckLimitOf(card),
		inTargetDeck: entry ? titleCountInDeck(to, pool, entry.titleKey) : inDeckOf(to, card.code)
	});
	if (qty === 0) return 0;
	removeFromZone(from, fromZone, card.code, qty);
	addToZone(to, routeZone(card), card.code, qty);
	return qty;
}

/**
 * Main-deck card count of one deck (fixed items excluded by construction:
 * they are never part of deck state).
 */
export function mainDeckCount(deck: EvergreenDeckState): number {
	return Object.values(deck.main).reduce((sum, q) => sum + q, 0);
}

/**
 * Total XP the side deck would cost to buy during a campaign.
 */
export function sideDeckXp(
	deck: EvergreenDeckState,
	resolveCard: (code: CardCode) => Card
): number {
	return Object.entries(deck.side).reduce(
		(sum, [code, qty]) => sum + (resolveCard(code).xp ?? 0) * qty,
		0
	);
}
