/**
 * Manual plan simulator.
 *
 * A `Plan` is a player-authored sequence of "travel to X, make these pre-scenario choices, resolve
 * option Y" steps. `simulatePlan` folds it through the pure campaign state machine (`applyStop`),
 * computing time + full state after every step, the shortest-path travel cost of each leg, and a
 * per-step legality verdict. Invalid steps are NOT rejected — their effects are still applied
 * (best-effort) so the running state and every later step keep computing while the bad step is
 * flagged with the exact missing prerequisite. This replaces the old route search entirely: the app
 * never routes for the player, it only scores the plan the player builds.
 */

import { getInterlude, getLocation, getScenario, loadDatabase } from '../data/load.js';
import { distance, isNodeUnlocked } from '../graph/graph.js';
import { isAutoInterlude, isCombatScenarioNode, preChoicesAt, requiresSatisfied, stopOptions, type StopOption } from '../graph/model.js';
import { applyStop, bearerIsInvestigator, initialState, keysHeldByInvestigator, travelTo } from '../graph/state.js';
import type { CampaignState, KeyId, LocalizedString, MarkerSymbol, NodeId, RawIntroChoice } from '../types.js';
import type { RouteStep } from './route-types.js';
import { predictTrial, type TrialPrediction } from './trial.js';

// --- public types -----------------------------------------------------------

/** One player-authored action: travel to `node`, make `introChoiceIds`, then resolve `optionId`. */
export interface PlanStep {
	node: NodeId;
	/** Resolution / interlude outcome / side-story product id chosen at `node`. */
	optionId: string;
	/** Selected pre-scenario choice ids (a subset of `preChoicesAt(node)`), applied before the option. */
	introChoiceIds?: string[];
	/** Reach `node` via a 0-time Expedited Ticket jump instead of normal travel. */
	useTicket?: boolean;
	/** Travel here and do NOTHING (the rules allow declining to act) — no stop, no effects. Lets a plan
	 *  loop to burn time / trigger calendar events. When true, `optionId`/`introChoiceIds` are ignored. */
	travelOnly?: boolean;
}

export interface Plan {
	steps: PlanStep[];
}

/** Why a step is (currently) illegal. The step's effects are still applied best-effort. */
export interface StepProblem {
	kind: 'node_locked' | 'requires_unmet' | 'unreachable' | 'ticket_unavailable' | 'stop_locked' | 'no_option';
	detail: LocalizedString;
}

/** A simulated step: the executed stop + the state it leaves + its legality verdict. */
export interface SimStep extends RouteStep {
	/** Clock on arrival, before the stop's own time (drives the scenario's time-tier level). */
	entryTime: number;
	/** Clock after the stop (= stateAfter.timePassed). */
	timeAfter: number;
	stateAfter: CampaignState;
	/** Change in the Foundation Trust / Cell Deception tallies this step contributes (≥ 0). These
	 *  tallies are compared once at the epilogue (Trust ≥ Deception ⇒ the cell is kept on). */
	trustDelta: number;
	deceptionDelta: number;
	/** Pre-scenario choices applied this step (resolved from introChoiceIds). */
	introChoices: RawIntroChoice[];
	/** True => the player travelled here and did nothing (no stop, no effects). */
	travelOnly: boolean;
	/** Empty => the step is legal at this point in the plan. */
	problems: StepProblem[];
	/** The scenario's time-based level at entry, if it has tiers (e.g. "Lv. 3/4 — …"). */
	scenarioLevel?: LocalizedString;
	/** Time-scaling notes when a time-scaled scenario is entered late. */
	warnings: LocalizedString[];
	/** For a finale step: the Trial outcome predicted from the state BEFORE it (shown even if invalid). */
	finale?: TrialPrediction;
}

export interface PlanTrajectory {
	steps: SimStep[];
	finalState: CampaignState;
	/** Combat scenarios played (prologue + middles + the Congress finale). */
	scenarioCount: number;
	/** Keys held by an investigator at the end. */
	keysHeld: KeyId[];
	/** The plan crosses the Zeta box still holding a Key — one held Key will be randomly stolen. */
	keyTheftRisk: boolean;
	/** After a theft, the plan passes a Ruses & Reclamation take-back site — a stolen Key may return. */
	keyRecoveryAvailable: boolean;
}

// --- helpers ----------------------------------------------------------------

const loc = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

