/**
 * Trust / Deception chaos-bag layer (README §"Trust/Deception").
 *
 * Eight points in the campaign let the cell trust or defy someone, steering the chaos bag:
 *   trust  → remove an Elder Thing (floor 0), add a Tablet (cap 4; +1 XP if already 4)
 *   defy   → remove a Tablet, add an Elder Thing (cap 4; +1 XP if already 4)
 * The bag starts with 1 Tablet + 1 Elder Thing. These token choices are made independently of the
 * scenario's resolution, so we model them as *free* picks available wherever the route visits the
 * decision's scenario, and compute the reachable (Tablet, ElderThing, overflow-XP) set by DP. Two
 * of the eight (Flint at R&R, Taylor at the Foundation) always occur in the prologue; Quinn needs
 * the London revisit; the rest need their scenario.
 *
 * Because every decision offers the same trust/defy/neutral choice, the reachable set depends only
 * on the *number* of decisions available to a route — so we memoize by that count.
 */

import type { RawRoute } from './search.js';

const CAP = 4;
const START_TABLET = 1;
const START_ELDER = 1;

/** Decision scenarios beyond the always-available prologue pair (Flint + Taylor). */
const DECISION_NODES = ['buenos_aires', 'istanbul', 'anchorage', 'alexandria', 'kathmandu'];

/** How many trust/deception decision points a route can engage. */
export function availableDecisions(route: RawRoute): number {
	let k = 2; // Flint (R&R) + Taylor (Foundation) — always in the prologue.
	if (route.steps.some((s) => s.option.isRevisit)) k++; // Quinn, at the London revisit.
	const stops = new Set(route.steps.map((s) => s.option.node));
	for (const n of DECISION_NODES) if (stops.has(n)) k++;
	return k;
}

export interface ChaosState {
	tablet: number;
	elder: number;
	overflow: number;
}

const reachableMemo = new Map<number, ChaosState[]>();

/** All reachable (tablet, elder, overflow) bag states after `k` free trust/defy/neutral choices. */
export function reachableChaos(k: number): ChaosState[] {
	const cached = reachableMemo.get(k);
	if (cached) return cached;
	let frontier = new Map<string, ChaosState>();
	const add = (m: Map<string, ChaosState>, s: ChaosState) => m.set(`${s.tablet},${s.elder},${s.overflow}`, s);
	add(frontier, { tablet: START_TABLET, elder: START_ELDER, overflow: 0 });
	for (let i = 0; i < k; i++) {
		const next = new Map<string, ChaosState>();
		for (const s of frontier.values()) {
			// trust: +Tablet (cap, else overflow), -Elder
			add(next, {
				tablet: Math.min(CAP, s.tablet + 1),
				elder: Math.max(0, s.elder - 1),
				overflow: s.overflow + (s.tablet >= CAP ? 1 : 0),
			});
			// defy: +Elder (cap, else overflow), -Tablet
			add(next, {
				tablet: Math.max(0, s.tablet - 1),
				elder: Math.min(CAP, s.elder + 1),
				overflow: s.overflow + (s.elder >= CAP ? 1 : 0),
			});
			// neutral: no change
			add(next, s);
		}
		frontier = next;
	}
	const out = [...frontier.values()];
	reachableMemo.set(k, out);
	return out;
}

export interface ChaosSummary {
	decisions: number;
	maxOverflowXp: number;
	tabletRange: [number, number];
	elderRange: [number, number];
}

export function chaosSummary(route: RawRoute): ChaosSummary {
	const k = availableDecisions(route);
	const states = reachableChaos(k);
	let maxOverflow = 0;
	let tMin = CAP;
	let tMax = 0;
	let eMin = CAP;
	let eMax = 0;
	for (const s of states) {
		if (s.overflow > maxOverflow) maxOverflow = s.overflow;
		tMin = Math.min(tMin, s.tablet);
		tMax = Math.max(tMax, s.tablet);
		eMin = Math.min(eMin, s.elder);
		eMax = Math.max(eMax, s.elder);
	}
	return { decisions: k, maxOverflowXp: maxOverflow, tabletRange: [tMin, tMax], elderRange: [eMin, eMax] };
}

/** Can the route's decisions reach a bag with the requested token counts (each optional)? */
export function canReachMix(route: RawRoute, tablet?: number, elder?: number): boolean {
	const states = reachableChaos(availableDecisions(route));
	return states.some((s) => (tablet === undefined || s.tablet === tablet) && (elder === undefined || s.elder === elder));
}

/** Can the route's decisions yield at least `min` overflow XP? */
export function canReachOverflow(route: RawRoute, min: number): boolean {
	return chaosSummary(route).maxOverflowXp >= min;
}

/** A "balanced" bag (never a net add: every add paired with a remove) is always achievable. */
export function canBalance(): boolean {
	return true;
}

/** Test-only reset. */
export function _resetChaosMemo(): void {
	reachableMemo.clear();
}
