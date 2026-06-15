/**
 * Diversity selection, organized by scenario count (README §4.6).
 *
 * The solver computes many winning routes; players browse them by *how many combat scenarios*
 * they want to play. So instead of a single global top-N, we bucket routes by scenario count
 * and, within each bucket, keep a diverse set (Jaccard-clustered on (node, resolution) pairs so
 * near-identical routes collapse). Each scenario-count bucket therefore offers its own pool of
 * distinct choices. Deterministic throughout.
 */

import { getLocation, getScenario, loadDatabase } from '../data/load.js';
import type { RawRoute } from './search.js';

/** Feature set for similarity: visited node ids + `node:resolution` pairs. */
export function featureSet(route: RawRoute): Set<string> {
	const set = new Set<string>();
	for (const step of route.steps) {
		set.add(`node:${step.option.node}`);
		set.add(`res:${step.option.node}:${step.option.optionId}`);
	}
	return set;
}

/** The set of combat scenarios a route plays — i.e. the icons shown on its card. */
export function scenarioFeature(route: RawRoute): Set<string> {
	const set = new Set<string>();
	for (const step of route.steps) {
		const sid = getLocation(step.option.node).scenario_id;
		if (sid && getScenario(sid)) set.add(sid);
	}
	return set;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 && b.size === 0) return 1;
	let inter = 0;
	for (const x of a) if (b.has(x)) inter++;
	const union = a.size + b.size - inter;
	return union === 0 ? 1 : inter / union;
}

export interface SelectedRoute {
	route: RawRoute;
	scenarioCount: number;
}

export interface DiversityOptions {
	/** Distinct routes kept per scenario-count bucket. */
	perBucket: number;
	/** Overall safety cap across all buckets. */
	total: number;
	/** Routes at/above this Jaccard similarity collapse into one. */
	mergeThreshold: number;
}

/** A stable per-route key for deterministic tie-breaking. */
function routeKey(r: RawRoute): string {
	return r.steps.map((s) => `${s.option.node}:${s.option.optionId}`).join('>');
}

/**
 * Bucket routes by scenario count; within each bucket keep up to `perBucket` Jaccard-distinct
 * routes (cheapest-time representative first). Then trim to `total` round-robin across buckets so
 * every scenario count stays represented. Returns routes sorted by (scenarioCount, time, key).
 */
export function selectByScenarioCount(routes: RawRoute[], opts: DiversityOptions): SelectedRoute[] {
	const buckets = new Map<number, RawRoute[]>();
	for (const r of routes) {
		const list = buckets.get(r.scenarioCount) ?? [];
		list.push(r);
		buckets.set(r.scenarioCount, list);
	}

	// Per-bucket diverse selection.
	const perBucketSelected = new Map<number, SelectedRoute[]>();
	for (const [count, list] of buckets) {
		// Cheapest time first; among equal-time routes prefer more bonus XP (free grabs), then a
		// stable key. This makes the kept representative pick up free XP when it costs no extra time.
		const sorted = [...list].sort(
			(a, b) =>
				a.finalState.timePassed - b.finalState.timePassed ||
				b.finalState.xpBonus - a.finalState.xpBonus ||
				(routeKey(a) < routeKey(b) ? -1 : 1),
		);
		// First collapse near-identical routes (Jaccard on the full feature set).
		const unique: { route: RawRoute; feature: Set<string>; scen: Set<string> }[] = [];
		for (const route of sorted) {
			const feature = featureSet(route);
			if (unique.some((u) => jaccard(u.feature, feature) >= opts.mergeThreshold)) continue;
			unique.push({ route, feature, scen: scenarioFeature(route) });
		}
		// Then farthest-first on the SCENARIO set so the kept cards show varied icons: take the cheapest
		// route, then repeatedly the one whose scenario set is most different from those already kept.
		const kept: typeof unique = [];
		if (unique.length > 0) kept.push(unique[0]!); // cheapest representative
		while (kept.length < opts.perBucket && kept.length < unique.length) {
			let best = -1;
			let bestScore = -1;
			for (let i = 0; i < unique.length; i++) {
				if (kept.includes(unique[i]!)) continue;
				// Distance to the nearest already-kept route's scenario set (1 - Jaccard); higher = more varied.
				let minDist = Infinity;
				for (const k of kept) minDist = Math.min(minDist, 1 - jaccard(k.scen, unique[i]!.scen));
				if (minDist > bestScore) {
					bestScore = minDist; // ties keep the earlier (cheaper) candidate — deterministic
					best = i;
				}
			}
			if (best < 0) break;
			kept.push(unique[best]!);
		}
		perBucketSelected.set(
			count,
			kept.map((k) => ({ route: k.route, scenarioCount: count })),
		);
	}

	// Round-robin across buckets (ascending scenario count) up to the total cap, so smaller and
	// larger playthroughs both stay represented when the cap bites.
	const counts = [...perBucketSelected.keys()].sort((a, b) => a - b);
	const cursors = new Map(counts.map((c) => [c, 0]));
	const out: SelectedRoute[] = [];
	let progress = true;
	while (out.length < opts.total && progress) {
		progress = false;
		for (const c of counts) {
			if (out.length >= opts.total) break;
			const list = perBucketSelected.get(c)!;
			const i = cursors.get(c)!;
			if (i < list.length) {
				out.push(list[i]!);
				cursors.set(c, i + 1);
				progress = true;
			}
		}
	}

	out.sort(
		(a, b) =>
			a.scenarioCount - b.scenarioCount ||
			a.route.finalState.timePassed - b.route.finalState.timePassed ||
			(routeKey(a.route) < routeKey(b.route) ? -1 : 1),
	);
	return out;
}
