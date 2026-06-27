import { describe, it, expect } from 'vitest';
import { deckExperience, xpRangeTier } from './deck-experience';

describe('xpRangeTier', () => {
	it('bands totals at the tier boundaries', () => {
		expect(xpRangeTier(0)?.tier).toBe(1);
		expect(xpRangeTier(9)?.tier).toBe(1);
		expect(xpRangeTier(10)?.tier).toBe(2);
		expect(xpRangeTier(19)?.tier).toBe(2);
		expect(xpRangeTier(20)?.tier).toBe(3);
		expect(xpRangeTier(29)?.tier).toBe(3);
		expect(xpRangeTier(30)?.tier).toBe(4);
		expect(xpRangeTier(39)?.tier).toBe(4);
		expect(xpRangeTier(40)?.tier).toBe(5);
		expect(xpRangeTier(49)?.tier).toBe(5);
	});
	it('returns null at/over the 50-XP cap (illegal)', () => {
		expect(xpRangeTier(50)).toBeNull();
		expect(xpRangeTier(99)).toBeNull();
	});
	it('reports the additional random basic weaknesses per tier', () => {
		expect(xpRangeTier(5)?.weaknesses).toBe(0);
		expect(xpRangeTier(15)?.weaknesses).toBe(1);
		expect(xpRangeTier(45)?.weaknesses).toBe(4);
	});
});

describe('deckExperience', () => {
	const xp = new Map<string, number>([
		['lvl0', 0], // level-0 card → not counted
		['lvl2', 2],
		['lvl5', 5],
		['story', 0] // weakness/story (xp undefined→0 in caller) → not counted
	]);

	it('sums printed xp×qty over cards with xp>=1, across both slot maps', () => {
		const json = JSON.stringify({
			slots: { lvl0: 2, lvl2: 2, lvl5: 1 }, // 0 + 4 + 5 = 9
			ignoreDeckLimitSlots: { story: 1, lvl2: 3 } // 0 + 6 = 6
		});
		expect(deckExperience(json, xp)).toBe(15);
	});

	it('does NOT double exceptional/customizable cards (printed xp only)', () => {
		// A single lvl5 card counts as 5, never 10.
		expect(deckExperience(JSON.stringify({ slots: { lvl5: 1 } }), xp)).toBe(5);
	});

	it('returns 0 for malformed JSON', () => {
		expect(deckExperience('not json', xp)).toBe(0);
	});
});
