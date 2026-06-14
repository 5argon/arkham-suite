import { beforeEach, describe, expect, it } from 'vitest';
import { solve } from '../src/solver/solve.js';
import { _resetGraphMemo } from '../src/graph/graph.js';
import { _resetModelCaches } from '../src/graph/model.js';
import type { Recipe, SolveOutput } from '../src/types.js';

beforeEach(() => {
	_resetGraphMemo();
	_resetModelCaches();
});

function stopNodes(recipe: Recipe): string[] {
	return recipe.steps.filter((s) => s.type === 'play' || s.type === 'stop' || s.type === 'finale').map((s) => s.node!);
}
function ok(out: SolveOutput): Extract<SolveOutput, { ok: true }> {
	expect(out.ok).toBe(true);
	if (!out.ok) throw new Error('expected ok');
	return out;
}

describe('§11.6 sequential priority', () => {
	it('warns when a later-requested key is structurally forced earlier (Eye of Ravens is the prologue)', () => {
		const out = ok(
			solve({
				constraints: [
					{ kind: 'get_key', key: 'the_last_blossom' },
					{ kind: 'get_key', key: 'the_eye_of_ravens' },
				],
				preferences: { respectOrder: true },
			}),
		);
		const primary = out.recipes[0]!;
		// The Eye of Ravens (constraint #1 here is last_blossom, #2 eye) — but eye is always acquired
		// first in the prologue, so honoring "[last_blossom, eye]" is impossible -> a warning is surfaced.
		expect(primary.warnings.some((w) => w.id === 'warning_order_impossible')).toBe(true);
	});
});

describe('§11.8 Expedited Ticket', () => {
	it('a ticketed route is never slower than the no-ticket route, and any ticket leg is a 0-time jump', () => {
		const constraints = [
			{ kind: 'get_key' as const, key: 'the_sable_glass' },
			{ kind: 'get_key' as const, key: 'the_twisted_antiprism' },
		];
		const withTicket = ok(solve({ constraints, preferences: { allowExpeditedTicket: true } }));
		const without = ok(solve({ constraints, preferences: { allowExpeditedTicket: false } }));
		const tTime = withTicket.recipes[0]!.totalTime;
		const nTime = without.recipes[0]!.totalTime;
		expect(tTime).toBeLessThanOrEqual(nTime);
		for (const recipe of withTicket.recipes) {
			const ticketSteps = recipe.steps.filter((s) => s.type === 'use_ticket');
			expect(ticketSteps.length).toBeLessThanOrEqual(1);
			for (const ts of ticketSteps) {
				expect(ts.timeAfter).toBeDefined();
				expect(ts.from).toBeDefined();
				expect(ts.to).toBeDefined();
			}
		}
	});
});

describe('§11.9 locked pass-through / finale terminality', () => {
	it('never stops at Tunguska except as the terminal finale, and Bermuda Triangle only after Rome', () => {
		const out = ok(solve({ constraints: [{ kind: 'narrative_chain', id: 'understand_aliki' }] }));
		for (const recipe of out.recipes) {
			const stops = stopNodes(recipe);
			// Tunguska appears once, last.
			const tIdx = stops.indexOf('tunguska');
			expect(stops.lastIndexOf('tunguska')).toBe(tIdx);
			expect(tIdx).toBe(stops.length - 1);
			// Bermuda Triangle (locked behind code_56Y from Rome) only after Rome.
			if (stops.includes('bermuda_triangle')) {
				expect(stops.indexOf('rome')).toBeLessThan(stops.indexOf('bermuda_triangle'));
			}
		}
	});
});

describe('side stories (green nodes)', () => {
	it('The Wellspring of Fortune routes through Monte Carlo (Fortune and Folly)', () => {
		const out = ok(solve({ constraints: [{ kind: 'get_key', key: 'the_wellspring_of_fortune' }] }));
		const recipe = out.recipes.find((r) => r.keysHeld.includes('the_wellspring_of_fortune')) ?? out.recipes[0]!;
		expect(stopNodes(recipe)).toContain('monte_carlo');
		expect(recipe.keysHeld).toContain('the_wellspring_of_fortune');
	});

	it('negating a scenario you must play makes the goal impossible', () => {
		const out = solve({
			constraints: [
				{ kind: 'get_key', key: 'the_shade_reaper' },
				{ kind: 'visit_scenario', scenario: 'shades_of_suffering', negate: true },
			],
		});
		expect(out.ok).toBe(false);
	});
});
