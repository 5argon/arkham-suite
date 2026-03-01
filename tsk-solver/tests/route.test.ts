import { describe, expect, it } from 'vitest';
import { mapRoute } from '../src/solver/route.js';
import { simulatePlan, type Plan, type PlanStep } from '../src/solver/simulate.js';
import { resetAll } from './helpers.js';

resetAll();

const prologue = (): PlanStep => ({ location: 'london', fileCode: '5-A', choices: { 'RR.intro.travel': 'RR.intro.accept', 'RR.resolution': 'RR.R1' } });
const plan = (...steps: PlanStep[]): Plan => ({ steps });
const toMarrakesh: PlanStep = { location: 'marrakesh', fileCode: '11-B', choices: { 'DH.resolution': 'DH.R4' } };

describe('mapRoute', () => {
	it('expands each leg to a hop path whose edge count equals the billed travel cost', () => {
		const t = simulatePlan(plan(prologue(), toMarrakesh));
		const r = mapRoute(t);
		expect(r.stopCount).toBe(2);
		expect(r.legs).toHaveLength(1); // London→London (prologue) is skipped; only London→Marrakesh draws.
		const leg = r.legs[0]!;
		expect(leg.from).toBe('london');
		expect(leg.to).toBe('marrakesh');
		expect(leg.hops[0]).toBe('london');
		expect(leg.hops.at(-1)).toBe('marrakesh');
		// The drawn hop-by-hop path must match the shortest-path cost simulate actually billed.
		expect(leg.hops.length - 1).toBe(t.steps[1]!.travelCost);
	});

	it('numbers stops in visit order; intermediates are pass-throughs, stops never are', () => {
		const t = simulatePlan(plan(prologue(), toMarrakesh));
		const r = mapRoute(t);
		expect(r.stops.map((s) => [s.node, s.order])).toEqual([
			['london', 1],
			['marrakesh', 2],
		]);
		for (const n of r.legs[0]!.hops.slice(1, -1)) expect(r.passThrough).toContain(n);
		expect(r.passThrough).not.toContain('london');
		expect(r.passThrough).not.toContain('marrakesh');
	});

	it('a ticket warp draws as a straight from→to jump (no intermediate hops)', () => {
		const t = simulatePlan(plan(prologue(), { ...toMarrakesh, useTicket: true }));
		const leg = mapRoute(t).legs[0]!;
		expect(leg.ticket).toBe(true);
		expect(leg.hops).toEqual(['london', 'marrakesh']);
	});

	it('a travel-only step is still a numbered stop, not a pass-through', () => {
		const t = simulatePlan(plan(prologue(), { location: 'marrakesh', fileCode: '', travelOnly: true }));
		const r = mapRoute(t);
		const m = r.stops.find((s) => s.node === 'marrakesh');
		expect(m).toMatchObject({ order: 2, travelOnly: true });
		expect(r.passThrough).not.toContain('marrakesh');
	});

	it('untilStep limits the drawn course to the first N steps', () => {
		const t = simulatePlan(plan(prologue(), toMarrakesh));
		const r = mapRoute(t, 1);
		expect(r.stops).toHaveLength(1);
		expect(r.legs).toHaveLength(0);
	});
});
