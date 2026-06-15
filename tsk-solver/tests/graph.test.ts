import { beforeEach, describe, expect, it } from 'vitest';
import { distance, isNodeUnlocked, reachableFrom, _resetGraphMemo } from '../src/graph/graph.js';
import { applyStop, initialState, keysHeldByInvestigator } from '../src/graph/state.js';
import { preChoicesAt, stopOptions, _resetModelCaches } from '../src/graph/model.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

describe('dynamic graph', () => {
	it('reaches all 27 initially-unlocked nodes from London', () => {
		const reach = reachableFrom(new Set(), 'london');
		expect(reach.get('london')).toBe(0);
		// 9 locked nodes are absent initially.
		expect(reach.size).toBe(27);
	});

	it('treats locked nodes as absent until their flag is set', () => {
		expect(isNodeUnlocked('tunguska', new Set())).toBe(false);
		expect(distance(new Set(), 'london', 'tunguska')).toBe(Infinity);
		const flags = new Set(['code_59Z_written']);
		expect(isNodeUnlocked('tunguska', flags)).toBe(true);
		expect(distance(flags, 'kathmandu', 'tunguska')).toBe(1);
	});

	it('London is always travel-accessible despite being status:locked', () => {
		expect(isNodeUnlocked('london', new Set())).toBe(true);
	});

	it('does not route through a locked node', () => {
		// Bermuda Triangle is locked; reaching it must be impossible without its flag.
		expect(distance(new Set(), 'london', 'bermuda_triangle')).toBe(Infinity);
	});
});

describe('state transitions', () => {
	it('prologue R1 grants the Eye of Ravens to an investigator and marks time', () => {
		const start = initialState();
		const opts = stopOptions('london');
		const r1 = opts.find((o) => o.optionId === 'R1' && o.isPrologue)!;
		expect(r1).toBeDefined();
		// Pre-scenario choices are now explicit: pick the Flint intro (time 1), then play R1 (time 1).
		const flint = preChoicesAt('london').find((c) => c.id === 'trust_flint')!;
		const { state } = applyStop(start, r1, 0, false, [flint]);
		expect(state.timePassed).toBe(2);
		expect(keysHeldByInvestigator(state)).toContain('the_eye_of_ravens');
		expect(state.visitedStops.has('london')).toBe(true);
	});

	it('crossing box 15 fires Beta and unlocks Tunguska (code_59Z_written)', () => {
		const start = { ...initialState(), timePassed: 14 };
		const opts = stopOptions('marrakesh');
		const r1 = opts.find((o) => o.optionId === 'R1')!; // Dead Heat R1, time 1
		const { state, firedReports } = applyStop(start, r1, 0);
		expect(state.timePassed).toBe(15);
		expect(firedReports).toContain('beta');
		expect(state.flags.has('code_59Z_written')).toBe(true);
	});
});
