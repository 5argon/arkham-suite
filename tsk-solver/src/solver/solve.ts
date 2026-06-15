/**
 * Solver orchestrator (README §3, §12).
 *
 * Pipeline: expand constraints -> cheap impossibility checks (logical / scenario-count /
 * time-floor) -> bounded state-space search -> per-archetype scoring -> diversity clamp ->
 * recipe assembly (localized steps, totals, trust/deception, predicted ending, warnings,
 * satisfied constraints, earnable achievements). Deterministic: identical input -> identical
 * output (every collection is sorted before returning).
 */

import { getLocation, getScenario, loadDatabase } from '../data/load.js';
import { distance } from '../graph/graph.js';
import { keysHeldByInvestigator } from '../graph/state.js';
import type {
	Constraint,
	ConstraintRef,
	Difficulty,
	LocalizedString,
	NodeId,
	Recipe,
	SolveInput,
	SolveOutput,
	Step,
} from '../types.js';
import { evaluateAchievements } from './achievements.js';
import { canReachMix, canReachOverflow, chaosSummary } from './chaos.js';
import { selectByScenarioCount } from './diversity.js';
import { DEFAULT_SEARCH, search, type RawRoute, type RouteStep } from './search.js';
import { orderWarning, scoreSequence } from './sequence.js';
import { optimizeTicket, ticketConfig } from './ticket.js';
import {
	logicalProof,
	scenarioCountFloor,
	scenarioCountProof,
	searchBudgetProof,
	timeFloor,
	timeFloorProof,
} from './timefloor.js';
import { finaleBranchGroup, predictTrial } from './trial.js';
import {
	expandConstraints,
	optionMatches,
	type ExpandedConstraints,
	type NegativeCheck,
	type Requirement,
} from './waypoints.js';

/** Does a route's available trust/deception decisions satisfy every chaos-bag constraint? */
function chaosConstraintsSatisfied(route: RawRoute, constraints: Constraint[]): boolean {
	for (const c of constraints) {
		if (c.kind === 'chaos_mix' && !canReachMix(route, c.tablet, c.elderThing)) return false;
		if (c.kind === 'chaos_overflow_xp' && !canReachOverflow(route, c.min)) return false;
		// chaos_balanced is always achievable (alternate / neutral choices) — informational only.
	}
	return true;
}

/** Does a route satisfy a negated constraint (and thus must be excluded)? */
function violatesNegative(route: RawRoute, check: NegativeCheck): boolean {
	switch (check.kind) {
		case 'node':
			return route.steps.some((s) => s.option.node === check.node);
		case 'key':
			// Mirror the positive path: a negated "obtain key (held by you)" only excludes routes
			// where the key ends up with an investigator, not where an enemy bears it.
			return route.steps.some((s) =>
				optionMatches(
					s.option,
					check.investigatorOnly ? { type: 'key_investigator', key: check.key } : { type: 'key_any', key: check.key },
				),
			);
		case 'ally':
			return route.finalState.allies.has(check.ally);
		case 'resolution':
			return route.steps.some((s) => s.option.node === check.node && s.option.optionId === check.resolution);
		case 'version':
			return route.steps.some((s) => s.option.node === check.node && s.option.version === check.version);
		case 'flag':
			return route.finalState.flags.has(check.flag);
	}
}

const loc = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

/** Dedup routes by their stop/option sequence (stable order preserved). */
function dedupeRoutes(routes: RawRoute[]): RawRoute[] {
	const seen = new Set<string>();
	const out: RawRoute[] = [];
	for (const r of routes) {
		const key = r.steps.map((s) => `${s.option.node}:${s.option.optionId}`).join('>');
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(r);
	}
	return out;
}

/** Deterministic lexicographic k-combinations of `arr`, capped at `limit`. */
function combinations<T>(arr: T[], k: number, limit: number): T[][] {
	const out: T[][] = [];
	const pick = (start: number, acc: T[]): void => {
		if (out.length >= limit) return;
		if (acc.length === k) {
			out.push(acc.slice());
			return;
		}
		for (let i = start; i < arr.length; i++) {
			acc.push(arr[i]!);
			pick(i + 1, acc);
			acc.pop();
		}
	};
	pick(0, []);
	return out;
}

