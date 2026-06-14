import { beforeEach, describe, expect, it } from 'vitest';
import { solve } from '../src/solver/solve.js';
import { resolveRecipe } from '../src/i18n/recipe.js';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import type { Recipe, SolveOutput } from '../src/types.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

/** Stop/play/finale node ids in order (excludes pure travel/status steps). */
function stopNodes(recipe: Recipe): string[] {
	return recipe.steps.filter((s) => s.type === 'play' || s.type === 'stop' || s.type === 'finale').map((s) => s.node!);
}
function expectOk(out: SolveOutput): Extract<SolveOutput, { ok: true }> {
	expect(out.ok).toBe(true);
	if (!out.ok) throw new Error('expected ok');
	return out;
}

describe('§11.2 golden chain — Understand Aliki', () => {
	it('produces a state-legal route hitting Sydney, Kathmandu, London(27-H), Rome, Bermuda Triangle, ending at Tunguska', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'narrative_chain', id: 'understand_aliki' }] }));
		const recipe = out.recipes[0]!;
		const stops = stopNodes(recipe);
		for (const n of ['sydney', 'kathmandu', 'london', 'rome', 'bermuda_triangle', 'tunguska']) {
			expect(stops, `missing ${n}`).toContain(n);
		}
		expect(stops[stops.length - 1]).toBe('tunguska');
		// State gate (§11.7): the London 27-H revisit must come AFTER Sydney (code_27H_written) and Rome after London.
		const sydneyIdx = stops.indexOf('sydney');
		const londonRevisitIdx = stops.lastIndexOf('london');
		const romeIdx = stops.indexOf('rome');
		const btIdx = stops.indexOf('bermuda_triangle');
		expect(sydneyIdx).toBeLessThan(londonRevisitIdx);
		expect(londonRevisitIdx).toBeLessThan(romeIdx);
		expect(romeIdx).toBeLessThan(btIdx);
	});
});

describe('§11.3 ally chain — Dr. Irawan', () => {
	it('meets Irawan at Rio or Perth before Manokwari, recruiting the ally', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'recruit_ally', ally: 'dr_dewi_irawan' }] }));
		const recipe = out.recipes.find((r) => r.alliesRecruited.includes('dr_dewi_irawan')) ?? out.recipes[0]!;
		const stops = stopNodes(recipe);
		const manokwariIdx = stops.indexOf('manokwari');
		expect(manokwariIdx).toBeGreaterThanOrEqual(0);
		const metIdx = Math.min(
			...['rio_de_janiero', 'perth'].map((n) => (stops.indexOf(n) === -1 ? Infinity : stops.indexOf(n))),
		);
		expect(metIdx).toBeLessThan(manokwariIdx);
		expect(recipe.alliesRecruited).toContain('dr_dewi_irawan');
	});
});

describe('§11.4 impossibility — Speed Demon + Understand Aliki', () => {
	it('returns ok:false with a time-floor proof whose floor exceeds 17', () => {
		const out = solve({
			constraints: [
				{ kind: 'narrative_chain', id: 'understand_aliki' },
				{ kind: 'achievement', id: 'speed_demon' },
			],
		});
		expect(out.ok).toBe(false);
		if (out.ok) return;
		expect(out.proof.kind).toBe('time_floor');
		expect(out.proof.cap).toBe(17);
		expect(out.proof.floor).toBeGreaterThan(17);
	});
});

describe('§11.5 scenario-count impossibility', () => {
	it('six scenario-keys with maxScenarios:4 returns a scenario-count proof', () => {
		const out = solve({
			constraints: [
				{ kind: 'get_key', key: 'the_eye_of_ravens' },
				{ kind: 'get_key', key: 'the_last_blossom' },
				{ kind: 'get_key', key: 'the_light_of_pharos' },
				{ kind: 'get_key', key: 'the_sable_glass' },
				{ kind: 'get_key', key: 'the_weeping_lady' },
				{ kind: 'get_key', key: 'the_twisted_antiprism' },
			],
			preferences: { maxScenarios: 4 },
		});
		expect(out.ok).toBe(false);
		if (out.ok) return;
		expect(out.proof.kind).toBe('scenario_count');
		expect(out.proof.floor).toBeGreaterThan(4);
	});
});

