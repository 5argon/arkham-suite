import { beforeEach, describe, expect, it } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches, stopOptions } from '../src/graph/model.js';
import { _resetSimulateCaches, simulatePlan, type Plan, type PlanStep } from '../src/solver/simulate.js';
import { evaluatePlan } from '../src/solver/evaluate.js';
import type { Constraint } from '../src/types.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
	_resetSimulateCaches();
});

const prologue = (introId = 'trust_flint'): PlanStep => ({ node: 'london', optionId: 'R1', introChoiceIds: [introId] });
const plan = (...steps: PlanStep[]): Plan => ({ steps });
const scenarioRes = (node: string) => stopOptions(node).find((o) => o.kind === 'scenario')!.optionId;
const status = (t: ReturnType<typeof simulatePlan>, c: Constraint) => evaluatePlan(t, [c])[0]!.status;

describe('evaluatePlan', () => {
	it('get_key is met when the plan grants the key to an investigator', () => {
		const t = simulatePlan(plan(prologue()));
		expect(status(t, { kind: 'get_key', key: 'the_eye_of_ravens', bearer: 'investigator' })).toBe('met');
		expect(status(t, { kind: 'get_key', key: 'the_mirroring_blade', bearer: 'investigator' })).toBe('unmet');
	});

	it('visit_scenario reflects whether the scenario was played', () => {
		const t = simulatePlan(plan(prologue(), { node: 'marrakesh', optionId: 'R1' }));
		expect(status(t, { kind: 'visit_scenario', scenario: 'dead_heat' })).toBe('met');
		expect(status(t, { kind: 'visit_scenario', scenario: 'sanguine_shadows' })).toBe('unmet');
	});

	it('a negated constraint is satisfied when the base condition is NOT met', () => {
		const t = simulatePlan(plan(prologue()));
		expect(status(t, { kind: 'visit_scenario', scenario: 'dead_heat', negate: true })).toBe('met');
	});

	it('avoid_scenario is met while the scenario is unvisited and fails once it is played', () => {
		const without = simulatePlan(plan(prologue()));
		const withIt = simulatePlan(plan(prologue(), { node: 'marrakesh', optionId: 'R1' }));
		expect(status(without, { kind: 'avoid_scenario', scenario: 'dead_heat' })).toBe('met');
		expect(status(withIt, { kind: 'avoid_scenario', scenario: 'dead_heat' })).toBe('unmet');
	});

	it('campaign_log is met when a chosen pre-scenario choice records the flag', () => {
		const res = scenarioRes('anchorage');
		const t = simulatePlan(plan(prologue(), { node: 'anchorage', optionId: res, introChoiceIds: ['deal_with_thorne'] }));
		expect(status(t, { kind: 'campaign_log', flag: 'the_cell_made_a_deal_with_thorne' })).toBe('met');
	});

	it('reach_ending reflects the predicted Trial branch', () => {
		const t = simulatePlan(plan(prologue()));
		expect(status(t, { kind: 'reach_ending', trial: 'trial_2' })).toBe('met');
		expect(status(t, { kind: 'reach_ending', trial: 'trial_6' })).toBe('unmet');
	});

	it('chaos_mix checks the concrete final bag', () => {
		const t = simulatePlan(plan(prologue()));
		const fs = t.finalState;
		expect(status(t, { kind: 'chaos_mix', tablet: fs.tablet, elderThing: fs.elderThing })).toBe('met');
		expect(status(t, { kind: 'chaos_mix', tablet: fs.tablet + 1 })).toBe('unmet');
	});

	it('chaos_balanced is unmet (not in_position) when the bag is uneven', () => {
		// trust_flint shifts the 1T/1E start to 0T/2E — definitively unbalanced, not play-dependent.
		const t = simulatePlan(plan(prologue('trust_flint')));
		expect(t.finalState.tablet).not.toBe(t.finalState.elderThing);
		expect(status(t, { kind: 'chaos_balanced' })).toBe('unmet');
	});
});
