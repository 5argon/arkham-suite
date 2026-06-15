import { describe, expect, it } from 'vitest';
import { ALL_FINALE_BRANCHES, finaleBranchGroup, predictTrial, trialPlan } from '../src/solver/trial.js';

describe('predictTrial', () => {
	it('low-engagement default is the liability outcome (trial_2)', () => {
		expect(predictTrial(new Set(), 0, 0).branch).toBe('trial_2');
	});

	it('knowing the Coterie\'s true nature forces trial_6', () => {
		expect(predictTrial(new Set(['the_cell_knows_the_true_nature_of_the_coterie']), 0, 0).branch).toBe('trial_6');
	});

	it('three or more eerily-silent voters force trial_7', () => {
		const flags = new Set(['thorne_disappeared', 'havent_seen_the_last_of_aliki', 'havent_seen_the_last_of_desi']);
		expect(predictTrial(flags, 0, 0).branch).toBe('trial_7');
	});

	it('each engineered trial plan actually reaches its branch', () => {
		for (const branch of ['trial_3', 'trial_4', 'trial_5', 'trial_6', 'trial_7']) {
			const plan = trialPlan(branch)!;
			expect(plan).toBeTruthy();
			expect(predictTrial(new Set(plan.required), 0, 0).branch).toBe(branch);
		}
	});

	it('epilogue tracks trust vs deception when not joined', () => {
		expect(predictTrial(new Set(), 1, 0).epilogue).toBe('permanent_position');
		expect(predictTrial(new Set(), 0, 1).epilogue).toBe('dismantled');
	});

	it('joining the Coterie (Trial 4) overrides to the "work together" epilogue', () => {
		const plan = trialPlan('trial_4')!;
		const p = predictTrial(new Set(plan.required), 5, 0); // trust would say permanent, but joining wins
		expect(p.branch).toBe('trial_4');
		expect(p.epilogue).toBe('agreed_to_work_together');
	});
});

describe('finale branch groups', () => {
	it('groups the overthrow/join/asset and truth/destroyed outcomes', () => {
		expect(finaleBranchGroup('trial_3')).toEqual(expect.arrayContaining(['trial_3', 'trial_4', 'trial_5']));
		expect(finaleBranchGroup('trial_6')).toEqual(expect.arrayContaining(['trial_6', 'trial_7']));
	});

	it('enumerates every campaign ending', () => {
		expect(ALL_FINALE_BRANCHES).toEqual(expect.arrayContaining(['trial_2', 'trial_3', 'trial_4', 'trial_5', 'trial_6', 'trial_7']));
	});
});
