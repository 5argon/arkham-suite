/**
 * State-aware route search (README §4.2).
 *
 * Uniform-cost search (Dijkstra on `timePassed`) from London to the Tunguska finale.
 * A "move" is: travel to a reachable node (BFS distance on the *current* unlocked
 * graph), stop, and resolve one stop option. Successors honor stop-lockout, locked-node
 * gating, resolution `requires`, the scenario cap, forbidden scenarios, status-report
 * interrupts, and the active time cap. LOSE_CAMPAIGN dead ends are pruned.
 *
 * Dijkstra pops in nondecreasing time, so the first goal found is time-optimal (the
 * speedrunner candidate); we keep collecting up to `goalLimit` distinct goal routes
 * to feed archetype scoring and the diversity clamp.
 *
 * Memory discipline: search nodes use parent pointers (no per-node step-array copy)
 * and a 31-bit `satisfiedMask` instead of a Set. Candidate stops are restricted to the
 * mandatory ("relevant") nodes plus a curated, capped enrichment pool, so open queries
 * stay bounded.
 */

import { getLocation, loadDatabase } from '../data/load.js';
import { distance, isNodeUnlocked, travelUnlockFlags } from '../graph/graph.js';
import { requiresSatisfied, stopOptions, type StopOption } from '../graph/model.js';
import { applyStop, bearerIsInvestigator, initialState, stateSignature } from '../graph/state.js';
import type { CampaignState, MarkerSymbol, NodeId } from '../types.js';
import { isCombatScenarioNode } from './timefloor.js';
import { optionMatches, type ExpandedConstraints, type NegativeCheck, type Requirement } from './waypoints.js';

/** Would stopping at `target` with `option` violate a negated constraint? (prunes during search) */
function optionViolatesNegative(target: NodeId, option: StopOption, checks: NegativeCheck[]): boolean {
	for (const c of checks) {
		switch (c.kind) {
			case 'node':
				if (target === c.node) return true;
				break;
			case 'key':
				if (optionMatches(option, c.investigatorOnly ? { type: 'key_investigator', key: c.key } : { type: 'key_any', key: c.key }))
					return true;
				break;
			case 'ally':
				if (option.grantsAllies.includes(c.ally)) return true;
				break;
			case 'resolution':
				if (target === c.node && option.optionId === c.resolution) return true;
				break;
			case 'version':
				if (target === c.node && option.version === c.version) return true;
				break;
			case 'flag':
				if (option.logs.includes(c.flag) || option.unlocks === c.flag || option.grantsAsset === c.flag) return true;
				break;
		}
	}
	return false;
}

export interface RouteStep {
	travelCost: number;
	option: StopOption;
	fired: MarkerSymbol[];
	/** When set, this leg was an Expedited Ticket 0-time jump. */
	usedTicket?: { from: NodeId; to: NodeId; saved: number };
}

export interface RawRoute {
	steps: RouteStep[];
	finalState: CampaignState;
	scenarioCount: number;
}

interface SearchNode {
	state: CampaignState;
	satisfiedMask: number;
	parent: SearchNode | null;
	step: RouteStep | null;
	scenarioCount: number;
	revisitUsed: boolean;
	/** True once the route crossed the Zeta box while holding an investigator Key (theft happened). */
	theftPending: boolean;
	/** Number of 14-C "Ruses and Reclamation" take-back stops made. */
	takeBackCount: number;
	depth: number;
	seq: string;
}

export interface SearchConfig {
	timeCap: number;
	scenarioCap: number;
	goalLimit: number;
	maxStates: number;
	maxDepth: number;
	/** Required 14-C take-back stops when a Key is stolen (0 = none). Conditional on theft. */
	requiredTakeBack?: number;
}

export const DEFAULT_SEARCH: Omit<SearchConfig, 'timeCap' | 'scenarioCap'> = {
	// Collect a broad pool of goals to diversify across scenario-count buckets. The MST heuristic
	// makes heavily-constrained queries reach a goal in far fewer states; this budget is sized for
	// the harder direction — UNDER-constrained queries (a single flag/log) that must pad time to
	// unlock the finale and have a large open frontier. The solver runs in a Web Worker, so this
	// latency never freezes the UI. Callers can raise via prefs.
	goalLimit: 150,
	maxStates: 38000,
	maxDepth: 15,
};

