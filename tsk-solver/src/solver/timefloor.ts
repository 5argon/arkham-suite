/**
 * Time-floor lower bounds and impossibility proofs (README §4.3).
 *
 * The headline feature: cheaply prove some constraint sets are unsatisfiable with
 * real arithmetic. Every bound here is **admissible** — it never overestimates the
 * true minimum, so a proof of impossibility is sound.
 *
 * Travel is bounded on the *fully unlocked* graph (a supergraph of any dynamic state,
 * hence its distances are <= the real ones). We respect the genuine precedence the
 * narrative chains and locked-node unlocks impose, and minimize over the remaining
 * linear extensions (Held-Karp), so the bound is both admissible and tight enough to
 * exceed real caps (e.g. Speed Demon's 17).
 */

import { getLocation, getScenario, loadDatabase } from '../data/load.js';
import { distance, travelUnlockFlags } from '../graph/graph.js';
import { stopOptions } from '../graph/model.js';
import type {
	FlagId,
	ImpossibilityProof,
	LocalizedString,
	NodeId,
} from '../types.js';
import { optionMatches, type ExpandedConstraints, type Requirement } from './waypoints.js';

const msg = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

/** Full-graph (all unlock flags) distance — an admissible lower bound on dynamic distance. */
function fullDistance(from: NodeId, to: NodeId): number {
	return distance(new Set(travelUnlockFlags()), from, to);
}

/** Cheapest option time at `node` satisfying `req` (Infinity if none, 0 floor). */
function minStopTime(req: Requirement, node: NodeId): number {
	let best = Infinity;
	for (const opt of stopOptions(node)) {
		if (opt.outcome === 'LOSE_CAMPAIGN') continue;
		if (optionMatches(opt, req.match)) best = Math.min(best, opt.baseTime);
	}
	return best === Infinity ? 0 : best;
}

interface Terminal {
	/** unique id for this required visit. */
	id: string;
	node: NodeId;
	stopTime: number;
	req: Requirement;
}

/**
 * Derive precedence (which requirement-visits must precede which) from:
 *  - chain/recruit-chain waypoint dependencies (a later waypoint requiring an earlier `sets`),
 *  - locked-node unlocks (the flag producer must precede the node it unlocks).
 * Returns adjacency: terminal index -> set of terminal indices that must come before it.
 */
function buildPrecedence(terminals: Terminal[]): Map<number, Set<number>> {
	const before = new Map<number, Set<number>>();
	for (let i = 0; i < terminals.length; i++) before.set(i, new Set());

	// chain waypoints: id pattern chain:<chainId>:<wpIndex> / recruit_chain:<chainId>:<wpIndex>
	const chainGroups = new Map<string, { idx: number; order: number }[]>();
	terminals.forEach((t, idx) => {
		const m = /^(chain|recruit_chain):([^:]+):(\d+)$/.exec(t.req.id);
		if (m) {
			const key = `${m[1]}:${m[2]}`;
			const arr = chainGroups.get(key) ?? [];
			arr.push({ idx, order: Number(m[3]) });
			chainGroups.set(key, arr);
		}
	});
	for (const group of chainGroups.values()) {
		group.sort((a, b) => a.order - b.order);
		for (let k = 1; k < group.length; k++) {
			// each waypoint after the first depends on all earlier ones in its chain.
			for (let j = 0; j < k; j++) before.get(group[k]!.idx)!.add(group[j]!.idx);
		}
	}

	// locked-node unlocks: an `unlock:<flag>` requirement must precede the visit to a node
	// locked by <flag>.
	const flagProducerIdx = new Map<FlagId, number[]>();
	terminals.forEach((t, idx) => {
		const m = /^unlock:(.+)$/.exec(t.req.id);
		if (m) {
			const arr = flagProducerIdx.get(m[1]!) ?? [];
			arr.push(idx);
			flagProducerIdx.set(m[1]!, arr);
		}
	});
	terminals.forEach((t, idx) => {
		const loc = getLocation(t.node);
		if (loc.status === 'locked' && loc.unlock_condition) {
			const producers = flagProducerIdx.get(loc.unlock_condition);
			if (producers) for (const p of producers) if (p !== idx) before.get(idx)!.add(p);
		}
	});

	return before;
}

/** Above this many mid-terminals the Held-Karp table (2^n × n) would blow memory; fall back. */
const HELD_KARP_MAX_MIDS = 16;

/**
 * Cheap admissible lower bound on a start→…→end path visiting every mid, ignoring precedence
 * (precedence only lengthens the true path, so this stays admissible). Each mid lies on the path,
 * so the total is at least dist(start, m) + dist(m, end) for every m, and at least dist(start, end).
 * Used when the exact Held-Karp DP would be too large.
 */