/**
 * Combat scenarios usable as optional padding: not already pinned/forbidden by the constraints, and
 * NOT locked. Locked scenarios (e.g. Without a Trace, Shades of Suffering) drag in their long unlock
 * chains — slow to search and time-cap-infeasible in large combinations — and reaching counts beyond
 * the non-locked set realistically needs the Expedited Ticket modeled in-search (not yet done).
 */
function paddingScenarios(constraints: Constraint[], expanded: ExpandedConstraints): string[] {
	const pinned = new Set<string>();
	for (const c of constraints) {
		const sid = (c as { scenario?: string }).scenario;
		if (typeof sid === 'string') pinned.add(sid);
	}
	const out = new Set<string>();
	for (const loc of loadDatabase().locations) {
		const sid = loc.scenario_id;
		const s = sid ? getScenario(sid) : undefined;
		if (!sid || !s || s.role === 'finale' || s.role === 'prologue') continue;
		if (loc.status === 'locked' || pinned.has(sid) || expanded.forbiddenNodes.has(loc.id)) continue;
		out.add(sid);
	}
	return [...out].sort();
}

/**
 * Seed higher scenario-count buckets than the time-minimizing base search reaches, by forcing
 * optional-scenario subsets (re-expanded as `visit_scenario` so LOCKED scenarios pull their unlock
 * chains too). Larger sizes are tried first each round so the maximum-count route is guaranteed
 * before the budget runs out; sizes that don't fit the time cap simply yield nothing. Only runs for
 * under-constrained queries (where each forced lean search stays cheap).
 */
function paddedHighCountRoutes(
	constraints: Constraint[],
	expanded: ExpandedConstraints,
	baseConfig: Parameters<typeof search>[1],
	baseMax: number,
): RawRoute[] {
	const meta = loadDatabase().campaign_metadata;
	const nonStructuralRelevant = [...expanded.relevantNodes].filter((n) => n !== meta.start_node && n !== meta.finale_node);
	if (nonStructuralRelevant.length > 2) return [];
	const pool = paddingScenarios(constraints, expanded);
	if (pool.length === 0) return [];

	const startSize = Math.max(1, baseMax - 2);
	// Larger subsets are expensive (a tighter ordering puzzle), and high counts have fewer distinct
	// sets anyway, so cap subsets-per-size: just confirm the top counts, vary the cheaper low counts.
	const perSizeCap = (size: number): number => (size >= 5 ? 1 : size === 4 ? 2 : 3);
	const bySize = new Map<number, string[][]>();
	for (let size = startSize; size <= pool.length; size++) bySize.set(size, combinations(pool, size, perSizeCap(size)));
	const sizesDesc = [...bySize.keys()].sort((a, b) => b - a); // largest first → reach max count early

	const out: RawRoute[] = [];
	let budget = 14;
	for (let round = 0; round < 3 && budget > 0; round++) {
		for (const size of sizesDesc) {
			if (budget <= 0) break;
			const subs = bySize.get(size)!;
			if (round >= subs.length) continue;
			const cs: Constraint[] = [...constraints, ...subs[round]!.map((s) => ({ kind: 'visit_scenario' as const, scenario: s }))];
			const aug = expandConstraints(cs);
			if (aug.requirements.length > 31) continue;
			budget--;
			// More forced scenarios = a tighter ordering puzzle needing more states; small subsets stop
			// early at goalLimit anyway, so scaling the cap by size keeps small searches cheap.
			const maxStates = Math.min(40000, 8000 + size * 5000);
			out.push(...search(aug, { ...baseConfig, leanOnly: true, maxStates, goalLimit: 12, perCountGoalCap: 12 }));
		}
	}
	return out;
}

