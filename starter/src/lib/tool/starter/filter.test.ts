import { type CardCode, Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import type { PrebuiltTeamSummary } from '$lib/starter-content';

import {
	matchesInvestigators,
	pickRandom,
	type StarterFilterValue,
	tagChoices,
	teamHasTags
} from './filter';

const roland = '01001' as CardCode;
const daisy = '01002' as CardCode;
const skids = '01003' as CardCode;
const agnes = '01004' as CardCode;
const wendy = '01005' as CardCode;

function filter(investigators: CardCode[], mustIncludeAll: boolean): StarterFilterValue {
	return { products: new Set<Product>(), investigators: new Set(investigators), mustIncludeAll };
}

describe('pre-built team investigator filter', () => {
	it('matches any selected investigator by default', () => {
		expect(matchesInvestigators([roland, daisy], filter([roland, skids], false))).toBe(true);
	});

	it('requires every selected investigator when Must Include All is checked', () => {
		expect(matchesInvestigators([roland, daisy], filter([roland, daisy], true))).toBe(true);
		expect(matchesInvestigators([roland, daisy], filter([roland, skids], true))).toBe(false);
	});

	it('rejects more selected investigators than a four-player team can contain', () => {
		expect(
			matchesInvestigators(
				[roland, daisy, skids, agnes],
				filter([roland, daisy, skids, agnes, wendy], true)
			)
		).toBe(false);
	});

	it('does not match results when every investigator is deselected', () => {
		expect(matchesInvestigators([roland, daisy], filter([], false))).toBe(false);
		expect(matchesInvestigators([roland, daisy], filter([], true))).toBe(false);
	});
});

describe('pickRandom', () => {
	it('never repeats the previous pick when there is another choice', () => {
		for (let i = 0; i < 50; i++) {
			expect(pickRandom([roland, daisy], roland)).toBe(daisy);
		}
	});

	it('repeats the only item and returns null for nothing', () => {
		expect(pickRandom([roland], roland)).toBe(roland);
		expect(pickRandom([], null)).toBe(null);
	});
});

describe('pre-built team tags', () => {
	const entry = (...tags: string[]) => ({ tags }) as unknown as PrebuiltTeamSummary;
	const entries = [
		entry('HC Cross Series', '2C+2ID'),
		entry('HC Cross Series', '3C+1ID'),
		entry('HC Chapter 2 Core Only', '2C+0ID'),
		entry('HC Chapter 2 Core Only', '1C+1ID'),
		entry('HC Cross Series', '2C+2ID', 'Non-Adjacent Core'),
		entry('HC Cross Series', '2C+2ID', 'Adjacent Core')
	];

	it('offers series first, then mixes by player count with the most Core Set first', () => {
		expect(tagChoices(entries, []).map((choice) => choice.label)).toEqual([
			'HC Chapter 2 Core Only',
			'HC Cross Series',
			'2C+0ID',
			'1C+1ID',
			'3C+1ID',
			'2C+2ID',
			'Adjacent Core',
			'Non-Adjacent Core'
		]);
	});

	it('needs a team to have every tag in effect', () => {
		expect(teamHasTags(entries[0], ['HC Cross Series', '2C+2ID'])).toBe(true);
		expect(teamHasTags(entries[0], ['HC Cross Series', '3C+1ID'])).toBe(false);
		expect(teamHasTags(entries[0], [])).toBe(true);
	});

	it('offers only tags of the teams left, with what adding each would leave', () => {
		expect(tagChoices(entries, ['HC Cross Series'])).toEqual([
			{ label: '3C+1ID', count: 1 },
			{ label: '2C+2ID', count: 3 },
			{ label: 'Adjacent Core', count: 1 },
			{ label: 'Non-Adjacent Core', count: 1 }
		]);
	});
});
