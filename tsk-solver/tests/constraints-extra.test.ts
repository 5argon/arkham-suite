import { beforeEach, describe, expect, it } from 'vitest';
import { solve } from '../src/solver/solve.js';
import { catalog } from '../src/catalog.js';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import type { Recipe, SolveOutput } from '../src/types.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

function ok(out: SolveOutput): Extract<SolveOutput, { ok: true }> {
	expect(out.ok).toBe(true);
	if (!out.ok) throw new Error(`expected ok, got ${out.ok === false ? out.proof.kind : ''}`);
	return out;
}
const stopNodes = (r: Recipe) => r.steps.filter((s) => s.type === 'play' || s.type === 'stop').map((s) => s.node!);

describe('campaign_log constraint (replaces narrative chains)', () => {
	it('Understand Aliki = the aliki_is_on_your_side log, routed via the whistle chain', () => {
		const out = ok(solve({ constraints: [{ kind: 'campaign_log', flag: 'aliki_is_on_your_side' }], preferences: { maxResults: 4 } }));
		const nodes = new Set(stopNodes(out.recipes[0]!));
		// Without a Trace (bermuda_triangle) sets the log; its unlock chain pulls in the whistle waypoints.
		expect(nodes.has('bermuda_triangle')).toBe(true);
		expect(out.recipes[0]!.satisfies.some((s) => s.kind === 'campaign_log')).toBe(true);
	});

	it('the catalog exposes the full set of campaign-log entries (not just a handful)', () => {
		expect(catalog().campaignLogs.length).toBeGreaterThan(20);
	});
});

describe('special_delivery constraint (Foundation Intel is a quest, not a deck ally)', () => {
	it('Foundation Intel is not offered as a recruitable ally', () => {
		expect(catalog().allies.some((a) => a.id === 'foundation_intel')).toBe(false);
	});

	it('routes receive → deliver (in order) and upgrades a chaos token', () => {
		const out = ok(solve({ constraints: [{ kind: 'special_delivery' }], preferences: { maxResults: 4 } }));
		const r = out.recipes[0]!;
		const sd = r.steps.filter((s) => (s.node === 'tokyo' || s.node === 'lagos') && (s.type === 'stop' || s.type === 'play'));
		const ids = sd.map((s) => s.resolution);
		expect(ids).toContain('receive');
		expect(ids).toContain('deliver');
		expect(ids.indexOf('receive')).toBeLessThan(ids.indexOf('deliver'));
		expect(r.freebies.some((f) => f.id === 'freebie_chaos')).toBe(true);
		expect(r.satisfies.some((s) => s.kind === 'special_delivery')).toBe(true);
	});
});

describe('scenario_level constraint (time-tier difficulty)', () => {
	for (const level of [1, 2, 3]) {
		it(`Dealings in the Dark Lv.${level} is entered within that tier's time window`, () => {
			const out = ok(
				solve({ constraints: [{ kind: 'scenario_level', scenario: 'dealings_in_the_dark', level }], preferences: { maxResults: 3 } }),
			);
			for (const r of out.recipes) {
				const step = r.steps.find((s) => s.scenario === 'dealings_in_the_dark');
				expect(step?.scenarioLevel?.params?.level).toBe(level);
			}
		});
	}

	it('the catalog lists levels with effect labels for time-tiered scenarios', () => {
		const cat = catalog();
		expect(cat.levelScenarios.some((s) => s.id === 'dealings_in_the_dark')).toBe(true);
		expect(cat.levels['dealings_in_the_dark']?.length).toBe(4);
	});
});