export function solve(input: SolveInput): SolveOutput {
	const prefs = input.preferences ?? {};
	const meta = loadDatabase().campaign_metadata;
	const hardCap = meta.global_time_track_boxes;
	const perBucket = prefs.maxPerScenarioCount ?? 6;
	const totalCap = prefs.maxResults ?? 48;
	const difficulty: Difficulty = prefs.difficulty ?? 'standard';

	const expanded = expandConstraints(input.constraints);

	// 1. Logical impossibility (mutually exclusive goals).
	if (expanded.logicalConflict) {
		return { ok: false, proof: logicalProof(expanded.logicalConflict.conflict) };
	}

	// 1b. Capacity limit: the search packs goals into a 31-bit mask. Beyond that it can't represent
	// them, so surface it honestly as a constraint-set-too-large conflict (not a false time-floor).
	if (expanded.requirements.length > 31) {
		return {
			ok: false,
			proof: logicalProof(`too many goals (${expanded.requirements.length} > 31) — please narrow the constraints`),
		};
	}

	// 2. Scenario-count impossibility.
	if (prefs.maxScenarios !== undefined) {
		const sc = scenarioCountFloor(expanded);
		if (sc.count > prefs.maxScenarios) {
			return { ok: false, proof: scenarioCountProof(sc.count, sc.keys, prefs.maxScenarios) };
		}
	}

	// 3. Time-floor impossibility.
	const effectiveCap = Math.min(expanded.timeCap ?? hardCap, hardCap);
	const tf = timeFloor(expanded);
	if (tf.floor > effectiveCap) {
		return { ok: false, proof: timeFloorProof(expanded, tf, effectiveCap) };
	}

	// 4. Search (ticket handled post-hoc to keep the hot loop small).
	const tc = ticketConfig(prefs);
	// Scenario-level (entry-time window) constraints force *slower* routes (enter a scenario late),
	// which a time-minimizing A* reaches last — give those queries a larger state budget.
	const hasEntryWindow = expanded.requirements.some((r) => r.entryTimeWindow !== undefined);
	const baseConfig = {
		...DEFAULT_SEARCH,
		timeCap: effectiveCap,
		scenarioCap: prefs.maxScenarios ?? 999,
		maxStates: prefs.maxStates ?? (hasEntryWindow ? DEFAULT_SEARCH.maxStates * 3 : DEFAULT_SEARCH.maxStates),
		// Take-back insurance for the Zeta key theft (only routes that cross Zeta holding Keys are affected).
		requiredTakeBack: prefs.keyTakeBackSites ?? 1,
	};
	// A time-minimizing A* only ever finds the fewest-scenario routes; to let players browse longer
	// plans, constructively seed higher scenario-count routes by forcing extra optional scenarios as
	// waypoints (a goal-directed search then finds them cheaply). This also yields icon variety.
	const baseRoutes = search(expanded, baseConfig);
	const baseMax = Math.max(0, ...baseRoutes.map((r) => r.scenarioCount));
	const allRoutes = dedupeRoutes([...baseRoutes, ...paddedHighCountRoutes(input.constraints, expanded, baseConfig, baseMax)]);

	// Filter out routes that violate a negated constraint, fail a chaos goal, or miss a requested
	// Trial outcome. `acceptableTrials` (from reach_ending / achievement finale_trial / finale version,
	// already intersected) is the set of branches the route's predicted ending may be; two distinct
	// mutually-exclusive endings intersect to empty and are caught as a logical conflict above.
	const acceptableTrials = expanded.acceptableTrials;
	const routes = allRoutes.filter(
		(r) =>
			!expanded.negativeChecks.some((c) => violatesNegative(r, c)) &&
			chaosConstraintsSatisfied(r, input.constraints) &&
			(!acceptableTrials ||
				acceptableTrials.has(predictTrial(r.finalState.flags, r.finalState.trust, r.finalState.deception).branch)),
	);

	if (routes.length === 0) {
		// If the base search found routes but the post-filters (negation / chaos / Trial outcome)
		// removed them all, that's a (best-effort) constraint conflict, not a time-floor impossibility.
		if (allRoutes.length > 0) {
			const which = [
				expanded.negativeChecks.length ? 'exclusions' : '',
				input.constraints.some((c) => c.kind.startsWith('chaos_')) ? 'chaos goals' : '',
				acceptableTrials?.size ? `Trial outcome (${[...acceptableTrials].sort().join('/')})` : '',
			]
				.filter(Boolean)
				.join(', ');
			return { ok: false, proof: logicalProof(`no explored route satisfies: ${which || 'the requested constraints'}`) };
		}
		// The time floor is within the cap (step 3 already proved that), yet the bounded search found
		// nothing — so this is NOT a time-floor impossibility. Report it honestly as "no route found
		// within the search budget" rather than the contradictory "floor ≤ cap exceeds cap".
		return { ok: false, proof: searchBudgetProof(expanded) };
	}

	// 5. Diversity selection, bucketed by scenario count.
	const selected = selectByScenarioCount(routes, {
		perBucket,
		total: totalCap,
		mergeThreshold: loadDatabase().diversity.merge_threshold,
	});

	// 6. Sequential-priority warnings (optional).
	const orderedConstraintIndices = input.constraints
		.map((_, i) => i)
		.filter((i) => expanded.requirements.some((r) => r.constraintIndex === i));
	const fastestTime = Math.min(...routes.map((r) => r.finalState.timePassed));

	const recipes: Recipe[] = selected.map((sr) => {
		// The Expedited Ticket saves time, pulling later stops earlier — which would shift a scenario out
		// of its requested difficulty (entry-time) window. Skip it when such a constraint is present.
		const route = hasEntryWindow ? sr.route : optimizeTicket(sr.route, tc);
		return buildRecipe(route, expanded, input.constraints, difficulty, prefs.respectOrder === true, orderedConstraintIndices, fastestTime);
	});

	return { ok: true, recipes };
}