/** `code_56Y_written` → `56-Y` (the human box code); pass-through otherwise. */
function humanizeCode(code: string | undefined): string {
	if (!code) return '';
	const m = /code_([0-9]+)([A-Z])_written/i.exec(code);
	return m ? `${m[1]}-${m[2]}` : code;
}

/** Turn a raw `requires` string (e.g. `met_irawan + time>=20`) into readable English (best-effort). */
function humanizeRequires(raw: string): string {
	return raw
		.replace(/\([^)]*\)/g, '')
		.split('+')
		.map((s) => s.trim())
		.filter(Boolean)
		.map((tok) => {
			const t = tok.toLowerCase();
			let m = /^time\s*(<=|>=|<|>)\s*(\d+)$/.exec(t);
			if (m) return `time ${m[1]} ${m[2]}`;
			m = /^version_(v\d+)$/.exec(t);
			if (m) return `${m[1]} version`;
			m = /^code_([0-9]+)([a-z])_written$/.exec(t);
			if (m) return `${m[1]}-${m[2]!.toUpperCase()} unlocked`;
			return tok.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		})
		.join(' + ');
}

/** The scenario's time-based level (1-based tier index + total) at the given entry time, if any. */
function scenarioLevelAt(node: NodeId, entryTime: number): LocalizedString | undefined {
	const sid = getLocation(node).scenario_id;
	const tiers = sid ? getScenario(sid)?.time_tiers : undefined;
	if (!tiers || tiers.length === 0) return undefined;
	const idx = tiers.findIndex((t) => t.maxTime === null || entryTime <= t.maxTime);
	const tier = idx >= 0 ? tiers[idx]! : tiers[tiers.length - 1]!;
	const level = (idx >= 0 ? idx : tiers.length - 1) + 1;
	return loc('scenario_level', { level, total: tiers.length, label: tier.label });
}

/** Time-scaling notes for entering a time-scaled scenario at/after a doom threshold. */
function timeScalingWarnings(node: NodeId, entryTime: number): LocalizedString[] {
	const sid = getLocation(node).scenario_id;
	const scenario = sid ? getScenario(sid) : undefined;
	const out: LocalizedString[] = [];
	for (const ts of scenario?.time_scaling ?? []) {
		const m = />=\s*(\d+)/.exec(ts.at);
		const threshold = m ? Number(m[1]) : null;
		if (threshold !== null && entryTime >= threshold) {
			out.push(loc('warning_time_scaling', { scenario: scenario!.name, threshold, effect: ts.effect }));
		}
	}
	return out;
}

/** Resolve a plan step's option to a concrete `StopOption`; synthesize an inert placeholder if absent. */
function resolveOption(node: NodeId, optionId: string): { option: StopOption; missing: boolean } {
	const found = stopOptions(node).find((o) => o.optionId === optionId);
	if (found) return { option: found, missing: false };
	// Stale share link / removed option: keep the step (best-effort) with an effect-free placeholder.
	const placeholder: StopOption = {
		node,
		optionId,
		kind: isCombatScenarioNode(node) ? 'scenario' : 'interlude',
		baseTime: 0,
		key: null,
		bearer: null,
		logs: [],
		grantsAllies: [],
		xpBonus: 0,
		noResolution: false,
	};
	return { option: placeholder, missing: true };
}

let _takeBackNodes: ReadonlySet<NodeId> | null = null;
function takeBackNodes(): ReadonlySet<NodeId> {
	if (!_takeBackNodes) {
		_takeBackNodes = new Set(
			loadDatabase().locations.filter((l) => l.scenario_id === 'ruses_and_reclamation').map((l) => l.id),
		);
	}
	return _takeBackNodes;
}

function zetaBox(): number | null {
	const zeta = loadDatabase().status_reports.zeta;
	return typeof zeta?.at_box === 'number' ? zeta.at_box : null;
}

// --- the simulation ---------------------------------------------------------

