import { describe, expect, it } from 'vitest';
import { evaluatePlan } from '../src/solver/evaluate.js';
import { simulatePlan, type Plan, type PlanStep } from '../src/solver/simulate.js';
import type { Constraint } from '../src/types.js';
import { resetAll } from './helpers.js';

resetAll();

const prologue: PlanStep = { location: 'london', fileCode: '5-A', choices: { 'RR.intro.travel': 'RR.intro.accept', 'RR.resolution': 'RR.R1' } };
const plan = (...steps: PlanStep[]): Plan => ({ steps });
const check = (t: ReturnType<typeof simulatePlan>, c: Constraint) => evaluatePlan(t, [c])[0]!;

describe('evaluatePlan', () => {
	it('visit_file + get_key for the prologue Eye of Ravens', () => {
		const t = simulatePlan(plan(prologue));
		expect(check(t, { kind: 'visit_file', fileCode: '5-A' }).status).toBe('met');
		expect(check(t, { kind: 'visit_file', fileCode: '11-B' }).status).toBe('unmet');
		expect(check(t, { kind: 'get_key', key: 'eyeOfRavens', bearer: 'investigator' }).status).toBe('met');
	});

	it('resolution constraint matches the chosen option', () => {
		const t = simulatePlan(plan(prologue, { location: 'marrakesh', fileCode: '11-B', choices: { 'DH.resolution': 'DH.R4' } }));
		expect(check(t, { kind: 'resolution', fileCode: '11-B', optionId: 'DH.R4' }).status).toBe('met');
		expect(check(t, { kind: 'resolution', fileCode: '11-B', optionId: 'DH.R1' }).status).toBe('unmet');
	});

	it('campaign_log goal reflects recorded entries', () => {
		const t = simulatePlan(plan(prologue));
		expect(check(t, { kind: 'campaign_log', entryId: 'log.notSeenRedGlovedMan' }).status).toBe('met');
	});

	it('negated goal inverts a met/unmet result', () => {
		const t = simulatePlan(plan(prologue));
		expect(check(t, { kind: 'visit_file', fileCode: '11-B', negate: true }).status).toBe('met');
		expect(check(t, { kind: 'visit_file', fileCode: '5-A', negate: true }).status).toBe('unmet');
	});

	it('reach_judgment is met when the predicted finale matches', () => {
		const t = simulatePlan(plan(prologue));
		expect(check(t, { kind: 'reach_judgment', judgment: 'COTK.judgment.liability' }).status).toBe('met');
		expect(check(t, { kind: 'reach_judgment', judgment: 'COTK.judgment.overthrow' }).status).toBe('unmet');
	});

	it('chaos_mix reports the final bag', () => {
		const t = simulatePlan(plan(prologue));
		const c = check(t, { kind: 'chaos_mix', tablet: 2, elderThing: 0 });
		expect(c.detail?.id).toBe('check_chaos_mix');
	});
});