// --- recipe assembly --------------------------------------------------------

function buildRecipe(
	route: RawRoute,
	expanded: ExpandedConstraints,
	constraints: Constraint[],
	difficulty: Difficulty,
	respectOrder: boolean,
	orderedConstraintIndices: number[],
	fastestTime: number,
): Recipe {
	const finalState = route.finalState;
	const steps: Step[] = [];
	let timeAfter = 0;

	for (const rstep of route.steps) {
		const node = rstep.option.node;
		// Travel / ticket leg.
		if (rstep.usedTicket) {
			timeAfter += 0;
			steps.push({
				type: 'use_ticket',
				from: rstep.usedTicket.from,
				to: rstep.usedTicket.to,
				node,
				timeSaved: rstep.usedTicket.saved,
				resolutionRequired: false,
				reason: loc('use_ticket', { from: rstep.usedTicket.from, to: rstep.usedTicket.to, timeSaved: rstep.usedTicket.saved }),
				timeAfter,
			});
		} else if (rstep.travelCost > 0) {
			timeAfter += rstep.travelCost;
			steps.push({ type: 'travel', node, pathCost: rstep.travelCost, resolutionRequired: false, timeAfter });
		}

		// Status-report interrupts fire as time crosses a box; they typically trigger on arrival
		// (during the travel leg), so emit them here at the post-travel time, before the stop.
		for (const sym of rstep.fired) {
			steps.push({ type: 'status_report', marker: sym, resolutionRequired: false, reason: loc('status_report', { symbol: sym }), timeAfter });
		}

		// Stop time + the stop itself. The scenario's time-based "level" is read at the entry time.
		const entryTime = timeAfter;
		timeAfter += rstep.option.baseTime;
		const required = isResolutionRequired(expanded.requirements, node, rstep);
		const stepType: Step['type'] = rstep.option.kind === 'finale' ? 'finale' : rstep.option.kind === 'scenario' ? 'play' : 'stop';
		steps.push({
			type: stepType,
			node,
			scenario: getLocation(node).scenario_id ?? undefined,
			resolution: rstep.option.optionId,
			resolutionRequired: required.required,
			reason: required.reason ?? stepReason(stepType, node, rstep),
			scenarioLevel: scenarioLevelAt(node, entryTime),
			xp: rstep.option.xpBonus > 0 ? rstep.option.xpBonus : undefined,
			timeAfter,
		});
	}

	const trial = predictTrial(finalState.flags, finalState.trust, finalState.deception);
	const chaos = chaosSummary(route);
	const warnings = collectWarnings(route, expanded, respectOrder, orderedConstraintIndices, fastestTime);
	// Combat scenarios played, in order (prologue + middles + the Congress finale) — matches
	// scenarioCount and drives the scenario-icon row on each recipe card.
	const playedScenarios = route.steps
		.filter((s) => s.option.kind === 'scenario' || s.option.kind === 'finale')
		.map((s) => getLocation(s.option.node).scenario_id)
		.filter((s): s is string => s !== null);
	const satisfies = satisfiedConstraints(route, expanded, constraints, trial.branch);
	const requestedAch = new Set(
		constraints.filter((c): c is Extract<Constraint, { kind: 'achievement' }> => c.kind === 'achievement').map((c) => c.id),
	);
	const earnableAchievements = evaluateAchievements(route.steps, finalState, difficulty, trial, requestedAch);

	return {
		steps,
		totalTime: finalState.timePassed,
		scenarioCount: route.scenarioCount,
		playedScenarios,
		keysHeld: keysHeldByInvestigator(finalState),
		alliesRecruited: [...finalState.allies].sort(),
		trust: finalState.trust,
		deception: finalState.deception,
		bonusXp: finalState.xpBonus,
		chaosMaxOverflowXp: chaos.maxOverflowXp,
		freebies: collectFreebies(route, finalState, chaos.maxOverflowXp),
		tablet: finalState.tablet,
		elderThing: finalState.elderThing,
		endingBranch: trial.branch,
		warnings,
		satisfies,
		earnableAchievements,
	};
}

