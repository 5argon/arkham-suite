import { describe, expect, it } from 'vitest';

const sources = import.meta.glob('./**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const SCAN_COMPONENT = /\bCardScanFull\w*\b/;
const FLEXIBLE_DISPLAY = /<FlexibleCardDisplay\b[^>]*>/g;

describe('card collections in profile widgets', () => {
	it('reads the widget sources', () => {
		expect(sources['./_primitives/CardScanWall.svelte']).toMatch(SCAN_COMPONENT);
	});

	it('show card scans only through CardScanWall, which turns into card rows on narrow screens', () => {
		const offenders = Object.entries(sources)
			.filter(([path]) => !path.endsWith('/_primitives/CardScanWall.svelte'))
			.filter(([, src]) => SCAN_COMPONENT.test(src))
			.map(([path]) => path);
		expect(offenders).toEqual([]);
	});

	it('use FlexibleCardDisplay only as its fixed icon grid, since its scans view does not shrink', () => {
		const offenders = Object.entries(sources).flatMap(([path, src]) =>
			[...src.matchAll(FLEXIBLE_DISPLAY)]
				.filter(([tag]) => !/defaultViewMode="icons"/.test(tag) || !/\bhideViewMode\b/.test(tag))
				.map(() => path)
		);
		expect(offenders).toEqual([]);
	});
});
