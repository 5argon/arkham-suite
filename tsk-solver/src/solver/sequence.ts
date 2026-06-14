/**
 * Sequential priority (README §6).
 *
 * When `respectOrder` is true, recipes should acquire constraints in (or close to) the
 * order the user listed them. We score a route by how well its constraint-acquisition
 * order matches the requested order (a Kendall-tau-style inversion count, with a bias
 * toward earlier acquisition), and we surface a warning when honoring the order is
 * impossible (e.g. a constraint that is structurally forced earlier, like the prologue key).
 */

import type { LocalizedString } from '../types.js';
import { optionMatches, type Requirement } from './waypoints.js';
import type { RawRoute } from './search.js';

export interface SequenceScore {
	/** Lower is better: number of out-of-order acquisitions (inversions). */
	inversions: number;
	/** Sum of acquisition times of the ordered constraints (earlier is better). */
	acquisitionTimeSum: number;
	/** Constraints whose requested order could not be honored (structurally forced earlier). */
	violations: { constraintIndex: number }[];
}

/**
 * For each ordered (constraint-bearing) requirement, find the time at which the route first
 * satisfies it. Returns the acquisition time per constraint index (Infinity if never).
 */
function acquisitionTimes(route: RawRoute, requirements: Requirement[]): Map<number, number> {
	const byConstraint = new Map<number, number>();
	let t = 0;
	for (const step of route.steps) {
		t += step.travelCost + step.option.baseTime;
		for (const req of requirements) {
			if (req.constraintIndex < 0) continue;
			if (byConstraint.has(req.constraintIndex)) continue;
			if (req.nodes.includes(step.option.node) && optionMatches(step.option, req.match)) {
				byConstraint.set(req.constraintIndex, t);
			}
		}
	}
	return byConstraint;
}

export function scoreSequence(route: RawRoute, requirements: Requirement[], orderedConstraintIndices: number[]): SequenceScore {
	const times = acquisitionTimes(route, requirements);
	const present = orderedConstraintIndices.filter((i) => times.has(i));
	// Inversions: pairs (i before j in requested order) where acquired time(i) > time(j).
	let inversions = 0;
	const violations: { constraintIndex: number }[] = [];
	for (let a = 0; a < present.length; a++) {
		for (let b = a + 1; b < present.length; b++) {
			const ta = times.get(present[a]!)!;
			const tb = times.get(present[b]!)!;
			if (ta > tb) {
				inversions++;
				violations.push({ constraintIndex: present[a]! });
			}
		}
	}
	const acquisitionTimeSum = present.reduce((s, i) => s + (times.get(i) ?? 0), 0);
	return { inversions, acquisitionTimeSum, violations: dedupeViolations(violations) };
}

function dedupeViolations(v: { constraintIndex: number }[]): { constraintIndex: number }[] {
	const seen = new Set<number>();
	const out: { constraintIndex: number }[] = [];
	for (const x of v) {
		if (seen.has(x.constraintIndex)) continue;
		seen.add(x.constraintIndex);
		out.push(x);
	}
	return out;
}

/** Build an order-violation warning, if any. */
export function orderWarning(score: SequenceScore, fastestTime: number, chosenTime: number): LocalizedString | null {
	if (score.inversions === 0) {
		if (chosenTime > fastestTime) {
			return { id: 'warning_order_costs', params: { extra: chosenTime - fastestTime } };
		}
		return null;
	}
	return { id: 'warning_order_impossible', params: { count: score.inversions } };
}
