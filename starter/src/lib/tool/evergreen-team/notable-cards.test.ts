import { Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards } from '../../card-data';
import { notableDeckCards } from './notable-cards';
import { buildPool } from './pool';
import type { EvergreenSetup } from './types';

const allCards = getAllCards();
const setup: EvergreenSetup = {
	core: Product.CoreSet2026,
	deckProducts: [],
	extraProducts: [],
	investigators: ['12001']
};
const pool = buildPool(setup, allCards);

function codeOf(name: string): string {
	const entry = [...pool.values()].find((e) => e.card.name === name && (e.card.xp ?? 0) === 0);
	if (entry === undefined) throw new Error(`missing ${name}`);
	return entry.card.code;
}

describe('notableDeckCards', () => {
	it('keeps curated titles and ally assets, drops the rest, in code order', () => {
		const deck = {
			investigator: '12001',
			main: { [codeOf('Machete')]: 2, [codeOf('Guts')]: 2, [codeOf('Bodyguard')]: 1 },
			side: {}
		};
		expect(notableDeckCards(deck, pool).map((c) => c.name)).toEqual(['Bodyguard', 'Machete']);
	});

	it('ignores the side deck', () => {
		const deck = { investigator: '12001', main: {}, side: { [codeOf('Machete')]: 1 } };
		expect(notableDeckCards(deck, pool)).toEqual([]);
	});
});
