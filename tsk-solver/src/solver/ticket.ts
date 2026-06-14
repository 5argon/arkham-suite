/**
 * Expedited Ticket optimization (README §4.4).
 *
 * The ticket (acquired at a Quid Pro Quo node, "fast travel") is a single 0-time jump to
 * any unlocked node. Rather than bloat the search, we optimize it post-hoc on a finished
 * route: try inserting the ticket acquisition before the route's longest leg and replacing
 * that leg with a 0-time jump, re-simulating to verify legality and net time savings.
 * `auto` picks the jump that minimizes total time; `manual` reserves it for a fixed node.
 */

import { loadDatabase } from '../data/load.js';
import { distance, isNodeUnlocked } from '../graph/graph.js';
import { requiresSatisfied, stopOptions, type StopOption } from '../graph/model.js';
import { applyStop, initialState } from '../graph/state.js';
import type { NodeId, SolvePreferences } from '../types.js';
import type { RawRoute, RouteStep } from './search.js';
import { isCombatScenarioNode } from './timefloor.js';

export interface TicketConfig {
	allowTicket: boolean;
	ticketJumpTo?: NodeId;
}

export function ticketConfig(prefs: SolvePreferences | undefined): TicketConfig {
	if (!prefs || prefs.allowExpeditedTicket === false) return { allowTicket: false };
	if (prefs.ticketUse && prefs.ticketUse.mode === 'manual') {
		return { allowTicket: true, ticketJumpTo: prefs.ticketUse.jumpTo };
	}
	return { allowTicket: true };
}

function quidProQuoNodes(): NodeId[] {
	return loadDatabase()
		.locations.filter((l) => l.scenario_id === 'quid_pro_quo')
		.map((l) => l.id)
		.sort();
}

interface PlannedOption {
	option: StopOption;
	useTicket: boolean;
}

/** Re-simulate an ordered option sequence into a RawRoute, or null if any step is illegal. */
function replay(seq: PlannedOption[]): RawRoute | null {
	let state = initialState();
	const steps: RouteStep[] = [];
	let scenarioCount = 0;
	let revisitUsed = false;
	for (const { option, useTicket } of seq) {
		const target = option.node;
		if (!isNodeUnlocked(target, state.flags)) return null;
		const walk = distance(state.flags, state.node, target);
		const travelCost = useTicket ? 0 : walk;
		if (!useTicket && !Number.isFinite(travelCost)) return null;
		const alreadyStopped = state.visitedStops.has(target);
		if (alreadyStopped && !(option.isRevisit && !revisitUsed)) return null;
		if (!requiresSatisfied(option.requires, state)) return null;
		const { state: next, firedReports } = applyStop(state, option, travelCost, useTicket);
		steps.push(
			useTicket
				? { travelCost: 0, option, fired: firedReports, usedTicket: { from: state.node, to: target, saved: Number.isFinite(walk) ? walk : 0 } }
				: { travelCost, option, fired: firedReports },
		);
		scenarioCount += isCombatScenarioNode(target) ? 1 : 0;
		revisitUsed = revisitUsed || option.isRevisit === true;
		state = next;
	}
	return { steps, finalState: state, scenarioCount };
}

/**
 * Return a ticket-optimized variant of `route` if one strictly improves total time;
 * otherwise the original route. The returned route has exactly one `use_ticket` leg.
 */
export function optimizeTicket(route: RawRoute, tc: TicketConfig): RawRoute {
	if (!tc.allowTicket) return route;
	// Already has a ticket leg? Leave as-is.
	if (route.steps.some((s) => s.usedTicket)) return route;

	const base: PlannedOption[] = route.steps.map((s) => ({ option: s.option, useTicket: false }));
	const visited = new Set(route.steps.map((s) => s.option.node));
	let best = route;

	for (const q of quidProQuoNodes()) {
		if (visited.has(q)) continue; // would violate stop-lockout to insert another stop here
		const fastTravel = stopOptions(q).find((o) => o.optionId === 'fast_travel');
		if (!fastTravel) continue;

		// Try inserting acquisition before each leg, then jumping that leg.
		for (let i = 1; i < route.steps.length; i++) {
			const leg = route.steps[i]!;
			if (leg.travelCost <= 1) continue; // a 1-hop leg can't be improved by a 0-time jump after a detour
			if (tc.ticketJumpTo !== undefined && leg.option.node !== tc.ticketJumpTo) continue;
			const seq: PlannedOption[] = [
				...base.slice(0, i),
				{ option: fastTravel, useTicket: false },
				{ option: leg.option, useTicket: true },
				...base.slice(i + 1),
			];
			const candidate = replay(seq);
			if (candidate && candidate.finalState.timePassed < best.finalState.timePassed) {
				best = candidate;
			}
		}
	}
	return best;
}
