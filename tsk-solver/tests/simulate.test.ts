import { beforeEach, describe, expect, it } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches, stopOptions } from '../src/graph/model.js';
import { _resetSimulateCaches, simulatePlan, type Plan, type PlanStep } from '../src/solver/simulate.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
	_resetSimulateCaches();
});

/** Prologue step: Riddles and Rain R1 at London with the chosen Flint intro. */
const prologue = (introId = 'trust_flint'): PlanStep => ({ node: 'london', optionId: 'R1', introChoiceIds: [introId] });
const plan = (...steps: PlanStep[]): Plan => ({ steps });
const kinds = (problems: { kind: string }[]) => problems.map((p) => p.kind);
const scenarioRes = (node: string) => stopOptions(node).find((o) => o.kind === 'scenario')!.optionId;

describe('simulatePlan', () => {
	it('an empty plan is the initial state', () => {
		const t = simulatePlan(plan());
		expect(t.steps).toHaveLength(0);
		expect(t.scenarioCount).toBe(0);
		expect(t.finalState.timePassed).toBe(0);
		expect(t.keysHeld).toEqual([]);
		expect(t.keyTheftRisk).toBe(false);
	});

	it('a legal prologue grants the Eye of Ravens, marks time, and counts as a scenario', () => {
		const t = simulatePlan(plan(prologue()));
		expect(t.steps).toHaveLength(1);
		expect(t.steps[0]!.problems).toEqual([]);
		expect(t.steps[0]!.timeAfter).toBe(2); // Flint intro (1) + R1 (1)
		expect(t.keysHeld).toContain('the_eye_of_ravens');
		expect(t.scenarioCount).toBe(1);
	});

	it('The Safehouse auto-resolves to "no entry" (no blade) without the Dancing Mad passphrase + theta', () => {
		// Auto-evaluated interlude: early arrival picks the fallback (SH3) — no requires_unmet, no blade.
		const t = simulatePlan(plan(prologue(), { node: 'ybor_city', optionId: 'SH2' }));
		expect(kinds(t.steps[1]!.problems)).not.toContain('requires_unmet');
		expect(t.keysHeld).not.toContain('the_mirroring_blade');
	});

	it('flags a locked-scenario step but still keeps it (best-effort continue)', () => {
		const t = simulatePlan(plan({ node: 'bermuda_triangle', optionId: 'R1' }));
		expect(t.steps).toHaveLength(1);
		expect(kinds(t.steps[0]!.problems)).toContain('node_locked');
	});

	it('flags re-stopping at a node (stop-lockout)', () => {
		const t = simulatePlan(plan(prologue(), { node: 'london', optionId: 'R1' }));
		expect(kinds(t.steps[1]!.problems)).toContain('stop_locked');
	});

	it('flags a ticket jump with no ticket in hand and charges 0 travel', () => {
		const t = simulatePlan(plan(prologue(), { node: 'marrakesh', optionId: 'R1', useTicket: true }));
		expect(t.steps[1]!.travelCost).toBe(0);
		expect(kinds(t.steps[1]!.problems)).toContain('ticket_unavailable');
	});

	it('costs a reachable mid scenario by shortest path (no lock problem)', () => {
		const t = simulatePlan(plan(prologue(), { node: 'marrakesh', optionId: 'R1' }));
		expect(Number.isFinite(t.steps[1]!.travelCost)).toBe(true);
		expect(kinds(t.steps[1]!.problems)).not.toContain('node_locked');
	});

	it('attaches a finale prediction to a Congress step even before Tunguska unlocks', () => {
		const win = stopOptions('tunguska').find((o) => o.outcome === 'WIN_CAMPAIGN')!;
		const t = simulatePlan(plan(prologue(), { node: 'tunguska', optionId: win.optionId }));
		const fin = t.steps[1]!;
		expect(fin.finale).toBeDefined();
		expect(fin.finale!.branch).toMatch(/^trial_/);
		expect(kinds(fin.problems)).toContain('node_locked'); // locked this early
	});

	it('reports a time-tier level for a scenario with tiers', () => {
		const t = simulatePlan(plan(prologue(), { node: 'havana', optionId: scenarioRes('havana') }));
		expect(t.steps[1]!.scenarioLevel).toBeDefined();
	});

	it('the chosen pre-scenario choice is applied (prologue Flint vs Independent shift the bag oppositely)', () => {
		// Bag starts 1 Tablet / 1 Elder Thing. trust_flint = "-bless +curse"; independent = "-curse +bless".
		const flint = simulatePlan(plan(prologue('trust_flint')));
		const indep = simulatePlan(plan(prologue('independent')));
		expect(flint.finalState.elderThing).toBeGreaterThan(indep.finalState.elderThing);
		expect(indep.finalState.tablet).toBeGreaterThan(flint.finalState.tablet);
	});

	it('a pre-scenario choice records its campaign-log flag', () => {
		const res = scenarioRes('anchorage');
		const withDeal = simulatePlan(plan(prologue(), { node: 'anchorage', optionId: res, introChoiceIds: ['deal_with_thorne'] }));
		expect(withDeal.finalState.flags.has('the_cell_made_a_deal_with_thorne')).toBe(true);
	});
});
