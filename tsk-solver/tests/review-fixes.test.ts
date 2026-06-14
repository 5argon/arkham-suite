import { beforeEach, describe, expect, it } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import { predictTrial } from '../src/solver/trial.js';
import { expandConstraints } from '../src/solver/waypoints.js';
import { timeFloor } from '../src/solver/timefloor.js';
import { solve } from '../src/solver/solve.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

describe('review fix: trial overthrow vote consistency (#1)', () => {
	it('routes to Trial 3 (overthrow) when La Chica Roja, Ece, Desi all vote nay — including the watcher-nay case', () => {
		// La Chica Roja votes nay via havent_seen_the_last_of_the_sanguine_watcher (the case the old
		// code wrongly excluded). Ece nay (default), Desi nay (in your debt), plus enough other nays.
		const flags = new Set<string>([
			'havent_seen_the_last_of_the_sanguine_watcher', // Roja nay, Watcher yea
			'desi_is_in_your_debt', // Desi nay
			'the_cell_made_a_deal_with_thorne', // Thorne nay
			'tuwile_masai_is_on_your_side', // Masai nay
			'the_cell_aided_the_knight', // Knight nay
			'aliki_is_on_your_side', // Aliki nay
			'tzu_san_niang_is_under_your_sway', // Tzu abstain (reduce yeas)
		]);
		const trial = predictTrial(flags, 0, 5);
		// Roja+Ece+Desi all nay => overthrow.
		expect(trial.trial).toBe(3);
		expect(trial.nay).toBeGreaterThan(trial.yea);
	});
});

describe('review fix: negated get_key respects investigator bearer (#6)', () => {
	it('does not exclude routes where an enemy bears the key when only investigator-bearing is negated', () => {
		// "NOT (Eye of Ravens held by an investigator)" should still allow routes (the prologue can
		// give it to the Red-Gloved Man instead). The query stays satisfiable.
		const out = solve({
			constraints: [{ kind: 'get_key', key: 'the_eye_of_ravens', bearer: 'investigator', negate: true }],
		});
		expect(out.ok).toBe(true);
	});
});

describe('review fix: time-floor is admissible under shared-node requirements (#2)', () => {
	it('does not over-count when a key + ally are obtained at the same node (Manokwari M2)', () => {
		// dr_dewi_irawan (ally) and the_ruinous_chime (key) are both granted by Metamorphosis M2 at
		// Manokwari in one stop. The floor must not double-count that single stop's time.
		const both = timeFloor(
			expandConstraints([
				{ kind: 'recruit_ally', ally: 'dr_dewi_irawan' },
				{ kind: 'get_key', key: 'the_ruinous_chime' },
			]),
		);
		const allyOnly = timeFloor(expandConstraints([{ kind: 'recruit_ally', ally: 'dr_dewi_irawan' }]));
		// Adding the co-located key requirement must not inflate the floor (same single stop).
		expect(both.floor).toBeLessThanOrEqual(allyOnly.floor);
	});
});
