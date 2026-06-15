import { describe, expect, it } from 'vitest';
import { simulatePlan, type Plan, type PlanStep } from '../src/solver/simulate.js';
import { resetAll } from './helpers.js';

resetAll();

const prologue = (intro = 'RR.intro.accept'): PlanStep => ({ location: 'london', fileCode: '5-A', choices: { 'RR.intro.travel': intro, 'RR.resolution': 'RR.R1' } });
const plan = (...steps: PlanStep[]): Plan => ({ steps });
const kinds = (problems: { kind: string }[]) => problems.map((p) => p.kind);

describe('simulatePlan', () => {
	it('an empty plan is the initial state', () => {
		const t = simulatePlan(plan());
		expect(t.steps).toHaveLength(0);
		expect(t.scenarioCount).toBe(0);
		expect(t.finalState.timePassed).toBe(0);
		expect(t.keysHeld).toEqual([]);
		expect(t.keyTheftRisk).toBe(false);
	});

	it('the prologue grants The Eye of Ravens to the cell, marks time, and counts as a scenario', () => {
		const t = simulatePlan(plan(prologue()));
		expect(t.steps[0]!.problems).toEqual([]);
		expect(t.steps[0]!.timeAfter).toBe(2); // travel intro (+1) + R1 (+1)
		expect(t.keysHeld).toContain('eyeOfRavens');
		expect(t.scenarioCount).toBe(1);
	});

	it('the trust vs deception intro shifts the chaos bag oppositely', () => {
		const trust = simulatePlan(plan(prologue('RR.intro.accept'))); // trust: −ET +Tablet
		const deceive = simulatePlan(plan(prologue('RR.intro.ownterms'))); // deception: −Tablet +ET
		expect(trust.finalState.tablet).toBeGreaterThan(deceive.finalState.tablet);
		expect(deceive.finalState.elderThing).toBeGreaterThan(trust.finalState.elderThing);
	});

	it('The Safehouse auto-resolves to "no entry" (no blade) before the passphrase + Θ', () => {
		const t = simulatePlan(plan(prologue(), { location: 'yborCity', fileCode: '52-U' }));
		expect(kinds(t.steps[1]!.problems)).not.toContain('requires_unmet');
		expect(t.finalState.keys.has('mirroringBlade')).toBe(false);
		expect(t.steps[1]!.chosen.some((c) => c.option.id === 'SAFE.out')).toBe(true);
	});

	it('flags travel to a locked node but still keeps the step (best-effort)', () => {
		const t = simulatePlan(plan(prologue(), { location: 'tunguska', fileCode: '59-Z', choices: { 'COTK.resolution': 'COTK.R1' } }));
		expect(kinds(t.steps[1]!.problems)).toContain('node_locked');
		expect(t.steps[1]!.finale).toBeDefined();
		expect(t.steps[1]!.campaignResult).toBe('win');
	});

	it('flags re-stopping at a non-start location (stop-lockout); London is exempt', () => {
		const t = simulatePlan(plan(prologue(), { location: 'london', fileCode: '27-H', choices: {} }));
		expect(kinds(t.steps[1]!.problems)).not.toContain('stop_locked'); // London hub is exempt
		const t2 = simulatePlan(plan(prologue(), { location: 'marrakesh', fileCode: '11-B', choices: { 'DH.resolution': 'DH.R4' } }, { location: 'marrakesh', fileCode: '11-B', travelOnly: false, choices: { 'DH.resolution': 'DH.R4' } }));
		expect(kinds(t2.steps[2]!.problems)).toContain('stop_locked');
	});

	it('a ticket jump with no ticket in hand charges 0 travel and is flagged', () => {
		const t = simulatePlan(plan(prologue(), { location: 'marrakesh', fileCode: '11-B', useTicket: true, choices: { 'DH.resolution': 'DH.R4' } }));
		expect(t.steps[1]!.travelCost).toBe(0);
		expect(kinds(t.steps[1]!.problems)).toContain('ticket_unavailable');
	});

	it('a reachable mid scenario costs shortest-path travel and is not locked', () => {
		const t = simulatePlan(plan(prologue(), { location: 'marrakesh', fileCode: '11-B', choices: { 'DH.resolution': 'DH.R4' } }));
		expect(t.steps[1]!.travelCost).toBeGreaterThan(0);
		expect(kinds(t.steps[1]!.problems)).not.toContain('node_locked');
	});

	it('an unresolvable resolution gate (DH.R3 needs Amaranth’s name) is flagged requires_unmet', () => {
		const t = simulatePlan(plan(prologue(), { location: 'marrakesh', fileCode: '11-B', choices: { 'DH.resolution': 'DH.R3' } }));
		expect(kinds(t.steps[1]!.problems)).toContain('requires_unmet');
	});

	it('a travel-only step relocates and burns time without stopping', () => {
		const t = simulatePlan(plan(prologue(), { location: 'marrakesh', fileCode: '', travelOnly: true }));
		expect(t.steps[1]!.travelOnly).toBe(true);
		expect(t.steps[1]!.location).toBe('marrakesh');
		expect(t.finalState.visitedStops.has('marrakesh')).toBe(false);
	});
});