/** Brief summary of opportunistic side gains a route grabs (XP, Foundation Intel, chaos upgrades). */
function collectFreebies(route: RawRoute, finalState: { xpBonus: number }, overflowXp: number): LocalizedString[] {
	const out: LocalizedString[] = [];
	if (finalState.xpBonus > 0) out.push(loc('freebie_xp', { xp: finalState.xpBonus }));
	if (overflowXp > 0) out.push(loc('freebie_overflow_xp', { xp: overflowXp }));
	const chaosUp = route.steps.reduce((n, s) => n + (s.option.improvesChaos ?? 0), 0);
	if (chaosUp > 0) out.push(loc('freebie_chaos', { count: chaosUp }));
	if (route.steps.some((s) => s.option.grantsAsset === 'foundation_intel')) out.push(loc('freebie_intel', {}));
	return out;
}

/** The scenario's time-based level (1-based index + total) at the given entry time, if any. */
function scenarioLevelAt(node: string, entryTime: number): LocalizedString | undefined {
	const sid = getLocation(node).scenario_id;
	const tiers = sid ? getScenario(sid)?.time_tiers : undefined;
	if (!tiers || tiers.length === 0) return undefined;
	const idx = tiers.findIndex((t) => t.maxTime === null || entryTime <= t.maxTime);
	const tier = idx >= 0 ? tiers[idx]! : tiers[tiers.length - 1]!;
	const level = (idx >= 0 ? idx : tiers.length - 1) + 1;
	return loc('scenario_level', { level, total: tiers.length, label: tier.label });
}

function isResolutionRequired(
	requirements: Requirement[],
	node: string,
	rstep: RouteStep,
): { required: boolean; reason?: LocalizedString } {
	for (const req of requirements) {
		if (!req.specificResolution) continue;
		if (!req.nodes.includes(node)) continue;
		if (optionMatches(rstep.option, req.match)) return { required: true, reason: req.reason };
	}
	return { required: false };
}

function stepReason(type: Step['type'], node: string, rstep: RouteStep): LocalizedString {
	if (type === 'finale') return loc('finale_win', {});
	if (type === 'play') return loc('any_resolution_ok', { scenario: getScenario(getLocation(node).scenario_id ?? '')?.name ?? node });
	return loc('stop_interlude', { node: getLocation(node).name });
}