export function simulatePlan(plan: Plan): PlanTrajectory {
	const meta = loadDatabase().campaign_metadata;
	const startNode = meta.start_node;
	const finaleNode = meta.finale_node;
	// Omega (the final time-track box) warps the cell straight to the Congress — so reaching the finale
	// once the clock is full costs no travel (the curse-token penalty is applied by crossTime).
	const omegaBox = meta.global_time_track_boxes;
	const zeta = zetaBox();
	const takeBacks = takeBackNodes();

	let state = initialState();
	const steps: SimStep[] = [];
	let theftRisk = false;
	let recoveryAvailable = false;

	for (const ps of plan.steps) {
		const node = ps.node;
		const before = state;
		const travelOnly = ps.travelOnly === true;
		// "Check log → outcome" interludes are resolved by the game from current state, not chosen.
		const auto = !travelOnly && isAutoInterlude(node);
		const problems: StepProblem[] = [];

		// Node lock (applies whether stopping or just passing through). London is always enterable.
		if (!isNodeUnlocked(node, before.flags)) {
			const code = humanizeCode(getLocation(node).unlock_condition);
			problems.push({ kind: 'node_locked', detail: loc('problem_node_locked', { node: getLocation(node).name, code }) });
		}

		// Travel cost (shortest path on the currently-unlocked subgraph). A ticket jump is 0-time.
		const reachDist = distance(before.flags, before.node, node);
		const omegaWarp = node === finaleNode && before.timePassed >= omegaBox;
		let travelCost: number;
		let usedTicket: SimStep['usedTicket'];
		const warnings: LocalizedString[] = [];
		if (omegaWarp) {
			// Out of time at Omega — forced, free warp to Tunguska (no ticket / unreachable problems).
			travelCost = 0;
			warnings.push(loc('warning_omega_warp', {}));
		} else if (ps.useTicket) {
			travelCost = 0;
			usedTicket = { from: before.node, to: node, saved: Number.isFinite(reachDist) ? reachDist : 0 };
			if (!before.hasTicket) {
				problems.push({ kind: 'ticket_unavailable', detail: loc('problem_ticket_unavailable', {}) });
			}
		} else if (Number.isFinite(reachDist)) {
			travelCost = reachDist;
		} else {
			travelCost = 0; // provisional — keep downstream time finite
			problems.push({ kind: 'unreachable', detail: loc('problem_unreachable', { node: getLocation(node).name }) });
		}

		const entryTime = before.timePassed + travelCost;

		// Resolve the stop, or — for a travel-only step — apply nothing (no stop recorded, no effects).
		let option: StopOption;
		let introChoices: RawIntroChoice[] = [];
		let finale: TrialPrediction | undefined;
		let after: CampaignState;
		let firedReports: MarkerSymbol[];
		if (travelOnly) {
			option = { node, optionId: '', kind: 'interlude', baseTime: 0, key: null, bearer: null, logs: [], grantsAllies: [], xpBonus: 0, noResolution: true };
			({ state: after, firedReports } = travelTo(before, node, travelCost, ps.useTicket === true));
		} else if (auto) {
			// The game checks the log and resolves automatically: a satisfied CONDITIONAL outcome wins,
			// else the requires-less fallback. (Order-independent — Special Delivery lists "receive" first.)
			// No requires_unmet — reorder the node to change which branch you land on.
			const opts = stopOptions(node).filter((o) => o.outcome !== 'LOSE_CAMPAIGN');
			option =
				opts.find((o) => o.requires && requiresSatisfied(o.requires, before)) ??
				opts.find((o) => !o.requires) ??
				opts[0] ??
				resolveOption(node, ps.optionId).option;
			const isLondonRevisit = node === startNode && option.isRevisit === true;
			if (before.visitedStops.has(node) && !isLondonRevisit) {
				problems.push({ kind: 'stop_locked', detail: loc('problem_stop_locked', { node: getLocation(node).name }) });
			}
			({ state: after, firedReports } = applyStop(before, option, travelCost, ps.useTicket === true));
		} else {
			const resolved = resolveOption(node, ps.optionId);
			option = resolved.option;
			const allPreChoices = preChoicesAt(node);
			introChoices = (ps.introChoiceIds ?? [])
				.map((id) => allPreChoices.find((c) => c.id === id))
				.filter((c): c is RawIntroChoice => c !== undefined);

			// Stop-lockout: a node may be stopped at once (London twice — prologue + revisit).
			const isLondonRevisit = node === startNode && option.isRevisit === true;
			if (before.visitedStops.has(node) && !isLondonRevisit) {
				problems.push({ kind: 'stop_locked', detail: loc('problem_stop_locked', { node: getLocation(node).name }) });
			}
			// `requires` gates on the option and on each selected pre-choice.
			if (option.requires && !requiresSatisfied(option.requires, before)) {
				problems.push({ kind: 'requires_unmet', detail: loc('problem_requires_unmet', { requires: humanizeRequires(option.requires) }) });
			}
			for (const c of introChoices) {
				if (c.requires && !requiresSatisfied(c.requires, before)) {
					problems.push({ kind: 'requires_unmet', detail: loc('problem_requires_unmet', { requires: humanizeRequires(c.requires) }) });
				}
			}
			if (resolved.missing) {
				problems.push({ kind: 'no_option', detail: loc('problem_no_option', { option: ps.optionId, node: getLocation(node).name }) });
			}
			// Finale prediction reads the state BEFORE playing the Congress (the table you bring to the vote).
			finale = option.kind === 'finale' ? predictTrial(before.flags, before.trust, before.deception) : undefined;
			({ state: after, firedReports } = applyStop(before, option, travelCost, ps.useTicket === true, introChoices));
		}

		// Key theft (Zeta crossing while holding a Key) + take-back recovery, informational only.
		if (zeta !== null) {
			if (before.timePassed < zeta && after.timePassed >= zeta) {
				if ([...before.keys.values()].some((b) => bearerIsInvestigator(b))) theftRisk = true;
			}
			if (theftRisk && takeBacks.has(node)) recoveryAvailable = true;
		}

		steps.push({
			travelCost,
			option,
			fired: firedReports,
			usedTicket,
			entryTime,
			timeAfter: after.timePassed,
			stateAfter: after,
			trustDelta: after.trust - before.trust,
			deceptionDelta: after.deception - before.deception,
			introChoices,
			travelOnly,
			problems,
			scenarioLevel: travelOnly ? undefined : scenarioLevelAt(node, entryTime),
			warnings: [...warnings, ...(travelOnly ? [] : timeScalingWarnings(node, entryTime))],
			finale,
		});
		state = after;
	}

	const scenarioCount = steps.filter((s) => s.option.kind === 'scenario' || s.option.kind === 'finale').length;
	return {
		steps,
		finalState: state,
		scenarioCount,
		keysHeld: keysHeldByInvestigator(state),
		keyTheftRisk: theftRisk,
		keyRecoveryAvailable: recoveryAvailable,
	};
}

