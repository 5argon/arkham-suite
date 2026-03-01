import { describe, expect, it } from 'vitest';
import { coterieVoteGuide, finaleInsights, predictFinale } from '../src/solver/trial.js';
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

describe('finaleInsights', () => {
	// A table where BOTH coalitions can be assembled: La Chica Roja (Sanguine Watcher unseen),
	// Ece + Desi (real, in debt) → overthrow trio nay; Thorne (deal) + Tuwile + Claret Knight (default) → join trio nay.
	const bothLogs = ['log.notSeenSanguineWatcher', 'log.desiInDebt', 'log.dealWithThorne', 'log.tuwileOnYourSide'];

	it('exposes per-member votes with the log that changed each non-default vote', () => {
		const ins = finaleInsights(stateWith(['log.dealWithThorne']));
		const thorne = ins.members.find((m) => m.member === 'thorne');
		expect(thorne?.vote).toBe('nay');
		expect(thorne?.isDefault).toBe(false);
		expect(thorne?.viaLog).toBe('log.dealWithThorne');
		// Red-Gloved Man is always silent by his default row.
		expect(ins.members.find((m) => m.member === 'redGlovedMan')?.isDefault).toBe(true);
	});

	it('overthrow/join path checks report which mandatory voters are missing', () => {
		const ins = finaleInsights(stateWith(['log.dealWithThorne'])); // only Thorne nay, no coalition
		expect(ins.join.requiredNay).toEqual(expect.arrayContaining(['thorne', 'tuwileMasai', 'claretKnight']));
		expect(ins.join.missingNay).toContain('tuwileMasai');
		expect(ins.join.eligible).toBe(false);
		expect(ins.overthrow.missingNay).toContain('laChicaRoja');
	});

	it('when both coalitions are nay, the player may overthrow, join, or decline (asset)', () => {
		const ins = finaleInsights(stateWith(bothLogs, ['desiReal']));
		expect(ins.prediction.nayWins).toBe(true);
		expect(ins.overthrow.eligible).toBe(true);
		expect(ins.join.eligible).toBe(true);
		expect(ins.attemptOptions).toEqual(['overthrow', 'join', 'asset']);
	});

	it('the "you may" attempt assertion switches the judgment (overthrow → join → asset)', () => {
		expect(predictFinale(stateWith(bothLogs, ['desiReal'])).judgment).toBe('COTK.judgment.overthrow');
		expect(predictFinale(stateWith(bothLogs, ['desiReal', 'finaleAttempt:join'])).judgment).toBe('COTK.judgment.join');
		expect(predictFinale(stateWith(bothLogs, ['desiReal', 'finaleAttempt:asset'])).judgment).toBe('COTK.judgment.asset');
	});

	it('tallies the Foundation-Trust / Cell-Deception lists with the counts matching the prediction', () => {
		const ins = finaleInsights(stateWith(['log.toldTruthTaylor', 'log.dealWithThorne', 'log.eceTrusts']));
		expect(ins.foundationTrust.filter((c) => c.met).length).toBe(ins.prediction.trust);
		expect(ins.cellDeception.filter((c) => c.met).length).toBe(ins.prediction.deception);
		expect(ins.foundationTrust.find((c) => c.log === 'log.toldTruthTaylor')?.met).toBe(true);
	});
});

describe('coterieVoteGuide', () => {
	const guide = coterieVoteGuide();
	const find = (m: string) => guide.find((g) => g.member === m);

	it('reports each member default vote and their distinct transitions', () => {
		// Desi: default Yea, can move to Nay (in debt + real) or eerily silent (unseen / impostor).
		const desi = find('desi');
		expect(desi?.defaultVote).toBe('yea');
		expect(desi?.transitions.map((t) => t.toVote).sort()).toEqual(['nay', 'silent']);
		const nay = desi?.transitions.find((t) => t.toVote === 'nay');
		expect(nay?.triggerLogs).toContain('log.desiInDebt');
		expect(nay?.boardStates).toContain('desiReal');
	});

	it('a member with multiple logs landing on the same vote merges them into one transition', () => {
		// La Chica Roja → Nay via either the Watcher unseen or the torment continuing.
		const chica = find('laChicaRoja');
		const nay = chica?.transitions.find((t) => t.toVote === 'nay');
		expect(nay?.triggerLogs).toEqual(expect.arrayContaining(['log.notSeenSanguineWatcher', 'log.watcherTormentContinues']));
	});

	it('the un-alliable members never reach a Nay (the Beast only ever shifts Yea→Abstain)', () => {
		const beast = find('beast');
		expect(beast?.defaultVote).toBe('yea');
		expect(beast?.transitions.every((t) => t.toVote !== 'nay')).toBe(true);
		// The Red-Gloved Man is always silent — no transitions at all.
		expect(find('redGlovedMan')?.transitions).toHaveLength(0);
	});
});
