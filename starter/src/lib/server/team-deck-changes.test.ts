import { describe, expect, it } from 'vitest';

import { starterDeck } from '$lib/starter-content';

import { applyDeckChanges, overlapTable } from './team-deck-changes';

const source = { slots: { a: 2, b: 2 }, sideSlots: { c: 1 } };

describe('applyDeckChanges', () => {
	it('replaces copies, dropping a card once none are left', () => {
		expect(applyDeckChanges(source, [{ remove: 'a', add: 'd', copies: 2 }], 'test').slots).toEqual({
			b: 2,
			d: 2
		});
		expect(applyDeckChanges(source, [{ remove: 'a', add: 'b', copies: 1 }], 'test').slots).toEqual({
			a: 1,
			b: 3
		});
	});

	it('changes the side deck only when asked', () => {
		const result = applyDeckChanges(source, [{ remove: 'c', copies: 1, side: true }], 'test');
		expect(result.sideSlots).toEqual({});
		expect(result.slots).toEqual(source.slots);
	});

	it('leaves the source alone', () => {
		applyDeckChanges(source, [{ remove: 'a', add: 'd', copies: 2 }], 'test');
		expect(source.slots).toEqual({ a: 2, b: 2 });
	});

	it('refuses a change its source no longer allows', () => {
		expect(() => applyDeckChanges(source, [{ remove: 'a', copies: 3 }], 'test')).toThrow('test');
		expect(() => applyDeckChanges(source, [{ remove: 'z', copies: 1 }], 'test')).toThrow('test');
	});
});

describe('overlapTable', () => {
	const deck = (series: string, slug: string) =>
		starterDeck('hungry-colquhoun', series, slug)!.primary;
	const rambo = deck('ch2-starter-guide', 'rancher-rambo');
	const gun = deck('ch2-starter-guide', 'got-yourself-a-gun');
	const sand = deck('ch2-starter-guide', 'pocket-sand');

	it('is empty when nothing overlaps or changes', () => {
		expect(overlapTable([{ source: rambo, changes: [] }])).toBe('');
	});

	it('shows what each copy became, replacements first', () => {
		const table = overlapTable([
			{ source: gun, changes: [] },
			{ source: rambo, changes: [{ remove: '12094', add: '12080', copies: 2 }] },
			{ source: sand, changes: [] }
		]);
		expect(table).toContain('Unexpected Courage <span class="small">(Core Set 2026 #94)</span>');
		expect(table).toContain('Used 6 / 4 Available');
		expect(table.match(/→/g)).toHaveLength(2);
		expect(table.match(/\(No Change\)/g)?.length).toBeGreaterThanOrEqual(4);
		expect(table).toContain('Slippery</span></strong> <span class="small">(Core Set 2026 #80)</span>');
		expect(table.indexOf('→')).toBeLessThan(table.indexOf('(No Change)'));
	});

	it('names the Investigator Deck a printing comes from', () => {
		const table = overlapTable([
			{ source: rambo, changes: [{ remove: '12094', add: '60569', copies: 1 }] }
		]);
		expect(table).toContain('(Miguel de la Cruz #19)');
	});
});
