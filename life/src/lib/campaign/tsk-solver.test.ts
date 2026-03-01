import { describe, expect, it } from 'vitest';
import { applyTskTierResolutionInference, resolutionsReachableInLevel } from './tsk-solver';

describe('applyTskTierResolutionInference — Dead Heat time tier ⇄ resolution', () => {
	const LATE = 'DH.t.late';
	const R5 = 'R5';

	it('infers R5 when the final time tier is recorded but the resolution was omitted', () => {
		const { resolutions, tiers } = applyTskTierResolutionInference({}, { 'dead_heat.level': LATE });
		expect(resolutions.dead_heat).toBe(R5);
		expect(tiers['dead_heat.level']).toBe(LATE); // unchanged
	});

	it('infers the final time tier when R5 is recorded but the tier was omitted', () => {
		const { resolutions, tiers } = applyTskTierResolutionInference({ dead_heat: R5 }, {});
		expect(tiers['dead_heat.level']).toBe(LATE);
		expect(resolutions.dead_heat).toBe(R5); // unchanged
	});

	it('leaves both untouched when both are already recorded', () => {
		const resIn = { dead_heat: R5 };
		const tierIn = { 'dead_heat.level': LATE };
		const { resolutions, tiers } = applyTskTierResolutionInference(resIn, tierIn);
		expect(resolutions).toBe(resIn); // same reference — nothing to infer
		expect(tiers).toBe(tierIn);
	});

	it('does NOT overwrite an explicitly recorded different resolution', () => {
		// Kept all six targets but chose a non-skip outcome — keep the player's input.
		const { resolutions } = applyTskTierResolutionInference(
			{ dead_heat: 'R1' },
			{ 'dead_heat.level': LATE },
		);
		expect(resolutions.dead_heat).toBe('R1');
	});

	it('does NOT overwrite an explicitly recorded different time tier', () => {
		const { tiers } = applyTskTierResolutionInference({ dead_heat: R5 }, { 'dead_heat.level': 'DH.t.15' });
		expect(tiers['dead_heat.level']).toBe('DH.t.15');
	});

	it('is a no-op for an unrelated tier/resolution and other scenarios', () => {
		const resIn = { dealings_in_the_dark: 'R2' };
		const tierIn = { 'dead_heat.level': 'DH.t.early' };
		const { resolutions, tiers } = applyTskTierResolutionInference(resIn, tierIn);
		expect(resolutions).toBe(resIn);
		expect(tiers).toBe(tierIn);
		expect(resolutions.dead_heat).toBeUndefined();
	});
});

describe('resolutionsReachableInLevel — Dead Heat final tier forces R5', () => {
	const ALL = ['no_resolution', 'R1', 'R2', 'R3', 'R4', 'R5'];

	it('narrows the 25+ time tier (DH.t.late) to only R5', () => {
		expect(resolutionsReachableInLevel('DH.t.late', ALL)).toEqual(['R5']);
	});

	it('drops R5 from the earlier tier (R5 is forced exclusively at the 25+ tier)', () => {
		expect(resolutionsReachableInLevel('DH.t.early', ALL)).toEqual([
			'no_resolution',
			'R1',
			'R2',
			'R3',
			'R4',
		]);
	});

	it("leaves another scenario's tier unchanged — the exclusion is decade-scoped", () => {
		// Dogs of War has no LEVEL gate (R5 is version-gated there), so a DOW tier keeps R5.
		expect(resolutionsReachableInLevel('DOW.t.early', ALL)).toEqual(ALL);
	});

	it('leaves an absent level unchanged', () => {
		expect(resolutionsReachableInLevel(undefined, ALL)).toEqual(ALL);
	});

	it('intersects with the provided set (only returns R5 if available)', () => {
		expect(resolutionsReachableInLevel('DH.t.late', ['no_resolution', 'R1'])).toEqual([]);
	});
});
