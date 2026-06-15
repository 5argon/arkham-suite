/**
 * Structured `conditionLogic` evaluation (pure).
 *
 * Decides whether an auto-resolved branch fires or a finale vote-table row applies, given a
 * `CampaignState`. Replaces the old string-token `requires` parser entirely — every predicate
 * is now first-class data (see `logic._schema.conditionLogic`).
 *
 * Predicates the planner cannot derive from a plan alone (board outcomes, randomness, defeat)
 * are resolved conservatively: `random` is treated as not-yet-true, defeat/no-resolution as
 * not-happened unless the player has asserted them via `state.boardStates`.
 */

import { getMarker } from '../data/load.js';
import type { CampaignState, CharacterId, Condition, MarkerSymbol, NumBound } from '../types.js';

/** Finale-only facts (member-vote tally) needed by `voteTally` / `votedNay` / `eerilySilentCount`. */
export interface FinaleContext {
	votedNay: ReadonlySet<CharacterId>;
	nayWins: boolean;
	silentCount: number;
}

function inBound(n: number, b: NumBound): boolean {
	if (b.lt !== undefined && !(n < b.lt)) return false;
	if (b.lte !== undefined && !(n <= b.lte)) return false;
	if (b.gt !== undefined && !(n > b.gt)) return false;
	if (b.gte !== undefined && !(n >= b.gte)) return false;
	if (b.min !== undefined && !(n >= b.min)) return false;
	if (b.max !== undefined && !(n <= b.max)) return false;
	if (b.eq !== undefined && !(n === b.eq)) return false;
	return true;
}

function compare(a: number, op: string, b: number): boolean {
	switch (op) {
		case 'gte':
			return a >= b;
		case 'gt':
			return a > b;
		case 'lte':
			return a <= b;
		case 'lt':
			return a < b;
		case 'eq':
			return a === b;
		default:
			return false;
	}
}

/** The box a marker fires at: its printed box, or the box it was written to at runtime. */
function markerBox(state: CampaignState, symbol: MarkerSymbol): number | undefined {
	const m = getMarker(symbol);
	if (m?.box !== undefined) return m.box;
	return state.markers.get(symbol);
}

/** Evaluate a structured condition. `null` => unconditional (true). */
export function evalCondition(c: Condition | null | undefined, state: CampaignState, fin?: FinaleContext): boolean {
	if (!c) return true;
	if (c.all) return c.all.every((x) => evalCondition(x, state, fin));
	if (c.any) return c.any.some((x) => evalCondition(x, state, fin));
	if (c.not) return !evalCondition(c.not, state, fin);

	let ok = true;
	const need = (b: boolean) => {
		ok = ok && b;
	};

	if (c.recorded !== undefined) need(state.recorded.has(c.recorded));
	if (c.notRecorded !== undefined) need(!state.recorded.has(c.notRecorded));
	if (c.time) need(inBound(state.timePassed, c.time));
	if (c.timeSinceMarker) {
		const box = markerBox(state, c.timeSinceMarker.symbol);
		need(box !== undefined && inBound(state.timePassed - box, c.timeSinceMarker));
	}
	if (c.timeMarkerReached !== undefined) {
		const box = markerBox(state, c.timeMarkerReached);
		need(box !== undefined && state.timePassed >= box);
	}
	if (c.countRecorded) need(inBound(c.countRecorded.anyOf.filter((l) => state.recorded.has(l)).length, c.countRecorded));
	if (c.tally) need(inBound(state.tallies.get(c.tally.entry) ?? 0, c.tally));
	if (c.tallyCompare) need(compare(state.tallies.get(c.tallyCompare.left) ?? 0, c.tallyCompare.op, state.tallies.get(c.tallyCompare.right) ?? 0));
	if (c.visited !== undefined) need(state.visitedFiles.has(c.visited));
	if (c.notVisited !== undefined) need(!state.visitedFiles.has(c.notVisited));
	if (c.voteTally !== undefined) need(fin ? (c.voteTally === 'nayWins' ? fin.nayWins : !fin.nayWins) : false);
	if (c.votedNay) need(fin ? c.votedNay.every((m) => fin.votedNay.has(m)) : false);
	if (c.eerilySilentCount) need(fin ? inBound(fin.silentCount, c.eerilySilentCount) : false);
	// Board outcomes the planner can't derive: false unless the player asserts them.
	if (c.noResolution !== undefined) need((c.noResolution === true) === state.boardStates.has('noResolution'));
	if (c.allDefeated !== undefined) need((c.allDefeated === true) === state.boardStates.has('allDefeated'));
	if (c.perDefeatedInvestigator !== undefined) need(false);
	if (c.scenarioState !== undefined) need(state.boardStates.has(c.scenarioState));
	if (c.choseOption !== undefined) need(state.chosenOptions.has(c.choseOption));
	if (c.notChoseOption !== undefined) need(!state.chosenOptions.has(c.notChoseOption));
	// Special Delivery delivers at a different city than pickup — assume the plan routes elsewhere.
	if (c.atOtherCity !== undefined) need(true);
	// Randomness is unpredictable: treat as not-yet-true so the deterministic fallback wins.
	if (c.random !== undefined) need(c.random === false);
	if (c.default !== undefined) need(c.default === true);

	return ok;
}
