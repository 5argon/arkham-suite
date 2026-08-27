import { CardClass, Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { createCardResolver, getAllCards } from '../../card-data';
import {
	accessSummary,
	buildPool,
	classGroupFor,
	fixedItemsFor,
	investigatorsForSetup
} from './pool';
import type { EvergreenSetup } from './types';

const allCards = getAllCards();
const resolver = createCardResolver();

function setup(core: EvergreenSetup['core'], deckProducts: Product[] = []): EvergreenSetup {
	return { core, deckProducts, extraProducts: [], investigators: [] };
}

describe('buildPool', () => {
	it('keeps reprints from different products as separate stacks, like real cards', () => {
		const pool = buildPool(setup(Product.RevisedCoreSet, [Product.NathanielCho]), allCards);
		// Dodge exists in both the Revised Core box and Nathaniel's deck.
		expect(pool.get('01523')?.total).toBe(2);
		expect(pool.get('60113')?.total).toBe(2);
	});

	it('gives reprints the same title key so limits count across them', () => {
		const pool = buildPool(setup(Product.RevisedCoreSet, [Product.NathanielCho]), allCards);
		expect(pool.get('01523')!.titleKey).toBe(pool.get('60113')!.titleKey);
	});

	it('gives leveled versions and subname variants their own title keys', () => {
		const pool = buildPool(setup(Product.RevisedCoreSet, [Product.HarveyWalters]), allCards);
		// Beat Cop vs Beat Cop (2): different titles per level.
		expect(pool.get('01518')!.titleKey).not.toBe(pool.get('01528')!.titleKey);
		// Harvey's two Forbidden Tome (3) variants differ by subname.
		expect(pool.get('60229')!.titleKey).not.toBe(pool.get('60230')!.titleKey);
	});

	it('has 4x Manual Dexterity from the Revised Core box alone', () => {
		const pool = buildPool(setup(Product.RevisedCoreSet), allCards);
		expect(pool.get('01592')?.total).toBe(4);
	});

	it('never contains signatures, weaknesses, or investigators', () => {
		const pool = buildPool(setup(Product.RevisedCoreSet, [Product.NathanielCho]), allCards);
		for (const entry of pool.values()) {
			expect(entry.card.restrictions).toBeUndefined();
			expect(entry.card.weakness).toBeUndefined();
			expect(entry.card.xp).toBeDefined();
		}
	});

	it('iterates in canonical code order', () => {
		const pool = buildPool(setup(Product.CoreSet2026, [Product.CarolynFern]), allCards);
		const codes = [...pool.keys()];
		expect(codes).toEqual([...codes].sort((a, b) => a.localeCompare(b)));
	});
});

describe('classGroupFor', () => {
	const pool = buildPool(setup(Product.RevisedCoreSet, [Product.NathanielCho]), allCards);

	it('sweeps the same class and level zone within the same product', () => {
		const group = classGroupFor({
			pool,
			cardCode: '01520', // Machete, Guardian Lv0, rcore
			zone: 'main',
			mergeProducts: false
		});
		expect(group[0]).toBe('01520');
		expect(group).toContain('01518'); // Beat Cop, Guardian Lv0, rcore
		expect(group).not.toContain('01526'); // Extra Ammunition, Guardian Lv1
		expect(group).not.toContain('60105'); // Boxing Gloves, Guardian Lv0, but Nathaniel's product
	});

	it('widens the sweep to all products when merging', () => {
		const group = classGroupFor({
			pool,
			cardCode: '01520',
			zone: 'main',
			mergeProducts: true
		});
		expect(group).toContain('60105');
	});
});

describe('investigatorsForSetup', () => {
	it('lists the 5 core investigators for a bare Revised Core', () => {
		const roster = investigatorsForSetup(setup(Product.RevisedCoreSet), allCards);
		expect(roster.map((c) => c.code)).toEqual(['01501', '01502', '01503', '01504', '01505']);
	});

	it('adds prebuilt deck investigators when their products are included', () => {
		const roster = investigatorsForSetup(
			setup(Product.CoreSet2026, [Product.MarieLambeau]),
			allCards
		);
		expect(roster.map((c) => c.code)).toContain('60451');
	});
});

describe('accessSummary', () => {
	it('summarizes Daniela as Guardian 0-5, Survivor 0-2, Neutral 0-5', () => {
		const daniela = resolver.resolve('12001');
		const summary = accessSummary(daniela);
		expect(summary.special).toBe(false);
		expect(summary.lines).toEqual([
			{ cardClass: CardClass.Guardian, min: 0, max: 5 },
			{ cardClass: CardClass.Survivor, min: 0, max: 2 },
			{ cardClass: CardClass.Neutral, min: 0, max: 5 }
		]);
	});

	it('summarizes a prebuilt deck investigator as one class plus neutral', () => {
		const tommy = resolver.resolve('60151');
		const summary = accessSummary(tommy);
		expect(summary.special).toBe(false);
		expect(summary.lines).toEqual([
			{ cardClass: CardClass.Guardian, min: 0, max: 5 },
			{ cardClass: CardClass.Neutral, min: 0, max: 5 }
		]);
	});
});

describe('fixedItemsFor', () => {
	it('returns signatures then the random basic weakness placeholder', () => {
		const roland = resolver.resolve('01501');
		const items = fixedItemsFor(roland, resolver);
		expect(items.length).toBe(3);
		expect(items[2].code).toBe('01000');
	});

	it('handles investigators with more than 2 signature cards (André Patel)', () => {
		const andre = resolver.resolve('60351');
		const items = fixedItemsFor(andre, resolver);
		expect(items.length).toBe(5);
		expect(items[4].code).toBe('01000');
	});
});
