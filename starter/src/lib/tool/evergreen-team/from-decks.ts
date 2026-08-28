import { type AhdbDeck, type Card, Product } from '@5argon/arkham-kohaku';

import { encodeEvergreen } from './codec';
import { buildPool, deckProductsForCore } from './pool';
import { defaultTeamInfo } from './team-info';
import type {
	EvergreenCore,
	EvergreenDeckState,
	EvergreenSetup,
	EvergreenState,
	TeamInfo
} from './types';

const CORE: EvergreenCore = Product.CoreSet2026;

/**
 * Any ArkhamDB-shaped decks as a Team Builder state: the Core Set 2026 plus
 * only the Investigator Decks these decks actually draw from (cards or
 * investigators), so the product set is the minimum that builds them all.
 * Level 0 cards form the main deck, upgrades the side deck, cards outside the
 * pool are dropped, and overlaps are kept for the tool to resolve.
 */
export function decksToEvergreen(decks: AhdbDeck[], allCards: Card[]): string {
	return encodeEvergreen(decksToEvergreenState(decks, allCards));
}

export function decksToEvergreenState(
	decks: AhdbDeck[],
	allCards: Card[],
	info?: Partial<TeamInfo>
): EvergreenState {
	const investigators = [...new Set(decks.map((d) => d.investigator_code))];
	const productOf = new Map(allCards.map((c) => [c.code, c.product]));
	const used = new Set<Product>();
	for (const deck of decks) {
		for (const code of [
			deck.investigator_code,
			...Object.keys(deck.slots ?? {}),
			...Object.keys(deck.sideSlots ?? {})
		]) {
			const product = productOf.get(code);
			if (product !== undefined) used.add(product);
		}
	}
	const setup: EvergreenSetup = {
		core: CORE,
		deckProducts: deckProductsForCore(CORE).filter((p) => used.has(p)),
		extraProducts: [],
		investigators
	};
	const pool = buildPool(setup, allCards);
	const evergreenDecks: EvergreenDeckState[] = investigators.map((investigator) => {
		const deck = decks.find((d) => d.investigator_code === investigator)!;
		const main: Record<string, number> = {};
		const side: Record<string, number> = {};
		for (const [code, quantity] of Object.entries(deck.slots ?? {})) {
			const entry = pool.get(code);
			if (entry === undefined) continue;
			if ((entry.card.xp ?? 0) === 0) main[code] = quantity;
			else side[code] = quantity;
		}
		for (const [code, quantity] of Object.entries(deck.sideSlots ?? {})) {
			const entry = pool.get(code);
			if (entry === undefined || (entry.card.xp ?? 0) === 0) continue;
			side[code] = Math.max(side[code] ?? 0, quantity);
		}
		return { investigator, main, side };
	});
	return {
		setup,
		decks: evergreenDecks,
		pickMode: 'max',
		mergeProducts: false,
		unlimited: false,
		info: { ...defaultTeamInfo(), description: decks.map((d) => d.name).join(', '), ...info }
	};
}
