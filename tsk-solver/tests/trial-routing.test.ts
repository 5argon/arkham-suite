import { beforeEach, describe, expect, it } from 'vitest';
import { solve } from '../src/solver/solve.js';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import { predictTrial, trialPlan } from '../src/solver/trial.js';
import type { Recipe, SolveOutput } from '../src/types.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

function ok(out: SolveOutput): Extract<SolveOutput, { ok: true }> {
	expect(out.ok).toBe(true);
	if (!out.ok) throw new Error(`expected ok, got proof: ${out.ok === false ? out.proof.conflict : ''}`);
	return out;
}
function stopNodes(recipe: Recipe): string[] {
	return recipe.steps.filter((s) => s.type === 'play' || s.type === 'stop' || s.type === 'finale').map((s) => s.node!);
}

describe('§7 Trial outcome routing — plan self-consistency', () => {
	// The plan's own required flag-set must already predict its branch (the post-filter guarantees the
	// rest, but the lean route — required flags only — must be a valid member of the branch).
	for (const branch of ['trial_2', 'trial_3', 'trial_4', 'trial_5', 'trial_6', 'trial_7']) {
		it(`${branch}: predictTrial(required flags) === ${branch}`, () => {
			const plan = trialPlan(branch)!;
			expect(plan).toBeTruthy();
			const pred = predictTrial(new Set(plan.required), 0, 0);
			expect(pred.branch).toBe(branch);
		});
	}

	// Forbidden flags must never overlap required flags (would be self-contradictory).
	for (const branch of ['trial_2', 'trial_3', 'trial_4', 'trial_5', 'trial_6', 'trial_7']) {
		it(`${branch}: required and forbidden flag-sets are disjoint`, () => {
			const plan = trialPlan(branch)!;
			const forb = new Set(plan.forbidden);
			expect(plan.required.filter((f) => forb.has(f))).toEqual([]);
		});
	}
});

describe('§7 Trial outcome routing — the solver actually engineers the vote', () => {
	for (const branch of ['trial_3', 'trial_4', 'trial_5']) {
		it(`reach_ending ${branch} returns routes whose predicted ending is ${branch}`, () => {
			const out = ok(solve({ constraints: [{ kind: 'reach_ending', trial: branch }], preferences: { maxResults: 12 } }));
			expect(out.recipes.length).toBeGreaterThan(0);
			// Every returned recipe must land on the requested branch.
			for (const r of out.recipes) expect(r.endingBranch).toBe(branch);
			// And the constraint is reported as satisfied.
			expect(out.recipes[0]!.satisfies.some((s) => s.kind === 'reach_ending')).toBe(true);
		});
	}

	it('overthrow (trial_3) routes through the coalition scenarios (La Chica Roja, Desi, Masai)', () => {
		const out = ok(solve({ constraints: [{ kind: 'reach_ending', trial: 'trial_3' }], preferences: { maxResults: 6 } }));
		const nodes = new Set(stopNodes(out.recipes[0]!));
		// La Chica Roja (Sanguine Shadows @ Buenos Aires) + Desi (Dancing Mad @ Havana) + Masai (Great Work / Infernal Machinery).
		expect(nodes.has('buenos_aires')).toBe(true);
		expect(nodes.has('havana')).toBe(true);
		expect(nodes.has('bermuda') || nodes.has('nairobi')).toBe(true);
	});

	it('join (trial_4) routes through Thorne (On Thin Ice) and a Masai scenario', () => {
		const out = ok(solve({ constraints: [{ kind: 'reach_ending', trial: 'trial_4' }], preferences: { maxResults: 6 } }));
		const nodes = new Set(stopNodes(out.recipes[0]!));
		expect(nodes.has('anchorage')).toBe(true); // On Thin Ice → deal with Thorne
		expect(nodes.has('bermuda') || nodes.has('nairobi')).toBe(true); // The Great Work / Infernal Machinery → Masai
	});
});

describe('§7 Trial outcome routing — exclusivity', () => {
	it('two contradictory finale outcomes give an honest logical proof (not a false time-floor)', () => {
		const out = solve({
			constraints: [
				{ kind: 'reach_ending', trial: 'trial_3' },
				{ kind: 'reach_ending', trial: 'trial_4' },
			],
		});
		// Overthrow and Join are mutually exclusive coalitions — no route satisfies both.
		expect(out.ok).toBe(false);
		if (!out.ok) expect(out.proof.kind).toBe('logical');
	});

	it('the same finale outcome requested twice is not treated as contradictory', () => {
		const out = ok(
			solve({
				constraints: [
					{ kind: 'reach_ending', trial: 'trial_5' },
					{ kind: 'reach_ending', trial: 'trial_5' },
				],
				preferences: { maxResults: 4 },
			}),
		);
		for (const r of out.recipes) expect(r.endingBranch).toBe('trial_5');
	});
});

describe('§7 Finale scenario_version accepts the whole Trial group', () => {
	// v.II is reached by overthrow/join/asset (trials 3/4/5), v.III by knows-truth/destroyed (6/7),
	// v.I by liability (2). A version request must accept any branch in its group.
	const cases: [string, string[]][] = [
		['v1', ['trial_2']],
		['v2', ['trial_3', 'trial_4', 'trial_5']],
		['v3', ['trial_6', 'trial_7']],
	];
	for (const [version, group] of cases) {
		it(`finale version ${version} yields routes within ${group.join('/')} and credits the constraint`, () => {
			const out = ok(
				solve({
					constraints: [{ kind: 'scenario_version', scenario: 'congress_of_the_keys', version }],
					preferences: { maxResults: 8 },
				}),
			);
			expect(out.recipes.length).toBeGreaterThan(0);
			for (const r of out.recipes) expect(group).toContain(r.endingBranch);
			expect(out.recipes[0]!.satisfies.some((s) => s.kind === 'scenario_version')).toBe(true);
		});
	}
});
