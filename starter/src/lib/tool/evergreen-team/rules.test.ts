import { Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { createCardResolver, getAllCards } from '../../card-data';
import { buildPool, investigatorsForSetup } from './pool';
import {
	buildEligibility,
	computeMoveQuantity,
	mainDeckCount,
	moveBetweenDecks,
	moveToDeck,
	remainingOf,
	returnToCollection,
	routeZone,
	sideDeckXp
} from './rules';
import type { EvergreenState } from './types';

const allCards = getAllCards();
const resolver = createCardResolver();

function freshState(): EvergreenState {
	return {
		setup: {
			core: Product.RevisedCoreSet,
			deckProducts: [Product.HarveyWalters],
			extraProducts: [],
			investigators: ['01501', '01505']
		},
		decks: [
			{ investigator: '01501', main: {}, side: {} },
			{ investigator: '01505', main: {}, side: {} }
		],
		pickMode: 'max',
		mergeProducts: false,
		info: { name: 'Evergreen Team', author: '', description: '' }
	};
}

const pool = buildPool(freshState().setup, allCards);
const manualDexterity = pool.get('01592')!.card; // Lv0, 4 copies, deck limit 2
const seekingAnswers2 = pool.get('01685')!.card; // Lv2, 4 copies merged with Harvey's

describe('routeZone', () => {
	it('routes level 0 to main and level 1+ to side', () => {
		expect(routeZone(manualDexterity)).toBe('main');
		expect(routeZone(seekingAnswers2)).toBe('side');
	});
});

describe('computeMoveQuantity', () => {
	it('clamps to the pick toggle, source availability, and deck limit', () => {
		const base = { want: 2, remainingAtSource: 4, deckLimit: 2, inTargetDeck: 0 };
		expect(computeMoveQuantity(base)).toBe(2);
		expect(computeMoveQuantity({ ...base, want: 1 })).toBe(1);
		expect(computeMoveQuantity({ ...base, remainingAtSource: 1 })).toBe(1);
		expect(computeMoveQuantity({ ...base, remainingAtSource: 0 })).toBe(0);
		expect(computeMoveQuantity({ ...base, inTargetDeck: 1 })).toBe(1);
		expect(computeMoveQuantity({ ...base, inTargetDeck: 2 })).toBe(0);
	});
});

describe('reducers', () => {
	it('drafts from the collection until the deck limit, then rejects', () => {
		const state = freshState();
		expect(moveToDeck(state, pool, manualDexterity, 0)).toBe(2);
		expect(state.decks[0].main['01592']).toBe(2);
		expect(remainingOf(state, pool, '01592')).toBe(2);
		expect(moveToDeck(state, pool, manualDexterity, 0)).toBe(0);
		expect(moveToDeck(state, pool, manualDexterity, 1)).toBe(2);
		expect(remainingOf(state, pool, '01592')).toBe(0);
	});

	it('routes leveled cards to the side deck', () => {
		const state = freshState();
		expect(moveToDeck(state, pool, seekingAnswers2, 0)).toBe(2);
		expect(state.decks[0].side['01685']).toBe(2);
		expect(state.decks[0].main['01685']).toBeUndefined();
	});

	it('returns copies to the collection and cleans up empty keys', () => {
		const state = freshState();
		moveToDeck(state, pool, manualDexterity, 0);
		expect(returnToCollection(state, manualDexterity, 0, 'main')).toBe(2);
		expect(state.decks[0].main['01592']).toBeUndefined();
		expect(remainingOf(state, pool, '01592')).toBe(4);
	});

	it('moves between decks, leaving what does not fit in the source', () => {
		const state = freshState();
		moveToDeck(state, pool, manualDexterity, 0); // deck 0: 2x
		state.pickMode = 'one';
		moveToDeck(state, pool, manualDexterity, 1); // deck 1: 1x
		state.pickMode = 'max';
		// deck 0 -> deck 1: wants 2, deck 1 can only fit 1 more
		expect(moveBetweenDecks(state, pool, manualDexterity, 0, 'main', 1)).toBe(1);
		expect(state.decks[0].main['01592']).toBe(1);
		expect(state.decks[1].main['01592']).toBe(2);
	});

	it('single-copy mode moves one at a time', () => {
		const state = freshState();
		state.pickMode = 'one';
		expect(moveToDeck(state, pool, manualDexterity, 0)).toBe(1);
		expect(state.decks[0].main['01592']).toBe(1);
	});
});

describe('title limits across printings', () => {
	it('counts the per-deck limit across reprints of the same card', () => {
		const state = freshState();
		state.setup.deckProducts = [Product.NathanielCho];
		const poolWithNat = buildPool(state.setup, allCards);
		const rcoreDodge = poolWithNat.get('01523')!.card;
		const natDodge = poolWithNat.get('60113')!.card;
		expect(moveToDeck(state, poolWithNat, rcoreDodge, 0)).toBe(2);
		// Same title already at the limit of 2: Nathaniel's copies are refused.
		expect(moveToDeck(state, poolWithNat, natDodge, 0)).toBe(0);
	});

	it('allows one copy each from two boxes, up to the shared limit', () => {
		const state = freshState();
		state.setup.deckProducts = [Product.NathanielCho];
		state.pickMode = 'one';
		const poolWithNat = buildPool(state.setup, allCards);
		const rcoreDodge = poolWithNat.get('01523')!.card;
		const natDodge = poolWithNat.get('60113')!.card;
		expect(moveToDeck(state, poolWithNat, rcoreDodge, 0)).toBe(1);
		expect(moveToDeck(state, poolWithNat, natDodge, 0)).toBe(1);
		expect(moveToDeck(state, poolWithNat, natDodge, 0)).toBe(0);
	});
});

describe('counters', () => {
	it('counts the main deck and side deck XP', () => {
		const state = freshState();
		moveToDeck(state, pool, manualDexterity, 0);
		moveToDeck(state, pool, seekingAnswers2, 0);
		expect(mainDeckCount(state.decks[0])).toBe(2);
		expect(sideDeckXp(state.decks[0], (code) => resolver.resolve(code))).toBe(4);
	});
});

describe('buildEligibility', () => {
	it('marks class access per investigator', () => {
		const state = freshState();
		const roster = investigatorsForSetup(state.setup, allCards).filter((c) =>
			state.setup.investigators.includes(c.code)
		);
		const eligibility = buildEligibility(roster, pool);
		// Switchblade (Rogue 0): not Roland (Guardian/Seeker), yes Wendy (Survivor/Rogue 0-2).
		expect(eligibility.get('01544')).toEqual([false, true]);
		// Manual Dexterity is a neutral skill: eligible for everyone.
		expect(eligibility.get('01592')).toEqual([true, true]);
	});
});
