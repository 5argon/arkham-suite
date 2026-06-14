import { beforeEach, describe, expect, it } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import { solve } from '../src/solver/solve.js';
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
const TAKE_BACK_NODES = ['kabul', 'quito', 'san_juan', 'reykjavik'];
function takeBackStops(r: Recipe): number {
	return r.steps.filter((s) => s.type === 'stop' && s.node && TAKE_BACK_NODES.includes(s.node)).length;
}

// A long route that holds several investigator-borne Keys, forcing it past the Zeta box (time 20).
const LONG_KEY_RUN = [
	{ kind: 'get_key' as const, key: 'the_sable_glass', bearer: 'investigator' as const },
	{ kind: 'get_key' as const, key: 'the_light_of_pharos', bearer: 'investigator' as const },
	{ kind: 'get_key' as const, key: 'the_twisted_antiprism', bearer: 'investigator' as const },
	{ kind: 'get_key' as const, key: 'the_weeping_lady', bearer: 'investigator' as const },
];

describe('Zeta key theft + 14-C take-back', () => {
	it('warns about theft and (default) routes through one take-back site when holding Keys past Zeta', () => {
		const out = ok(solve({ constraints: LONG_KEY_RUN, preferences: { keyTakeBackSites: 1, maxPerScenarioCount: 3 } }));
		const r = out.recipes[0]!;
		expect(r.totalTime).toBeGreaterThanOrEqual(20); // crosses Zeta
		expect(r.warnings.some((w) => w.id === 'warning_key_theft')).toBe(true);
		expect(takeBackStops(r)).toBeGreaterThanOrEqual(1);
	});

	it('with take-back 0, it only warns (no recovery stop)', () => {
		const out = ok(solve({ constraints: LONG_KEY_RUN, preferences: { keyTakeBackSites: 0, maxPerScenarioCount: 3 } }));
		const r = out.recipes[0]!;
		expect(r.warnings.some((w) => w.id === 'warning_key_theft')).toBe(true);
		expect(takeBackStops(r)).toBe(0);
	});

	it('a fast route (under Zeta@20) never triggers theft or take-back', () => {
		// Just win quickly — the fastest routes finish before the Zeta box.
		const out = ok(solve({ constraints: [{ kind: 'finale_outcome', outcome: 'WIN' }], preferences: { keyTakeBackSites: 1 } }));
		const fast = out.recipes.filter((r) => r.totalTime < 20);
		expect(fast.length).toBeGreaterThan(0);
		for (const r of fast) {
			expect(takeBackStops(r)).toBe(0);
			expect(r.warnings.some((w) => w.id === 'warning_key_theft')).toBe(false);
		}
	});
});
