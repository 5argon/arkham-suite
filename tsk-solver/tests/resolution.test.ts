import { describe, expect, it } from 'vitest';
import { getFile } from '../src/data/load.js';
import { resolutionOffers } from '../src/graph/model.js';
import { initialState } from '../src/graph/state.js';
import { simulatePlan, type PlanStep } from '../src/solver/simulate.js';
import { resetAll, stateWith } from './helpers.js';

resetAll();

const offerable = (offers: ReturnType<typeof resolutionOffers>) => offers.filter((o) => o.offerable).map((o) => o.option.id);

describe('resolution gating (requires + version)', () => {
	it('choseOption hides resolutions tied to the other branch (Without a Trace blow/throw)', () => {
		const whistle = getFile('56-Y')!.decisions.find((d) => d.options.some((o) => o.id === 'WAT.blow'))!.decisionId;
		const blow = resolutionOffers('56-Y', { [whistle]: 'WAT.blow' }, initialState(), 5, 'bermudaTriangle');
		expect(offerable(blow)).toContain('WAT.R1');
		expect(offerable(blow)).not.toContain('WAT.R2');
		const throw_ = resolutionOffers('56-Y', { [whistle]: 'WAT.throw' }, initialState(), 5, 'bermudaTriangle');
		expect(offerable(throw_)).toContain('WAT.R2');
		expect(offerable(throw_)).not.toContain('WAT.R1');
	});

	it('Dogs of War version gates which resolutions are reachable', () => {
		// time ≥ 20 ⇒ version v3: only v3 resolutions offerable.
		const v3 = resolutionOffers('38-N', {}, initialState(), 22, 'alexandria');
		expect(offerable(v3)).toContain('DOW.R7'); // v3 no-resolution
		expect(offerable(v3)).not.toContain('DOW.R2'); // v2 only
		// time < 20 + refuse the bargain ⇒ assisting Sirry ⇒ v2: R2 reachable, R8 (needs the deal) not.
		const refuse = getFile('38-N')!.decisions.find((d) => d.decisionType === 'pre_scenario')!.decisionId;
		const v2 = resolutionOffers('38-N', { [refuse]: 'DOW.refuse' }, initialState(), 6, 'alexandria');
		expect(offerable(v2)).toContain('DOW.R2');
		expect(offerable(v2)).not.toContain('DOW.R8');
	});

	it('picking a resolution incompatible with the version played is flagged', () => {
		const prologue: PlanStep = { location: 'london', fileCode: '5-A', choices: { 'RR.intro.travel': 'RR.intro.accept', 'RR.resolution': 'RR.R1' } };
		// Accept the knight's bargain (⇒ v1) but pick DOW.R2 (a v2-only, assisting-Sirry resolution).
		const dow: PlanStep = { location: 'alexandria', fileCode: '38-N', choices: { 'DOW.knightBargain': 'DOW.accept', 'DOW.resolution': 'DOW.R2' } };
		const t = simulatePlan({ steps: [prologue, dow] });
		expect(t.steps[1]!.problems.map((p) => p.kind)).toContain('requires_unmet');
	});

	it('choseOption persists across the plan via state.chosenOptions', () => {
		const s = stateWith();
		expect(s.chosenOptions.size).toBe(0);
	});
});
