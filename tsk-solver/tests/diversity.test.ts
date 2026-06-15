import { beforeEach, describe, expect, it } from 'vitest';
import { solve } from '../src/solver/solve.js';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import type { Recipe, SolveOutput } from '../src/types.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

function ok(out: SolveOutput): Extract<SolveOutput, { ok: true }> {
	expect(out.ok).toBe(true);
	if (!out.ok) throw new Error('expected ok');
	return out;
}
const distinctCounts = (recipes: Recipe[]) => new Set(recipes.map((r) => r.scenarioCount));

describe('§4.6 route diversity across scenario counts', () => {
	it('a single 1-scenario constraint yields routes spanning many scenario counts (not just the minimum)', () => {
		// Regression: a lone constraint used to return only the 3–4 cheapest scenario counts because a
		// time-minimizing A* never reaches longer routes; constructive padding now seeds higher counts.
		const out = ok(solve({ constraints: [{ kind: 'scenario_resolution', scenario: 'on_thin_ice', resolution: 'R2' }], preferences: { maxResults: 80 } }));
		const counts = distinctCounts(out.recipes);
		expect(counts.size).toBeGreaterThanOrEqual(4); // e.g. 3,4,5,6,7
		expect(Math.max(...counts)).toBeGreaterThanOrEqual(6); // the 6+ plans players typically pick
	});

	it('an unconstrained solve also spans several scenario counts', () => {
		const out = ok(solve({ constraints: [], preferences: { maxResults: 80 } }));
		expect(distinctCounts(out.recipes).size).toBeGreaterThanOrEqual(3);
	});

	it('results show many distinct scenario sets, and a mid-count bucket varies (different icons)', () => {
		const out = ok(solve({ constraints: [{ kind: 'visit_scenario', scenario: 'dealings_in_the_dark' }], preferences: { maxResults: 80 } }));
		const sig = (r: Recipe) => [...r.playedScenarios].sort().join(',');
		// Good overall icon variety across the result set.
		expect(new Set(out.recipes.map(sig)).size).toBeGreaterThanOrEqual(8);
		// A mid bucket (not the structurally-fixed minimum, nor the all-scenarios maximum) should itself
		// offer more than one distinct scenario set.
		const byCount = new Map<number, Recipe[]>();
		for (const r of out.recipes) byCount.set(r.scenarioCount, [...(byCount.get(r.scenarioCount) ?? []), r]);
		const counts = [...byCount.keys()].sort((a, b) => a - b);
		const mid = counts.filter((c) => c > counts[0]! && c < counts[counts.length - 1]!);
		expect(mid.some((c) => new Set(byCount.get(c)!.map(sig)).size > 1)).toBe(true);
	});
});
