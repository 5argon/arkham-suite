import { type CardCode, Product } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { matchesInvestigators, type StarterFilterValue } from './filter';

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