function pathLowerBound(start: NodeId, end: NodeId, mids: Terminal[], dist: (a: NodeId, b: NodeId) => number): number {
	let best = dist(start, end);
	for (const m of mids) {
		const d = dist(start, m.node) + dist(m.node, end);
		if (d > best) best = d;
	}
	return best;
}

/**
 * Held-Karp shortest path that starts at `start`, ends at `end`, visits all `mids`,
 * and respects `before` precedence. Distances via `dist`. Returns Infinity if no
 * precedence-feasible ordering exists.
 */
function precedenceShortestPath(
	start: NodeId,
	end: NodeId,
	mids: Terminal[],
	before: Map<number, Set<number>>,
	dist: (a: NodeId, b: NodeId) => number,
): number {
	const n = mids.length;
	if (n === 0) return dist(start, end);
	const full = (1 << n) - 1;
	// dp[mask][last] = min travel to have visited `mask` ending at mids[last].
	const dp: number[][] = Array.from({ length: 1 << n }, () => new Array<number>(n).fill(Infinity));
	const subsetOk = (mask: number, j: number): boolean => {
		// every predecessor of j must already be in mask.
		for (const p of before.get(j)!) {
			if (p < n && (mask & (1 << p)) === 0) return false;
		}
		return true;
	};
	for (let j = 0; j < n; j++) {
		if (before.get(j)!.size === 0 || subsetOk(0, j)) {
			dp[1 << j]![j] = dist(start, mids[j]!.node);
		}
	}
	for (let mask = 1; mask <= full; mask++) {
		for (let last = 0; last < n; last++) {
			const cur = dp[mask]![last]!;
			if (cur === Infinity) continue;
			if ((mask & (1 << last)) === 0) continue;
			for (let next = 0; next < n; next++) {
				if (mask & (1 << next)) continue;
				const nmask = mask | (1 << next);
				if (!subsetOk(mask, next)) continue;
				const cand = cur + dist(mids[last]!.node, mids[next]!.node);
				if (cand < dp[nmask]![next]!) dp[nmask]![next] = cand;
			}
		}
	}
	let best = Infinity;
	for (let last = 0; last < n; last++) {
		const v = dp[full]![last]!;
		if (v !== Infinity) best = Math.min(best, v + dist(mids[last]!.node, end));
	}
	return best;
}

export interface TimeFloorResult {
	floor: number;
	travel: number;
	stopTime: number;
	unlockFloor: number;
	breakdown: { label: string; value: number }[];
}

/** The unlock-floor: any WIN must reach Beta (box 15) then hop into Tunguska (>=16). */
function unlockFloor(): number {
	const meta = loadDatabase().campaign_metadata;
	const beta = Object.values(loadDatabase().status_reports).find(
		(r) => r.sets === getLocation(meta.finale_node).unlock_condition && typeof r.at_box === 'number',
	);
	const betaBox = beta && typeof beta.at_box === 'number' ? beta.at_box : 0;
	return betaBox > 0 ? betaBox + 1 : 0;
}

/**
 * Compute the admissible time floor for an expanded constraint set.
 * Only single-candidate ("forced") requirements contribute to the travel/stop bound;
 * multi-candidate requirements are conservatively omitted (keeps the bound admissible).
 */
export function timeFloor(expanded: ExpandedConstraints): TimeFloorResult {
	const meta = loadDatabase().campaign_metadata;
	const start = meta.start_node;
	const end = meta.finale_node;

	// Forced terminals: requirements pinned to exactly one node.
	const forced = expanded.requirements.filter((r) => r.nodes.length === 1);
	const terminals: Terminal[] = forced.map((r) => ({
		id: r.id,
		node: r.nodes[0]!,
		stopTime: minStopTime(r, r.nodes[0]!),
		req: r,
	}));

	// Mid terminals = forced nodes that are not the (single) prologue-start or finale-end.
	// The prologue and finale are handled as path endpoints; a London *revisit* terminal
	// stays in the middle (it forces a return trip).
	const mids = terminals.filter(
		(t) => !(t.req.match.type === 'prologue') && !(t.req.match.type === 'finale'),
	);

	// Exact precedence-respecting path for tractable sets; a cheap admissible bound for huge ones
	// (the exponential DP would OOM). Both are admissible, so impossibility proofs stay sound.
	const before = buildPrecedence(mids);
	const travel =
		mids.length > HELD_KARP_MAX_MIDS
			? pathLowerBound(start, end, mids, fullDistance)
			: precedenceShortestPath(start, end, mids, before, fullDistance);

	// Stop-time lower bound: a single physical stop at a node pays at most the MAX of the
	// per-requirement minimums pinned there, never the SUM (two requirements one stop satisfies
	// must not be double-counted — that would overestimate and risk a false impossibility).
	const perNode = new Map<NodeId, number>();
	for (const t of terminals) perNode.set(t.node, Math.max(perNode.get(t.node) ?? 0, t.stopTime));
	const stopTime = [...perNode.values()].reduce((s, v) => s + v, 0);
	const prologueNode = terminals.find((t) => t.req.match.type === 'prologue')?.node;
	const prologueValue = prologueNode !== undefined ? (perNode.get(prologueNode) ?? 0) : 0;

	const uf = unlockFloor();
	const rawFloor = (travel === Infinity ? 0 : travel) + stopTime;
	const floor = Math.max(rawFloor, uf);

	const breakdown = [
		{ label: 'prologue', value: prologueValue },
		{ label: 'travel', value: travel === Infinity ? 0 : travel },
		{ label: 'resolutions', value: stopTime - prologueValue },
		{ label: 'finale_unlock', value: uf },
	];

	return { floor, travel: travel === Infinity ? Infinity : travel, stopTime, unlockFloor: uf, breakdown };
}

