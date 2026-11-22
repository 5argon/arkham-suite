import { describe, expect, it } from 'vitest';
import { FHV_PASSPORTS } from '$lib/campaign/campaigns/fhv';
import { TDC_OUTCOMES } from '$lib/campaign/campaigns/tdc';
import { FHV_SCENARIO_VIEWS } from './fhv/fhv-views';
import { TDC_SCENARIO_VIEWS } from './tdc/tdc-views';

/** A passport label table can only show what the precompute counts. */
describe('scenario passport views read counted keys', () => {
	it('FHV', () => {
		for (const [scenario, groups] of Object.entries(FHV_SCENARIO_VIEWS)) {
			const counted = new Set(FHV_PASSPORTS[scenario]?.keys);
			for (const { key } of groups.flatMap((g) => g.stats))
				expect(counted, `${scenario} ${key}`).toContain(key);
			expect(groups.flatMap((g) => g.stats).length, scenario).toBe(counted.size);
		}
	});

	it('TDC', () => {
		for (const [scenario, view] of Object.entries(TDC_SCENARIO_VIEWS)) {
			const counted = new Set(TDC_OUTCOMES[scenario]?.flat());
			for (const s of view.groups.flatMap((g) => g.stats))
				if ('key' in s) expect(counted, `${scenario} ${s.key}`).toContain(s.key);
		}
	});
});
