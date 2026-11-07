import { describe, expect, it } from 'vitest';

import { balancedRecentCounts, type RecentRowShape } from './recent';

const written: RecentRowShape = { href: '/review/card/1', entry: {}, cards: [{ card: {} }] };
const shortVideo: RecentRowShape = { entry: { title: 'A short title' }, cards: [{ card: {} }] };
const bigVideo: RecentRowShape = {
	entry: { title: 'A title long enough that it wraps onto a second line here' },
	cards: [{ card: {} }, { card: {} }, { card: {} }, { card: {} }]
};

describe('recent lists side by side', () => {
	it('shows fewer of the taller rows so both lists end about as tall', () => {
		const left = Array(8).fill(written);
		const right = [shortVideo, bigVideo, shortVideo, shortVideo, shortVideo, shortVideo];
		const [l, r] = balancedRecentCounts([left, right]);
		expect(l).toBe(5);
		expect(r).toBeLessThan(5);
		expect(r).toBeGreaterThanOrEqual(2);
	});

	it('shows up to five of a list on its own, or of lists alike', () => {
		expect(balancedRecentCounts([Array(9).fill(shortVideo)])).toEqual([5]);
		expect(balancedRecentCounts([Array(9).fill(written), Array(9).fill(written)])).toEqual([5, 5]);
	});

	it('never shows fewer than two', () => {
		expect(balancedRecentCounts([[written], Array(6).fill(bigVideo)])).toEqual([1, 2]);
	});
});
