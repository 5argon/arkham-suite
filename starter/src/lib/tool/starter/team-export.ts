import { type Card, type CardCode, Product } from '@5argon/arkham-kohaku';

import { encodeEvergreen } from '$lib/tool/evergreen-team/codec';
import { buildPool, deckProductsForCore } from '$lib/tool/evergreen-team/pool';
import { draftedOf } from '$lib/tool/evergreen-team/rules';
import type {
	EvergreenCore,
	EvergreenDeckState,
	EvergreenSetup,
	EvergreenState,
	PoolEntry,
	TeamInfo
} from '$lib/tool/evergreen-team/types';

import { deckCardPool, type StarterDeckEntry } from '../../starter-content';

const CORE: EvergreenCore = Product.CoreSet2026;

/**
 * The cart as an Evergreen Team Builder state: the exact decks (0 XP main
 * deck, upgrades as side deck) over the exact product set, which is the
 * user's ticked Investigator Decks plus whatever the chosen decks themselves
 * require. Card overlaps between decks are kept for the tool to show and
 * resolve.
 */
export function starterTeamState(args: {
	entries: StarterDeckEntry[];
	products: Product[] | undefined;
	allCards: Card[];
	info: TeamInfo;
}): { state: EvergreenState; pool: Map<CardCode, PoolEntry> } {
	const { entries, products, allCards, info } = args;
	const allowed = deckProductsForCore(CORE);
	const required = new Set<Product>(products ?? allowed);
	for (const entry of entries) {
		for (const p of deckCardPool(entry.primary)) {
			if (p !== CORE && allowed.includes(p as Product)) required.add(p as Product);
		}
	}
	const setup: EvergreenSetup = {
		core: CORE,
		deckProducts: allowed.filter((p) => required.has(p)),
		extraProducts: [],
		investigators: entries.map((e) => e.primary.investigator_code)
	};
	const pool = buildPool(setup, allCards);
	const decks: EvergreenDeckState[] = entries.map((entry) => {
		const main: Record<string, number> = {};
		const side: Record<string, number> = {};
		for (const [code, quantity] of Object.entries(entry.primary.slots ?? {})) {
			const poolEntry = pool.get(code);
			if (poolEntry === undefined || (poolEntry.card.xp ?? 0) > 0) continue;
			main[code] = quantity;
		}
		for (const [code, quantity] of Object.entries(entry.primary.sideSlots ?? {})) {
			const poolEntry = pool.get(code);
			if (poolEntry === undefined || (poolEntry.card.xp ?? 0) === 0) continue;
			side[code] = quantity;
		}
		return { investigator: entry.primary.investigator_code, main, side };
	});
	const state: EvergreenState = {
		setup,
		decks,
		pickMode: 'max',
		mergeProducts: false,
		unlimited: false,
		info
	};
	return { state, pool };
}

export function starterTeamToEvergreen(args: Parameters<typeof starterTeamState>[0]): string {
	return encodeEvergreen(starterTeamState(args).state);
}

/**
 * Copies each deck claims of cards the team as a whole claims beyond what
 * the products hold, counted by quantity: 5 Overpower across the team with
 * 4 in the box means a deck holding 2 shows 2 and a deck holding 1 shows 1.
 */
export function starterTeamOverlaps(
	state: EvergreenState,
	pool: Map<CardCode, PoolEntry>
): { perDeck: number[]; total: number } {
	const overlapping = new Set<CardCode>();
	for (const deck of state.decks) {
		for (const code of [...Object.keys(deck.main), ...Object.keys(deck.side)]) {
			const entry = pool.get(code);
			if (entry !== undefined && draftedOf(state, code) > entry.total) overlapping.add(code);
		}
	}
	const perDeck = state.decks.map((deck) =>
		[...overlapping].reduce((sum, code) => sum + (deck.main[code] ?? 0) + (deck.side[code] ?? 0), 0)
	);
	return { perDeck, total: perDeck.reduce((a, b) => a + b, 0) };
}
