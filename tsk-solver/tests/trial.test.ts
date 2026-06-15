import { describe, expect, it } from 'vitest';
import { predictFinale } from '../src/solver/trial.js';
import { resetAll, stateWith } from './helpers.js';

resetAll();

describe('predictFinale', () => {
	it('an empty table → liability (yeas win), version v1, epilogue permanent (0 vs 0)', () => {
		const f = predictFinale(stateWith());
		expect(f.judgment).toBe('COTK.judgment.liability');
		expect(f.version).toBe('COTK.v1');
		expect(f.nayWins).toBe(false);
		expect(f.epilogue).toBe('EP.permanent');
	});

	it('knowing the Coterie’s true nature overrides to "spared" (version v3)', () => {
		const f = predictFinale(stateWith(['log.knowsTrueNature']));
		expect(f.judgment).toBe('COTK.judgment.spared');
		expect(f.version).toBe('COTK.v3');
	});

	it('three eerily-silent members → destroyed from within', () => {
		// Red-Gloved Man is always silent; Thorne disappeared + Aliki unseen add two more.
		const f = predictFinale(stateWith(['log.thorneDisappeared', 'log.notSeenAliki']));
		expect(f.silent).toBeGreaterThanOrEqual(3);
		expect(f.judgment).toBe('COTK.judgment.destroyed');
	});

	it('the join coalition (Thorne + Tuwile + Claret Knight nay) → join, epilogue joined', () => {
		// claretKnight + ece vote nay by default; deal w/ Thorne + Tuwile + Desi(real) push nays over the top.
		const f = predictFinale(stateWith(['log.dealWithThorne', 'log.tuwileOnYourSide', 'log.desiInDebt'], ['desiReal']));
		expect(f.nayWins).toBe(true);
		expect(f.judgment).toBe('COTK.judgment.join');
		expect(f.epilogue).toBe('EP.joined');
	});

	it('Foundation-Trust ≥ Cell-Deception → permanent position at the epilogue', () => {
		const f = predictFinale(stateWith(['log.assistingSirry', 'log.toldTruthTaylor']));
		expect(f.trust).toBeGreaterThanOrEqual(f.deception);
		// liability ending (yeas win) but trust wins the tally → permanent.
		expect(f.epilogue).toBe('EP.permanent');
	});
});
