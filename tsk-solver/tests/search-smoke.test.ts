import { beforeEach, describe, expect, it } from 'vitest';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import { expandConstraints } from '../src/solver/waypoints.js';
import { search } from '../src/solver/search.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

const cfg = { timeCap: 35, scenarioCap: 99, goalLimit: 50, maxStates: 30000, maxDepth: 14 };

describe('search smoke', () => {
	it('finds a winning route for finale_outcome WIN', () => {
		const exp = expandConstraints([{ kind: 'finale_outcome', outcome: 'WIN' }]);
		const routes = search(exp, cfg);
		expect(routes.length).toBeGreaterThan(0);
		const r = routes[0]!;
		expect(r.finalState.node).toBe('tunguska');
		expect(r.finalState.timePassed).toBeGreaterThanOrEqual(15);
	});

	it('finds the Understand Aliki chain route ending at Tunguska', () => {
		const exp = expandConstraints([{ kind: 'narrative_chain', id: 'understand_aliki' }]);
		const routes = search(exp, cfg);
		expect(routes.length).toBeGreaterThan(0);
		const stops = routes[0]!.steps.map((s) => s.option.node);
		for (const n of ['sydney', 'kathmandu', 'london', 'rome', 'bermuda_triangle', 'tunguska']) {
			expect(stops).toContain(n);
		}
	});
});