/** True if stopping at `node` plays a combat scenario (counts toward `maxScenarios`). */
export function isCombatScenarioNode(node: NodeId): boolean {
	const sid = getLocation(node).scenario_id;
	return sid !== null && getScenario(sid) !== undefined;
}

/** Distinct keys that can only be obtained at scenario-kind nodes (a scenario-count lower bound). */
export function scenarioCountFloor(expanded: ExpandedConstraints): { count: number; keys: string[] } {
	const keyReqs = expanded.requirements.filter(
		(r) => r.match.type === 'key_investigator' || r.match.type === 'key_any',
	);
	const scenarioOnlyKeys: string[] = [];
	for (const r of keyReqs) {
		const key = (r.match as { key: string }).key;
		// A "combat scenario" node is one whose scenario_id has a `scenarios` entry
		// (the prologue counts; interlude / side-story key sources do not).
		const allScenario = r.nodes.every((n) => isCombatScenarioNode(n));
		if (allScenario) scenarioOnlyKeys.push(key);
	}
	// Each scenario yields a unique key, so N scenario-only keys need >= N scenario stops.
	const unique = [...new Set(scenarioOnlyKeys)].sort();
	return { count: unique.length, keys: unique };
}

/** Build a time-floor impossibility proof. */
export function timeFloorProof(
	expanded: ExpandedConstraints,
	tf: TimeFloorResult,
	cap: number,
): ImpossibilityProof {
	const conflictParts = expanded.requirements
		.filter((r) => r.constraintIndex >= 0)
		.map((r) => r.id);
	return {
		kind: 'time_floor',
		conflict: conflictParts.join(' + ') || 'time_cap',
		cap,
		breakdown: tf.breakdown,
		floor: tf.floor,
		message: msg('impossible_time', { floor: tf.floor, cap, travel: tf.travel === Infinity ? -1 : tf.travel }),
	};
}

/** Build a scenario-count impossibility proof. */
export function scenarioCountProof(count: number, keys: string[], cap: number): ImpossibilityProof {
	return {
		kind: 'scenario_count',
		conflict: `${count} distinct keys require >= ${count} scenarios`,
		cap,
		breakdown: [
			{ label: 'scenarios_required', value: count },
			{ label: 'scenario_cap', value: cap },
		],
		floor: count,
		message: msg('impossible_scenarios', { count, cap, keys: keys.join(', ') }),
	};
}

/**
 * Build a "no route found within the search budget" proof. Used when the time floor is within the
 * cap (so it's NOT a time-floor impossibility) but the bounded search still returned nothing — the
 * constraints are likely jointly unsatisfiable or too tight. Carries no floor/cap breakdown, so the
 * UI never shows the misleading "floor N exceeds cap M" (N ≤ M) line.
 */
export function searchBudgetProof(expanded: ExpandedConstraints): ImpossibilityProof {
	const conflictParts = expanded.requirements.filter((r) => r.constraintIndex >= 0).map((r) => r.id);
	return {
		kind: 'search_budget',
		conflict: conflictParts.join(' + ') || 'the requested constraints',
		cap: 0,
		breakdown: [],
		floor: 0,
		message: msg('impossible_search_budget'),
	};
}

/** Build a logical impossibility proof. */
export function logicalProof(conflict: string): ImpossibilityProof {
	return {
		kind: 'logical',
		conflict,
		cap: 0,
		breakdown: [],
		floor: 0,
		message: msg('impossible_logical', { conflict }),
	};
}