/** Cap on the enrichment pool size for under-constrained (open) queries. */
const ENRICHMENT_CAP = 8;
/** Smaller enrichment pool for constrained queries (mainly time-padding to reach Beta@15). */
const CONSTRAINED_ENRICHMENT_CAP = 5;
/** Below this many mandatory non-structural requirements, a query is "open" and uses the larger pool. */
const OPEN_QUERY_THRESHOLD = 4;

// --- minimal binary min-heap ------------------------------------------------

interface HeapItem {
	/** Priority: f = g + h (A*). */
	f: number;
	g: number;
	seq: string;
	node: SearchNode;
}

class MinHeap {
	private items: HeapItem[] = [];
	get size(): number {
		return this.items.length;
	}
	private less(a: HeapItem, b: HeapItem): boolean {
		if (a.f !== b.f) return a.f < b.f;
		if (a.g !== b.g) return a.g < b.g;
		return a.seq < b.seq;
	}
	push(item: HeapItem): void {
		const items = this.items;
		items.push(item);
		let i = items.length - 1;
		while (i > 0) {
			const parent = (i - 1) >> 1;
			if (this.less(items[i]!, items[parent]!)) {
				[items[i], items[parent]] = [items[parent]!, items[i]!];
				i = parent;
			} else break;
		}
	}
	pop(): HeapItem | undefined {
		const items = this.items;
		if (items.length === 0) return undefined;
		const top = items[0]!;
		const last = items.pop()!;
		if (items.length > 0) {
			items[0] = last;
			let i = 0;
			for (;;) {
				const l = 2 * i + 1;
				const r = 2 * i + 2;
				let smallest = i;
				if (l < items.length && this.less(items[l]!, items[smallest]!)) smallest = l;
				if (r < items.length && this.less(items[r]!, items[smallest]!)) smallest = r;
				if (smallest === i) break;
				[items[i], items[smallest]] = [items[smallest]!, items[i]!];
				i = smallest;
			}
		}
		return top;
	}
}

// --- candidate node selection ----------------------------------------------

/** Does any stop option at this node grant routing/archetype value (key/ally/trust/deception/xp/flag)? */
function isValuableNode(node: NodeId): boolean {
	const td = loadDatabase().trust_deception;
	const valueFlags = new Set([...td.foundation_trust_sources, ...td.cell_deception_sources].map((s) => s.replace(/\([^)]*\)/g, '').trim()));
	for (const opt of stopOptions(node)) {
		if (opt.key || opt.grantsKey || opt.grantsAllies.length > 0) return true;
		if (opt.xpBonus > 0) return true;
		if (opt.logs.some((l) => valueFlags.has(l))) return true;
	}
	return false;
}

/** "Time value" of a node = max stop-option time (how much it advances the clock toward Beta). */
function nodeTimeValue(node: NodeId): number {
	let best = 0;
	for (const opt of stopOptions(node)) if (opt.outcome !== 'LOSE_CAMPAIGN') best = Math.max(best, opt.baseTime);
	return best;
}

/**
 * Candidate stop nodes. Constrained queries use only the mandatory ("relevant") nodes +
 * finale + start — keeping the search small. Under-constrained ("open") queries also get a
 * curated, capped enrichment pool of value-bearing nodes so routes can accrue time/value and
 * the archetypes/diversity have material. The pool is deterministic (sorted).
 */
function candidateNodes(expanded: ExpandedConstraints, enrich: boolean): NodeId[] {
	const meta = loadDatabase().campaign_metadata;
	const set = new Set<NodeId>(expanded.relevantNodes);
	set.add(meta.finale_node);
	set.add(meta.start_node);

	// Enrichment pool: value-bearing, time-advancing nodes so routes can accrue time (to reach
	// Beta@15 and unlock the finale) and so archetypes/diversity have material. Added only on the
	// second pass (when the minimal search found nothing). Open queries get a larger pool.
	if (enrich) {
		const nonStructural = [...expanded.relevantNodes].filter(
			(n) => n !== meta.start_node && n !== meta.finale_node,
		);
		const cap = nonStructural.length < OPEN_QUERY_THRESHOLD ? ENRICHMENT_CAP : CONSTRAINED_ENRICHMENT_CAP;
		const pool = loadDatabase()
			.locations.filter(
				(loc) =>
					!expanded.forbiddenNodes.has(loc.id) &&
					!set.has(loc.id) &&
					stopOptions(loc.id).length > 0 &&
					isValuableNode(loc.id) &&
					loc.status !== 'locked' &&
					// Standalone (green) nodes are never added unbidden — only when a constraint
					// (a side-story constraint or the Wellspring key) makes them relevant.
					loc.node_kind !== 'side_story',
			)
			.map((loc) => loc.id)
			// Prefer higher time-value nodes (reach Beta faster), break ties by id for determinism.
			.sort((a, b) => nodeTimeValue(b) - nodeTimeValue(a) || (a < b ? -1 : 1))
			.slice(0, cap);
		for (const n of pool) set.add(n);
	}
	return [...set].sort();
}