// --- picker helpers (annotate, never hide — invalid steps are allowed) ------

export interface Destination {
	node: NodeId;
	name: string;
	/** The location's file code (e.g. "52-U"), if any — players may recall a place by it. */
	file?: string;
	/** The scenario/interlude played here (e.g. "The Safehouse"), if any. */
	story?: string;
	/** Shortest-path hops from the current node on the unlocked subgraph; null if unreachable now. */
	travel: number | null;
	/** The node itself is locked (needs an unlock code) at the current state. */
	locked: boolean;
}

/** Every actionable node (has stop options), annotated with travel cost + lock state from `state`. */
export function reachableDestinations(state: CampaignState): Destination[] {
	const out: Destination[] = [];
	for (const l of loadDatabase().locations) {
		if (stopOptions(l.id).length === 0) continue;
		const d = distance(state.flags, state.node, l.id);
		const story = l.scenario_id ? (getScenario(l.scenario_id)?.name ?? getInterlude(l.scenario_id)?.name) : undefined;
		out.push({
			node: l.id,
			name: l.name,
			file: l.file ?? undefined,
			story: story ?? undefined,
			travel: Number.isFinite(d) ? d : null,
			locked: !isNodeUnlocked(l.id, state.flags),
		});
	}
	out.sort((a, b) => (a.travel ?? Infinity) - (b.travel ?? Infinity) || (a.node < b.node ? -1 : 1));
	return out;
}

export interface OptionChoice {
	option: StopOption;
	/** Non-empty => this option's `requires` gate is unmet at `state` (still selectable, will be flagged). */
	problems: StepProblem[];
}

/** Playable options at `node` (excludes campaign-losing outcomes), annotated with requires problems. */
export function optionsAt(state: CampaignState, node: NodeId): OptionChoice[] {
	return stopOptions(node)
		.filter((o) => o.outcome !== 'LOSE_CAMPAIGN')
		.map((option) => {
			const problems: StepProblem[] = [];
			if (option.requires && !requiresSatisfied(option.requires, state)) {
				problems.push({ kind: 'requires_unmet', detail: loc('problem_requires_unmet', { requires: option.requires }) });
			}
			return { option, problems };
		});
}

/** Test-only reset. */
export function _resetSimulateCaches(): void {
	_takeBackNodes = null;
}
