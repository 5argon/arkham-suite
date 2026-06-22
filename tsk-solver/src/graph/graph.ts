/**
 * Dynamic adjacency, BFS distance, and reachability for travel.
 *
 * Two different gates apply to a location:
 *  - **Stopping** (playing a file): a `locked` *or* `secret` node can't be stopped at until an
 *    `unlock` effect adds it to `state.unlocked` (`isNodeUnlocked`). The start (London) is always
 *    stoppable (its `locked` marker only gates the 27-H revisit).
 *  - **Travelling through**: a `locked` node is *passable* — the cell may transit it (and pay time)
 *    even before it's unlocked; only a `secret` node (the unrevealed Bermuda Triangle) blocks travel
 *    until unlocked (`isPassable`). So the shortest-path graph excludes only hidden `secret` nodes.
 * Distances are a function of which secret nodes are revealed; we memoize per that frozen set.
 */

import { getLocation, locationIds, metadata } from '../data/load.js';
import type { NodeId } from '../types.js';

/** Nodes that can't be STOPPED at until unlocked (`locked` or `secret`, except the start). */
let _lockable: ReadonlySet<NodeId> | null = null;
export function lockableNodes(): ReadonlySet<NodeId> {
	if (!_lockable) {
		const start = metadata().startLocation;
		const set = new Set<NodeId>();
		for (const id of locationIds()) {
			const mt = getLocation(id).markerType;
			if ((mt === 'locked' || mt === 'secret') && id !== start) set.add(id);
		}
		_lockable = set;
	}
	return _lockable;
}

/** Nodes that block TRAVEL until revealed — only the hidden `secret` node(s), except the start. */
let _transitBlocked: ReadonlySet<NodeId> | null = null;
function transitBlockedNodes(): ReadonlySet<NodeId> {
	if (!_transitBlocked) {
		const start = metadata().startLocation;
		const set = new Set<NodeId>();
		for (const id of locationIds()) if (getLocation(id).markerType === 'secret' && id !== start) set.add(id);
		_transitBlocked = set;
	}
	return _transitBlocked;
}

/** Can the cell STOP (play a file) at `node`? `locked`/`secret` need to be unlocked first. */
export function isNodeUnlocked(node: NodeId, unlocked: ReadonlySet<NodeId>): boolean {
	if (node === metadata().startLocation) return true;
	if (!lockableNodes().has(node)) return true;
	return unlocked.has(node);
}

/** Can the cell TRAVEL through / into `node`? Locked nodes are passable; only secret nodes block. */
export function isPassable(node: NodeId, unlocked: ReadonlySet<NodeId>): boolean {
	if (node === metadata().startLocation) return true;
	if (!transitBlockedNodes().has(node)) return true;
	return unlocked.has(node);
}

/** Canonical, order-independent signature of the travel graph (which secret nodes are revealed). */
function unlockSignature(unlocked: ReadonlySet<NodeId>): string {
	const present: string[] = [];
	for (const n of transitBlockedNodes()) if (unlocked.has(n)) present.push(n);
	present.sort();
	return present.join('|');
}

const bfsMemo = new Map<string, Map<NodeId, Map<NodeId, number>>>();

function unlockedNodeSet(unlocked: ReadonlySet<NodeId>): Set<NodeId> {
	const set = new Set<NodeId>();
	for (const id of locationIds()) if (isPassable(id, unlocked)) set.add(id);
	return set;
}

/** BFS hop-count distances from `from` to every reachable node on the unlocked subgraph. */
export function reachableFrom(unlocked: ReadonlySet<NodeId>, from: NodeId): ReadonlyMap<NodeId, number> {
	const sig = unlockSignature(unlocked);
	let bySource = bfsMemo.get(sig);
	if (!bySource) {
		bySource = new Map();
		bfsMemo.set(sig, bySource);
	}
	const cached = bySource.get(from);
	if (cached) return cached;

	const unlockedSet = unlockedNodeSet(unlocked);
	const dist = new Map<NodeId, number>();
	if (!unlockedSet.has(from)) {
		bySource.set(from, dist);
		return dist;
	}
	dist.set(from, 0);
	const queue: NodeId[] = [from];
	let head = 0;
	while (head < queue.length) {
		const cur = queue[head++]!;
		const d = dist.get(cur)!;
		const neighbors = [...getLocation(cur).connections].sort();
		for (const next of neighbors) {
			if (!unlockedSet.has(next)) continue;
			if (dist.has(next)) continue;
			dist.set(next, d + 1);
			queue.push(next);
		}
	}
	bySource.set(from, dist);
	return dist;
}

/** Hop-count distance from `from` to `to` (Infinity if unreachable on the unlocked subgraph). */
export function distance(unlocked: ReadonlySet<NodeId>, from: NodeId, to: NodeId): number {
	const d = reachableFrom(unlocked, from).get(to);
	return d === undefined ? Infinity : d;
}

/**
 * A shortest node-by-node path from `from` to `to` on the unlocked subgraph (inclusive of both).
 * Returns `[]` if unreachable, `[from]` if `from === to`. Ties broken by sorted neighbour order
 * (deterministic). Used to preview the hop-by-hop travel a destination would cost.
 */
export function shortestPath(unlocked: ReadonlySet<NodeId>, from: NodeId, to: NodeId): NodeId[] {
	if (from === to) return [from];
	const unlockedSet = unlockedNodeSet(unlocked);
	if (!unlockedSet.has(from) || !unlockedSet.has(to)) return [];
	const parent = new Map<NodeId, NodeId>();
	const seen = new Set<NodeId>([from]);
	const queue: NodeId[] = [from];
	let head = 0;
	while (head < queue.length) {
		const cur = queue[head++]!;
		if (cur === to) break;
		for (const next of [...getLocation(cur).connections].sort()) {
			if (!unlockedSet.has(next) || seen.has(next)) continue;
			seen.add(next);
			parent.set(next, cur);
			queue.push(next);
		}
	}
	if (!seen.has(to)) return [];
	const path: NodeId[] = [to];
	let n: NodeId | undefined = to;
	while (n !== undefined && n !== from) {
		n = parent.get(n);
		if (n !== undefined) path.push(n);
	}
	return path.reverse();
}

/** Reset memoization (test isolation only). */
export function _resetGraphMemo(): void {
	bfsMemo.clear();
	_lockable = null;
	_transitBlocked = null;
}
