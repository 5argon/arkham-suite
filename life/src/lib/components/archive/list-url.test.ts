import { describe, expect, it } from 'vitest';
import {
	activeFilterCount,
	draftsFromUrl,
	listParam,
	pageOf,
	toggleDraft,
	withFilters,
	withoutFilters
} from './list-url';

const url = new URL('https://x/archive?name=zea&camp=notz,dwl&page=3&pc=2');

describe('list url', () => {
	it('parses list params and the page', () => {
		expect(listParam(url, 'camp')).toEqual(['notz', 'dwl']);
		expect(listParam(url, 'who')).toEqual([]);
		expect(pageOf(url)).toBe(3);
		expect(pageOf(new URL('https://x/archive?page=abc'))).toBe(1);
		expect(activeFilterCount(url, ['camp', 'pc', 'who'])).toBe(3);
	});

	it('toggles drafts and applies them back on page 1', () => {
		let drafts = draftsFromUrl(url, ['camp', 'pc'] as const);
		drafts = toggleDraft(drafts, 'camp', 'dwl');
		drafts = toggleDraft(drafts, 'pc', '1');
		const sp = new URLSearchParams(withFilters(url, drafts));
		expect(sp.get('camp')).toBe('notz');
		expect(sp.get('pc')).toBe('2,1');
		expect(sp.get('page')).toBe('1');
		expect(sp.get('name')).toBe('zea');
	});

	it('clears the given facets only', () => {
		const sp = new URLSearchParams(withoutFilters(url, ['camp', 'pc']));
		expect(sp.has('camp') || sp.has('pc')).toBe(false);
		expect(sp.get('name')).toBe('zea');
	});
});
