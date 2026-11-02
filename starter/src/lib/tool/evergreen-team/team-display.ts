import { type Card, CardClass, type CardCode, type Product } from '@5argon/arkham-kohaku';

import { notableDeckCards } from './notable-cards';
import { buildPool, poolSections, withHeldCards } from './pool';
import { mainDeckCount, remainingOf } from './rules';
import type { EvergreenDeckState, EvergreenState, PoolEntry } from './types';

/**
 * How much of one product a team uses.
 */
export interface PoolUsage {
	product: Product;
	used: number;
	total: number;
	percent: number;
}

/**
 * What a team's banner shows of one member.
 */
export interface MemberDisplay {
	investigator: CardCode;
	mainCount: number;
	classCounts: Partial<Record<CardClass, number>>;
	notable: CardCode[];
}

/**
 * Everything a team's banner shows beyond its name and description. Small
 * enough to precompile for every team in a listing, so showing one never needs
 * its decks.
 */
export interface TeamDisplay {
	poolUsage: PoolUsage[];
	members: MemberDisplay[];
}

export function poolUsage(team: EvergreenState, pool: Map<CardCode, PoolEntry>): PoolUsage[] {
	return poolSections(team.setup, pool).map((section) => {
		const total = section.entries.reduce((sum, e) => sum + e.total, 0);
		const remaining = section.entries.reduce(
			(sum, e) => sum + remainingOf(team, pool, e.card.code),
			0
		);
		const used = total - remaining;
		return {
			product: section.product,
			used,
			total,
			percent: total > 0 ? Math.floor((used / total) * 100) : 0
		};
	});
}

export function memberDisplay(
	deck: EvergreenDeckState,
	pool: Map<CardCode, PoolEntry>
): MemberDisplay {
	const classCounts: Partial<Record<CardClass, number>> = {};
	for (const [code, quantity] of Object.entries(deck.main)) {
		const cardClass = pool.get(code)?.card.cardClass?.class1 ?? CardClass.Neutral;
		classCounts[cardClass] = (classCounts[cardClass] ?? 0) + quantity;
	}
	return {
		investigator: deck.investigator,
		mainCount: mainDeckCount(deck),
		classCounts,
		notable: notableDeckCards(deck, pool).map((card) => card.code)
	};
}

export function teamDisplay(team: EvergreenState, allCards: Card[]): TeamDisplay {
	const pool = withHeldCards(buildPool(team.setup, allCards), team.decks, allCards);
	return {
		poolUsage: poolUsage(team, pool),
		members: team.decks.map((deck) => memberDisplay(deck, pool))
	};
}
