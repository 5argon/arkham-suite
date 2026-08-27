import { Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards } from '../../card-data';
import { decodeEvergreen, encodeEvergreen } from './codec';
import type { EvergreenState } from './types';

const allCards = getAllCards();

function fullTeam(): EvergreenState {
	return {
		setup: {
			core: Product.RevisedCoreSet,
			deckProducts: [Product.NathanielCho, Product.HarveyWalters],
			extraProducts: [],
			investigators: ['01501', '01502', '01503', '01504']
		},
		decks: [
			{ investigator: '01501', main: { '01517': 2, '01592': 2 }, side: {} },
			{ investigator: '01502', main: { '01530': 2 }, side: { '01685': 2 } },
			{ investigator: '01503', main: { '01544': 2, '01547': 1 }, side: {} },
			{ investigator: '01504', main: { '01560': 2 }, side: {} }
		],
		pickMode: 'max',
		mergeProducts: false,
		info: { name: 'Evergreen Team', author: '', description: '' }
	};
}

describe('evergreen codec', () => {
	it('round-trips a full 4-player team', () => {
		const state = fullTeam();
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded).toEqual(state);
	});

	it('round-trips merge products on a partial team; pick mode is not carried by the link', () => {
		const state: EvergreenState = {
			setup: {
				core: Product.CoreSet2026,
				deckProducts: [Product.TommyMuldoon],
				extraProducts: [],
				investigators: ['12001']
			},
			decks: [{ investigator: '12001', main: { '12025': 2 }, side: {} }],
			pickMode: 'class',
			mergeProducts: true,
			info: { name: 'Evergreen Team', author: '', description: '' }
		};
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded).toEqual({ ...state, pickMode: 'max' });
	});

	it('round-trips team info, clamped to its limits, with a blank name defaulting', () => {
		const state = fullTeam();
		state.info = { name: 'x'.repeat(150), author: ' Sirawat ', description: 'y'.repeat(250) };
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded!.info).toEqual({
			name: 'x'.repeat(100),
			author: 'Sirawat',
			description: 'y'.repeat(200)
		});
		state.info = { name: '   ', author: '', description: '' };
		expect(decodeEvergreen(encodeEvergreen(state), allCards)!.info.name).toBe('Evergreen Team');
	});

	it('produces a URL-safe string', () => {
		const encoded = encodeEvergreen(fullTeam());
		expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	it('round-trips advanced extra products and drafts from them', () => {
		const state = fullTeam();
		state.setup.extraProducts = [Product.TommyMuldoon];
		// Tommy's Police Dog is only in this rcore pool thanks to the extra product.
		state.decks[0].main['60156'] = 2;
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded).toEqual(state);
	});

	it('drops invalid or already-covered extra products on decode', () => {
		const state = fullTeam();
		state.setup.extraProducts = [
			Product.RevisedCoreSet, // already the core
			Product.NathanielCho, // already a deck product
			Product.TommyMuldoon
		];
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded!.setup.extraProducts).toEqual([Product.TommyMuldoon]);
	});

	it('returns null on garbage input', () => {
		expect(decodeEvergreen('definitely not a team', allCards)).toBeNull();
		expect(decodeEvergreen('', allCards)).toBeNull();
	});

	it('drops cards that are not in the rebuilt pool', () => {
		const state = fullTeam();
		state.decks[0].main['59999'] = 2;
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded).not.toBeNull();
		expect(decoded!.decks[0].main['59999']).toBeUndefined();
		expect(decoded!.decks[0].main['01592']).toBe(2);
	});

	it('drops investigators outside the setup roster', () => {
		const state = fullTeam();
		state.setup.investigators[3] = '05001';
		state.decks[3].investigator = '05001';
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded).not.toBeNull();
		expect(decoded!.decks.length).toBe(3);
		expect(decoded!.setup.investigators).toEqual(['01501', '01502', '01503']);
	});

	it('clamps quantities to the physical pool across decks', () => {
		const state = fullTeam();
		// 4 copies exist; decks claim 2 + 2 + 2 = 6.
		state.decks[0].main['01592'] = 2;
		state.decks[1].main['01592'] = 2;
		state.decks[2].main['01592'] = 2;
		const decoded = decodeEvergreen(encodeEvergreen(state), allCards);
		expect(decoded).not.toBeNull();
		const total =
			(decoded!.decks[0].main['01592'] ?? 0) +
			(decoded!.decks[1].main['01592'] ?? 0) +
			(decoded!.decks[2].main['01592'] ?? 0);
		expect(total).toBe(4);
	});
});
