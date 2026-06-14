/**
 * Dynamic adjacency, BFS distance, and reachability on the *currently unlocked*
 * subgraph (README §2.3, §4.1).
 *
 * A locked node is absent from the graph — it can be neither stopped at nor passed
 * through — until its `unlock_condition` flag is present. Distances are therefore a
 * function of campaign state. We memoize per the frozen set of unlock flags so that
 * repeated queries during search are cheap, while staying perfectly deterministic.
 */

import { getLocation, loadDatabase, locationsById } from '../data/load.js';
import type { FlagId, NodeId } from '../types.js';

/** Flags that, when present, unlock one or more `status: "locked"` location nodes. */
let _travelUnlockFlags: ReadonlySet<FlagId> | null = null;
export function travelUnlockFlags(): ReadonlySet<FlagId> {
	if (!_travelUnlockFlags) {
		const flags = new Set<FlagId>();
		for (const loc of loadDatabase().locations) {
			if (loc.status === 'locked' && loc.unlock_condition) flags.add(loc.unlock_condition);
		}
		_travelUnlockFlags = flags;
	}
	return _travelUnlockFlags;
}

const startNode = (): NodeId => loadDatabase().campaign_metadata.start_node;

/**
 * Is `node` enterable (travel / pass-through) given `flags`?
 * The start node (London) is always enterable — it is the campaign origin even though
 * its `status` is "locked" (that lock only gates the 27-H *revisit stop*, not travel).
 */
export function isNodeUnlocked(node: NodeId, flags: ReadonlySet<FlagId>): boolean {
	const loc = getLocation(node);
	if (loc.id === startNode()) return true;
	if (loc.status !== 'locked') return true;
	return loc.unlock_condition !== undefined && flags.has(loc.unlock_condition);
}

/** Canonical, order-independent signature of the unlocked subgraph for `flags`. */
function unlockSignature(flags: ReadonlySet<FlagId>): string {
	const present: string[] = [];
	for (const f of travelUnlockFlags()) {
		if (flags.has(f)) present.push(f);
	}
	present.sort();
	return present.join('|');
}

// Memo: unlock signature -> (source node -> distance map)
const bfsMemo = new Map<string, Map<NodeId, Map<NodeId, number>>>();

function unlockedNodeSet(flags: ReadonlySet<FlagId>): Set<NodeId> {
	const set = new Set<NodeId>();
	for (const id of locationsById().keys()) {
		if (isNodeUnlocked(id, flags)) set.add(id);
	}
	return set;
}

/**
 * BFS hop-count distances from `from` to every reachable node on the unlocked subgraph.
 * Nodes not in the result are unreachable (treat distance as Infinity).
 */
export function reachableFrom(flags: ReadonlySet<FlagId>, from: NodeId): ReadonlyMap<NodeId, number> {
	const sig = unlockSignature(flags);
	let bySource = bfsMemo.get(sig);
	if (!bySource) {
		bySource = new Map();
		bfsMemo.set(sig, bySource);
	}
	const cached = bySource.get(from);
	if (cached) return cached;

	const unlocked = unlockedNodeSet(flags);
	const dist = new Map<NodeId, number>();
	if (!unlocked.has(from)) {
		bySource.set(from, dist);
		return dist;
	}
	dist.set(from, 0);
	const queue: NodeId[] = [from];
	let head = 0;
	while (head < queue.length) {
		const cur = queue[head++]!;
		const d = dist.get(cur)!;
		// Sort neighbors for deterministic BFS ordering (does not affect hop counts,
		// but keeps any tie-dependent downstream ordering stable).
		const neighbors = [...getLocation(cur).connections].sort();
		for (const next of neighbors) {
			if (!unlocked.has(next)) continue;
			if (dist.has(next)) continue;
			dist.set(next, d + 1);
			queue.push(next);
		}
	}
	bySource.set(from, dist);
	return dist;
}

/** Hop-count distance from `from` to `to` on the unlocked subgraph (Infinity if unreachable). */
export function distance(flags: ReadonlySet<FlagId>, from: NodeId, to: NodeId): number {
	const d = reachableFrom(flags, from).get(to);
	return d === undefined ? Infinity : d;
}

/** Reset memoization (test isolation only). */
export function _resetGraphMemo(): void {
	bfsMemo.clear();
}