function collectWarnings(
	route: RawRoute,
	expanded: ExpandedConstraints,
	respectOrder: boolean,
	orderedConstraintIndices: number[],
	fastestTime: number,
): LocalizedString[] {
	const warnings: LocalizedString[] = [];

	// Time-scaling warnings: entering a time-scaled scenario late.
	let t = 0;
	for (const rstep of route.steps) {
		t += rstep.travelCost + rstep.option.baseTime;
		const sid = getLocation(rstep.option.node).scenario_id;
		const scenario = sid ? getScenario(sid) : undefined;
		if (scenario?.time_scaling) {
			const entryTime = t - rstep.option.baseTime;
			for (const ts of scenario.time_scaling) {
				const threshold = parseThreshold(ts.at);
				if (threshold !== null && entryTime >= threshold) {
					warnings.push(loc('warning_time_scaling', { scenario: scenario.name, threshold, effect: ts.effect }));
				}
			}
		}
	}

	// Key-theft (Zeta) warning: if the route still holds Key(s) when it crosses the Zeta box, a
	// random held Key will be stolen — recover it at a 14-C "Ruses and Reclamation" site. Dormant
	// until the Zeta box is set in the data (status_reports.zeta.at_box).
	const zeta = loadDatabase().status_reports.zeta;
	const zetaBox = typeof zeta?.at_box === 'number' ? zeta.at_box : null;
	if (zetaBox !== null) {
		let t = 0;
		const held = new Set<string>();
		let theftRisk = false;
		for (const rstep of route.steps) {
			const before = t;
			t += rstep.travelCost + rstep.option.baseTime;
			if (before < zetaBox && zetaBox <= t && held.size > 0) theftRisk = true;
			const opt = rstep.option;
			if (opt.grantsKey) held.add(opt.grantsKey);
			if (opt.key && (opt.bearer === 'investigator' || opt.bearer === 'conditional') && !opt.noResolution) held.add(opt.key);
		}
		if (theftRisk) {
			const sites = loadDatabase()
				.locations.filter((l) => l.status === 'locked' && l.unlock_condition === 'code_14C_written')
				.map((l) => l.name)
				.join(', ');
			warnings.push(loc('warning_key_theft', { box: zetaBox, sites }));
		}
	}

	// Sequential-priority warning.
	if (respectOrder && orderedConstraintIndices.length > 1) {
		const seq = scoreSequence(route, expanded.requirements, orderedConstraintIndices);
		const w = orderWarning(seq, fastestTime, route.finalState.timePassed);
		if (w) warnings.push(w);
	}

	return dedupeLocalized(warnings);
}

function parseThreshold(at: string): number | null {
	const m = />=\s*(\d+)/.exec(at);
	return m ? Number(m[1]) : null;
}

function satisfiedConstraints(
	route: RawRoute,
	expanded: ExpandedConstraints,
	constraints: Constraint[],
	trialBranch: string,
): ConstraintRef[] {
	const satisfiedIndices = new Set<number>();
	for (const req of expanded.requirements) {
		if (req.constraintIndex < 0) continue;
		const ok = route.steps.some((s) => req.nodes.includes(s.option.node) && optionMatches(s.option, req.match));
		if (ok) satisfiedIndices.add(req.constraintIndex);
	}
	// Finale-outcome constraints have no node requirement (the result is predicted from the route's
	// flags); report them satisfied when the predicted branch matches the request. A finale
	// scenario_version is satisfied by any Trial branch in its group (v.II = 3/4/5, v.III = 6/7).
	constraints.forEach((c, index) => {
		if (c.kind === 'reach_ending' && c.trial === trialBranch) satisfiedIndices.add(index);
		if (c.kind === 'scenario_version') {
			const sc = loadDatabase().scenarios[c.scenario];
			const t = sc?.role === 'finale' ? sc.versions?.[c.version]?.trial : undefined;
			if (t !== undefined && finaleBranchGroup(`trial_${t}`).includes(trialBranch)) satisfiedIndices.add(index);
		}
	});
	return [...satisfiedIndices]
		.sort((a, b) => a - b)
		.map((index) => ({ index, kind: constraints[index]!.kind, label: loc('constraint_satisfied', { index }) }));
}

function dedupeLocalized(items: LocalizedString[]): LocalizedString[] {
	const seen = new Set<string>();
	const out: LocalizedString[] = [];
	for (const it of items) {
		const key = `${it.id}|${JSON.stringify(it.params)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(it);
	}
	return out;
}

// re-export for tests
export { distance };