describe('diversity by scenario count — finale WIN', () => {
	it('returns many distinct routes spanning multiple scenario counts', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'finale_outcome', outcome: 'WIN' }] }));
		expect(out.recipes.length).toBeGreaterThan(5); // "a lot more" than the old cap of 5
		// All routes are pairwise distinct.
		const sigs = out.recipes.map((r) => stopNodes(r).join('>') + '|' + r.steps.map((s) => s.resolution ?? '').join(','));
		expect(new Set(sigs).size).toBe(sigs.length);
		// Multiple scenario-count buckets are represented, so players can pick how many to play.
		const counts = new Set(out.recipes.map((r) => r.scenarioCount));
		expect(counts.size).toBeGreaterThan(1);
		// Each recipe reports the combat scenarios it plays (for icon display + grouping).
		expect(out.recipes.every((r) => r.playedScenarios.length === r.scenarioCount)).toBe(true);
	});

	it('honors the per-scenario-count cap', () => {
		const out = expectOk(
			solve({ constraints: [{ kind: 'finale_outcome', outcome: 'WIN' }], preferences: { maxPerScenarioCount: 3 } }),
		);
		const byCount = new Map<number, number>();
		for (const r of out.recipes) byCount.set(r.scenarioCount, (byCount.get(r.scenarioCount) ?? 0) + 1);
		for (const n of byCount.values()) expect(n).toBeLessThanOrEqual(3);
	});
});

describe('§11.11 resolution menu semantics', () => {
	it('marks a specific resolution required (with reason) and presence-only as any-resolution-ok', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'achievement', id: 'whats_in_a_name' }] }));
		const recipe = out.recipes[0]!;
		const deadHeat = recipe.steps.find((s) => s.node === 'marrakesh' && (s.type === 'play' || s.type === 'stop'));
		expect(deadHeat).toBeDefined();
		expect(deadHeat!.resolution).toBe('R3');
		expect(deadHeat!.resolutionRequired).toBe(true);
		expect(deadHeat!.reason).toBeDefined();
	});

	it('a visit-only scenario constraint marks the stop as any-resolution-ok', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'visit_scenario', scenario: 'sanguine_shadows' }] }));
		const recipe = out.recipes[0]!;
		const ba = recipe.steps.find((s) => s.node === 'buenos_aires' && (s.type === 'play' || s.type === 'stop'));
		expect(ba).toBeDefined();
		expect(ba!.resolutionRequired).toBe(false);
	});
});

describe('negation (general "not" flag)', () => {
	it('a negated scenario constraint produces no recipe that stops there', () => {
		const out = expectOk(
			solve({
				constraints: [
					{ kind: 'get_key', key: 'the_shade_reaper' },
					{ kind: 'avoid_scenario', scenario: 'sanguine_shadows', negate: true },
				],
			}),
		);
		for (const recipe of out.recipes) {
			expect(stopNodes(recipe)).not.toContain('buenos_aires');
		}
	});
});

describe('earnable achievements', () => {
	it('reports Speed-Demon-eligible and other achievements per recipe', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'finale_outcome', outcome: 'WIN' }] }));
		const recipe = out.recipes[0]!;
		expect(Array.isArray(recipe.earnableAchievements)).toBe(true);
		// The fastest WIN should at least flag achievements it qualifies for (e.g. speed_demon if <=17).
		if (recipe.totalTime <= 17) {
			expect(recipe.earnableAchievements.some((a) => a.id === 'speed_demon' && a.status === 'guaranteed')).toBe(true);
		}
	});
});

describe('i18n resolution', () => {
	it('resolves a recipe to concrete strings', () => {
		const out = expectOk(solve({ constraints: [{ kind: 'finale_outcome', outcome: 'WIN' }] }));
		const resolved = resolveRecipe(out.recipes[0]!, 'en');
		expect(resolved.steps.every((s) => s.reason === undefined || typeof s.reason === 'string')).toBe(true);
		expect(resolved.steps.some((s) => typeof s.reason === 'string' && s.reason.length > 0)).toBe(true);
	});
});
