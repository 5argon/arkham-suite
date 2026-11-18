import { describe, expect, it } from 'vitest';
import { getFile } from '../src/data/load.js';
import { resolveFile } from '../src/graph/model.js';
import { resetAll, stateWith } from './helpers.js';

resetAll();

/** Resolve a file and return the chosen entry for one decision. */
const chosenFor = (fileCode: string, decisionId: string, recorded: string[], entryTime: number) => {
	const r = resolveFile(getFile(fileCode)!, {}, stateWith(recorded), entryTime, undefined);
	return r.chosen.find((c) => c.decisionId === decisionId)!;
};

describe('conditional_outcome alternatives (non-fired sibling branches)', () => {
	it('Agent Quinn (49-R, RH.meet): when she vanishes, surfaces the branches that kept her', () => {
		// time ≥ 20 ⇒ RH.vanished fires; the two "fewer than 20 time" branches did not.
		const c = chosenFor('49-R', 'RH.meet', [], 22);
		expect(c.option.id).toBe('RH.vanished');
		expect(c.selectable).toBe(false);
		const altIds = (c.alternatives ?? []).map((a) => a.option.id).sort();
		expect(altIds).toEqual(['RH.distrusts', 'RH.trusts']);
		// Both alternatives required time < 20, so neither holds at time 22.
		expect(c.alternatives!.every((a) => !a.conditionHolds)).toBe(true);
	});

	it("Agent Quinn: the fired branch is excluded from its own alternatives", () => {
		const c = chosenFor('49-R', 'RH.meet', ['log.toldTruthTaylor'], 5);
		expect(c.option.id).toBe('RH.trusts');
		expect((c.alternatives ?? []).map((a) => a.option.id)).not.toContain('RH.trusts');
	});

	it('Nairobi early success (54-W, IM.meet): count branch exposes the path you missed', () => {
		// Fewer than 3 standings ⇒ Tuwile flees; the early-success ally branch (needs 3+) is the alternative.
		const flees = chosenFor('54-W', 'IM.meet', ['log.laChicaOnYourSide'], 5);
		expect(flees.option.id).toBe('IM.flees');
		const ally = flees.alternatives!.find((a) => a.option.id === 'IM.ally')!;
		expect(ally).toBeDefined();
		expect(ally.conditionHolds).toBe(false); // only 1 of 6 recorded

		// Three standings ⇒ IM.ally fires; IM.flees is now the unmet alternative.
		const won = chosenFor('54-W', 'IM.meet', ['log.laChicaOnYourSide', 'log.aidedKnight', 'log.alikiOnYourSide'], 5);
		expect(won.option.id).toBe('IM.ally');
		expect(won.alternatives!.find((a) => a.option.id === 'IM.flees')!.conditionHolds).toBe(false);
	});

	it('player-pickable (selectable) decisions carry no alternatives', () => {
		// The prologue's accept/decline is a player choice — the dropdown already shows the options.
		const r = resolveFile(getFile('5-A')!, { 'RR.intro.travel': 'RR.intro.accept' }, stateWith(), 5, 'london');
		for (const c of r.chosen.filter((x) => x.selectable)) expect(c.alternatives).toBeUndefined();
	});
});