// --- search ----------------------------------------------------------------

function reconstruct(node: SearchNode): RouteStep[] {
	const steps: RouteStep[] = [];
	let cur: SearchNode | null = node;
	while (cur && cur.step) {
		steps.push(cur.step);
		cur = cur.parent;
	}
	steps.reverse();
	return steps;
}

export function search(expanded: ExpandedConstraints, config: SearchConfig): RawRoute[] {
	const requirements = expanded.requirements;
	if (requirements.length > 31) {
		// Pathological constraint set; the orchestrator handles these via impossibility checks.
		return [];
	}
	// `>>> 0` keeps the mask unsigned: at length 31, `(1 << 31) - 1` is negative in JS's signed
	// 32-bit shift, which would never equal the (always-positive) accumulated satisfiedMask. With the
	// coercion, length 31 is fully usable; the `> 31` guard above still rejects 32+ (bit 31 overflow).
	const goalMask = requirements.length === 0 ? 0 : ((1 << requirements.length) - 1) >>> 0;
	const meta = loadDatabase().campaign_metadata;
	const startNode = meta.start_node;
	const finaleNode = meta.finale_node;

	// A* heuristic prerequisites: full-graph distances + the Beta unlock floor.
	const allFlags = new Set(travelUnlockFlags());
	const fullDist = (from: NodeId, to: NodeId): number => distance(allFlags, from, to);
	const betaReport = Object.values(loadDatabase().status_reports).find(
		(r) => r.sets === getLocation(finaleNode).unlock_condition && typeof r.at_box === 'number',
	);
	const unlockBox = betaReport && typeof betaReport.at_box === 'number' ? betaReport.at_box + 1 : 0;

	// MST-based admissible heuristic. A route that still has to visit a set of FORCED (single-
	// candidate) requirement nodes from the current node must, in the metric closure, weigh at least
	// the minimum spanning tree over {current} ∪ {unmet forced nodes}. That is far tighter than
	// "distance to the single farthest waypoint" when a query pins many scattered nodes (a narrative
	// chain, a Trial coalition), and is what stops heavily-constrained searches from near-exhausting
	// the state budget. Pairwise distances among forced nodes are static, so precompute them once.
	const forcedNodeOfReq: (NodeId | null)[] = requirements.map((r) => (r.nodes.length === 1 ? r.nodes[0]! : null));
	const forcedNodes = [...new Set(forcedNodeOfReq.filter((n): n is NodeId => n !== null))];
	const forcedIdx = new Map<NodeId, number>(forcedNodes.map((n, i) => [n, i]));
	const pairDist: number[][] = forcedNodes.map((a) => forcedNodes.map((b) => fullDist(a, b)));

	// Key-theft (Zeta) take-back: if a route crosses the Zeta box holding Keys, a Key is stolen and
	// must be recovered at `requiredTakeBack` 14-C "Ruses and Reclamation" sites before the finale.
	const requiredTakeBack = config.requiredTakeBack ?? 0;
	const zetaReport = loadDatabase().status_reports.zeta;
	const zetaBox = typeof zetaReport?.at_box === 'number' ? zetaReport.at_box : null;
	const takeBackNodes = new Set(
		loadDatabase().locations.filter((l) => l.scenario_id === 'ruses_and_reclamation').map((l) => l.id),
	);
	const takeBackEnabled = requiredTakeBack > 0 && zetaBox !== null;

	/** MST weight over {cur} ∪ unmet forced nodes (Prim's) — admissible lower bound on remaining travel. */
	const mstLowerBound = (cur: NodeId, unmet: NodeId[]): number => {
		const k = unmet.length;
		if (k === 0) return 0;
		const inTree = new Array<boolean>(k).fill(false);
		const best = new Array<number>(k);
		for (let i = 0; i < k; i++) {
			const d = fullDist(cur, unmet[i]!);
			best[i] = Number.isFinite(d) ? d : Infinity;
		}
		let total = 0;
		for (let added = 0; added < k; added++) {
			let u = -1;
			let ud = Infinity;
			for (let i = 0; i < k; i++) if (!inTree[i] && best[i]! < ud) (ud = best[i]!), (u = i);
			if (u === -1 || !Number.isFinite(ud)) break; // disconnected subset → partial (still admissible) bound
			inTree[u] = true;
			total += ud;
			const ui = forcedIdx.get(unmet[u]!)!;
			for (let i = 0; i < k; i++) {
				if (inTree[i]) continue;
				const d = pairDist[ui]![forcedIdx.get(unmet[i]!)!]!;
				if (d < best[i]!) best[i] = d;
			}
		}
		return total;
	};

	/** Admissible lower bound on remaining time from `node`. */
	const heuristic = (node: SearchNode): number => {
		const s = node.state;
		let h = Math.max(0, unlockBox - s.timePassed);
		const finaleDist = fullDist(s.node, finaleNode);
		if (Number.isFinite(finaleDist)) h = Math.max(h, finaleDist);
		// Collect distinct unmet forced nodes (skip the one we're standing on — already arrived).
		const unmet: NodeId[] = [];
		for (let i = 0; i < requirements.length; i++) {
			if (node.satisfiedMask & (1 << i)) continue;
			// Per-requirement single-leg bound (also covers multi-candidate requirements, which the
			// MST term ignores).
			let best = Infinity;
			for (const n of requirements[i]!.nodes) {
				const d = fullDist(s.node, n);
				if (d < best) best = d;
			}
			if (Number.isFinite(best)) h = Math.max(h, best);
			const fn = forcedNodeOfReq[i];
			if (fn != null && fn !== s.node && !unmet.includes(fn)) unmet.push(fn);
			// A scenario-level window with a minimum entry time forces the clock at least that high.
			const min = requirements[i]!.entryTimeWindow?.min;
			if (min !== undefined && min - s.timePassed > h) h = min - s.timePassed;
		}
		h = Math.max(h, mstLowerBound(s.node, unmet));
		return h;
	};

	/** A* exploration over a fixed candidate set. */
	const explore = (candidates: NodeId[]): RawRoute[] => {
		const heap = new MinHeap();
		const bestG = new Map<string, number>();
		const goals: RawRoute[] = [];
		let explored = 0;

		const root: SearchNode = {
			state: initialState(),
			satisfiedMask: 0,
			parent: null,
			step: null,
			scenarioCount: 0,
			revisitUsed: false,
			theftPending: false,
			takeBackCount: 0,
			depth: 0,
			seq: '',
		};
		heap.push({ f: heuristic(root), g: 0, seq: '', node: root });

		while (heap.size > 0 && explored < config.maxStates && goals.length < config.goalLimit) {
			const item = heap.pop()!;
			const cur = item.node;
			const sig = nodeSignature(cur);
			const recorded = bestG.get(sig);
			if (recorded !== undefined && recorded < item.g) continue;
			explored++;

			if (cur.satisfiedMask === goalMask) {
				goals.push({ steps: reconstruct(cur), finalState: cur.state, scenarioCount: cur.scenarioCount });
				continue;
			}
			if (cur.depth >= config.maxDepth) continue;

			for (const target of candidates) {
			if (!isNodeUnlocked(target, cur.state.flags)) continue;
			const travelCost = distance(cur.state.flags, cur.state.node, target);
			if (!Number.isFinite(travelCost)) continue;
			const alreadyStopped = cur.state.visitedStops.has(target);

			for (const option of stopOptions(target)) {
				if (option.outcome === 'LOSE_CAMPAIGN') continue;
				// Negated constraints prune violating options during search (not just post-hoc), so a
				// satisfying route is actually generated rather than starved by cheaper alternatives.
				if (optionViolatesNegative(target, option, expanded.negativeChecks)) continue;
				if (alreadyStopped) {
					if (!(target === startNode && option.isRevisit && !cur.revisitUsed)) continue;
				} else if (target === startNode && option.isRevisit) {
					continue;
				}
				if (option.isPrologue && cur.depth > 0) continue;
				if (cur.depth === 0 && !option.isPrologue) continue; // first move is always the prologue
				if (!requiresSatisfied(option.requires, cur.state)) continue;

					// Entry time = clock on arrival, before the stop's own time (drives scenario-level windows).
					const entryTime = cur.state.timePassed + travelCost;
					// Don't spend the single allowed stop at a scenario-level node before its window opens —
					// skip now so a later, in-window visit stays possible (else the node locks out unsatisfied).
					let beforeWindow = false;
					for (let i = 0; i < requirements.length; i++) {
						if (cur.satisfiedMask & (1 << i)) continue;
						const min = requirements[i]!.entryTimeWindow?.min;
						if (min !== undefined && entryTime < min && requirements[i]!.nodes.includes(target) && optionMatches(option, requirements[i]!.match)) {
							beforeWindow = true;
							break;
						}
					}
					if (beforeWindow) continue;

				const { state: nextState, firedReports } = applyStop(cur.state, option, travelCost);
				if (nextState.timePassed > config.timeCap) continue;
				const scenarioCount = cur.scenarioCount + (isCombatScenarioNode(target) ? 1 : 0);
				if (scenarioCount > config.scenarioCap) continue;

				let satisfiedMask = cur.satisfiedMask;
				for (let i = 0; i < requirements.length; i++) {
					if (satisfiedMask & (1 << i)) continue;
					const req = requirements[i]!;
					if (!req.nodes.includes(target) || !optionMatches(option, req.match)) continue;
						const w = req.entryTimeWindow;
						if (w && ((w.min !== undefined && entryTime < w.min) || (w.max !== undefined && entryTime > w.max))) continue;
						satisfiedMask |= 1 << i;
				}

				// Theft: crossing the Zeta box while holding an investigator Key triggers a take-back need.
				let theftPending = cur.theftPending;
				if (takeBackEnabled && !theftPending && cur.state.timePassed < zetaBox! && nextState.timePassed >= zetaBox!) {
					for (const bearer of cur.state.keys.values()) {
						if (bearerIsInvestigator(bearer)) { theftPending = true; break; }
					}
				}
				const takeBackCount = Math.min(
						requiredTakeBack,
						cur.takeBackCount + (takeBackEnabled && takeBackNodes.has(target) ? 1 : 0),
					);

				// The finale (Congress WIN) is terminal: only legal once every other goal is met AND any
				// stolen Key has been recovered at the required number of take-back sites.
				if (option.kind === 'finale') {
					if (satisfiedMask !== goalMask) continue;
					if (theftPending && takeBackCount < requiredTakeBack) continue;
				}

				const seq = `${cur.seq}>${target}:${option.optionId}`;
				const child: SearchNode = {
					state: nextState,
					satisfiedMask,
					parent: cur,
					step: { travelCost, option, fired: firedReports },
					scenarioCount,
					revisitUsed: cur.revisitUsed || option.isRevisit === true,
					theftPending,
					takeBackCount,
					depth: cur.depth + 1,
					seq,
				};
				const childSig = nodeSignature(child);
				const prev = bestG.get(childSig);
				if (prev !== undefined && prev <= nextState.timePassed) continue;
				bestG.set(childSig, nextState.timePassed);
				heap.push({ f: nextState.timePassed + heuristic(child), g: nextState.timePassed, seq, node: child });
			}
		}
	}

		return goals;
	};

	// Pass 1 (lean candidates) guarantees the minimal/baseline route is found cheaply; pass 2
	// (with the enrichment pool) supplies variety across scenario counts. Merge and dedup so the
	// diversity step has both the tightest routes and richer, longer alternatives to bucket.
	const withTakeBack = (arr: NodeId[]): NodeId[] =>
		takeBackEnabled ? [...new Set([...arr, ...takeBackNodes])] : arr;
	const lean = explore(withTakeBack(candidateNodes(expanded, false)));
	const enriched = explore(withTakeBack(candidateNodes(expanded, true)));
	const seen = new Set<string>();
	const merged: RawRoute[] = [];
	for (const r of [...lean, ...enriched]) {
		const key = r.steps.map((s) => `${s.option.node}:${s.option.optionId}`).join('>');
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(r);
	}
	return merged;
}

/** Dedup signature including value-bearing fields so materially different routes are not merged. */
function nodeSignature(n: SearchNode): string {
	const s = n.state;
	const heldKeys = [...s.keys.entries()]
		.filter(([, b]) => b === 'investigator' || b === 'conditional')
		.map(([k]) => k)
		.sort()
		.join(',');
	const allies = [...s.allies].sort().join(',');
	return `${stateSignature(s)}#${heldKeys}#${allies}#${s.trust}:${s.deception}#${n.satisfiedMask}#${n.theftPending ? 1 : 0}:${n.takeBackCount}`;
}

function requirementById(requirements: Requirement[], id: string): number {
	return requirements.findIndex((r) => r.id === id);
}
export { requirementById };
