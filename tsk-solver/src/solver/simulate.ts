/**
 * Manual plan simulator.
 *
 * A `Plan` is a player-authored sequence of "travel to a location, play this file, make these
 * choices" steps. `simulatePlan` folds it through the pure state machine (`applyFile`/`travelTo`),
 * computing the full campaign state after every step, each leg's shortest-path travel cost, and a
 * per-step legality verdict. Invalid steps are NOT rejected — their effects still apply
 * (best-effort) so the running state and every later step keep computing while the bad step is
 * flagged. The app never routes for the player; it only scores the plan the player builds.
 */

import { getFile, getLocation, loadLogic, locationIds, locationName, metadata, optionById, optionText, sideStoryForLocation } from '../data/load.js';
import { distance, isNodeUnlocked } from '../graph/graph.js';
import { type ChosenOption, type GateViolation, playableFilesAt, type PlayableFile, resolveFile } from '../graph/model.js';
import { applyFile, bearerIsInvestigator, computeDeception, computeTrust, initialState, keysHeldByInvestigator, travelTo } from '../graph/state.js';
import type { CampaignState, DecisionId, Effect, FileCode, KeyId, LocalizedString, LogicOption, MarkerSymbol, NodeId, OptionId } from '../types.js';
import { predictFinale, type FinalePrediction } from './trial.js';

// --- public types -----------------------------------------------------------

/** One player-authored action: travel to `location`, play `fileCode`, make `choices`. */
export interface PlanStep {
	location: NodeId;
	/** A file code (`5-A`) or side-story product id (`fortuneAndFolly`); `''` for travel-only. */
	fileCode: FileCode;
	/** Chosen option id per selectable decision; auto decisions are resolved from state. */
	choices?: Record<DecisionId, OptionId>;
	/** Reach `location` via a 0-time Expedited Ticket jump instead of normal travel. */
	useTicket?: boolean;
	/** Travel here and do nothing (no stop, no effects) — lets a plan burn time / trigger markers. */
	travelOnly?: boolean;
}

export interface Plan {
	steps: PlanStep[];
	/** Board outcomes the plan can't derive but the player asserts (e.g. `desiReal`). */
	assertions?: string[];
}

export type StepProblemKind = 'node_locked' | 'requires_unmet' | 'unreachable' | 'ticket_unavailable' | 'stop_locked' | 'no_file';

export interface StepProblem {
	kind: StepProblemKind;
	detail: LocalizedString;
}

/** A simulated step: the stop played + the state it leaves + its legality verdict. */
export interface SimStep {
	location: NodeId;
	fileCode: FileCode;
	kind: PlayableFile['kind'] | 'travel';
	/** Resolved decisions (player picks + auto branches), in file order. */
	chosen: ChosenOption[];
	travelCost: number;
	/** Set when this leg used an Expedited Ticket jump. */
	usedTicket?: { from: NodeId; to: NodeId; saved: number };
	/** Clock on arrival (before the file's own time) — drives time-scaled / version branches. */
	entryTime: number;
	timeAfter: number;
	stateAfter: CampaignState;
	/** Change in the Foundation-Trust / Cell-Deception tallies this step contributes. */
	trustDelta: number;
	deceptionDelta: number;
	/** Time-track markers fired (status reports) while travelling + playing this step. */
	firedReports: MarkerSymbol[];
	travelOnly: boolean;
	/** Empty => the step is legal at this point in the plan. */
	problems: StepProblem[];
	warnings: LocalizedString[];
	/** For a finale step: the prediction from the state BEFORE it (shown even when invalid). */
	finale?: FinalePrediction;
	/** `win`/`lose` if the chosen options decide the campaign (finale resolutions). */
	campaignResult?: 'win' | 'lose';
}

export interface PlanTrajectory {
	steps: SimStep[];
	finalState: CampaignState;
	/** Combat scenarios played (prologue + middles + the Congress finale). */
	scenarioCount: number;
	keysHeld: KeyId[];
	/** The plan crosses the ζ box still holding a Key — one held Key will be randomly stolen. */
	keyTheftRisk: boolean;
	/** After a theft, the plan plays a Ruses & Reclamation (14-C) take-back — a stolen Key may return. */
	keyRecoveryAvailable: boolean;
	/** The finale predicted from the FINAL state (for the summary, even with no finale step). */
	finale: FinalePrediction;
}

const ZETA_BOX = 20;

// --- helpers ----------------------------------------------------------------

const loc = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

/** location -> the file code whose `unlock` effect opens it (for the "locked — needs X" message). */
let _unlockers: Map<NodeId, string> | null = null;
function unlockHint(node: NodeId): string {
	if (!_unlockers) {
		_unlockers = new Map();
		for (const f of loadLogic().files) for (const d of f.decisions) for (const o of d.options) for (const e of o.effects) if (e.type === 'unlock') for (const lid of e.locationIds) if (!_unlockers.has(lid)) _unlockers.set(lid, e.fileCode ?? f.fileCode);
	}
	return _unlockers.get(node) ?? '';
}

/** A synthetic chosen option for a side-story product (time cost + optional Key grant). */
function sideStoryChosen(location: NodeId, productId: string): ChosenOption | undefined {
	const side = sideStoryForLocation(location);
	const product = side?.products.find((p) => p.id === productId);
	if (!side || !product) return undefined;
	const effects: Effect[] = [{ type: 'time', delta: product.timeCost }];
	if (side.grantsKeyId) effects.push({ type: 'key', keyId: side.grantsKeyId, bearer: side.bearer ?? 'investigator' });
	const option: LogicOption = { id: product.id, selectable: true, effects, conditionLogic: null };
	return { decisionId: `side:${product.id}`, decisionType: 'resolution', option, selectable: true };
}

/** A resolution gate violation → a problem describing the unmet precondition (requires / version). */
function gateProblem(fileCode: FileCode, g: GateViolation): StepProblem {
	if (g.reason === 'version') {
		const version = g.version ? (optionById(fileCode, g.version)?.dropdownText ?? g.version) : '';
		return { kind: 'requires_unmet', detail: loc('problem_version_locked', { resolution: optionText(fileCode, g.decisionId, g.option.id)?.dropdownText ?? g.option.id, version }) };
	}
	const enCond = optionText(fileCode, g.decisionId, g.option.id)?.condition;
	return { kind: 'requires_unmet', detail: loc('problem_requires_unmet', { requires: enCond ?? g.option.id }) };
}

function campaignResultOf(chosen: ChosenOption[]): 'win' | 'lose' | undefined {
	for (const c of chosen) for (const e of c.option.effects) if (e.type === 'campaign') return e.result;
	return undefined;
}

// --- the simulation ---------------------------------------------------------

export function simulatePlan(plan: Plan): PlanTrajectory {
	const meta = metadata();
	const omegaBox = meta.timeTrackBoxes; // ω (the final box) forces / warps to the finale.
	let state: CampaignState = { ...initialState(), boardStates: new Set(plan.assertions ?? []) };
	const steps: SimStep[] = [];
	let theftRisk = false;
	let recoveryAvailable = false;

	for (const ps of plan.steps) {
		const before = state;
		const location = ps.location;
		const travelOnly = ps.travelOnly === true || ps.fileCode === '';
		const pf: PlayableFile | undefined = travelOnly ? undefined : playableFilesAt(location).find((p) => p.fileCode === ps.fileCode);
		const problems: StepProblem[] = [];
		const warnings: LocalizedString[] = [];

		// Node lock (whether stopping or passing through). The start location is always enterable.
		if (!isNodeUnlocked(location, before.unlocked)) {
			problems.push({ kind: 'node_locked', detail: loc('problem_node_locked', { node: locationName(location), code: unlockHint(location) }) });
		}

		// Travel cost (shortest path on the unlocked subgraph). A ticket jump / ω-warp is 0-time.
		const reachDist = distance(before.unlocked, before.location, location);
		const omegaWarp = location === meta.finaleLocation && before.timePassed >= omegaBox;
		let travelCost: number;
		let usedTicket: SimStep['usedTicket'];
		if (omegaWarp) {
			travelCost = 0;
			warnings.push(loc('warning_omega_warp', {}));
		} else if (ps.useTicket) {
			travelCost = 0;
			usedTicket = { from: before.location, to: location, saved: Number.isFinite(reachDist) ? reachDist : 0 };
			if (!before.hasTicket) problems.push({ kind: 'ticket_unavailable', detail: loc('problem_ticket_unavailable', {}) });
		} else if (Number.isFinite(reachDist)) {
			travelCost = reachDist;
		} else {
			travelCost = 0; // provisional — keep downstream time finite
			problems.push({ kind: 'unreachable', detail: loc('problem_unreachable', { node: locationName(location) }) });
		}

		const entryTime = before.timePassed + travelCost;

		let chosen: ChosenOption[] = [];
		let after: CampaignState;
		let firedReports: MarkerSymbol[];
		let finale: FinalePrediction | undefined;
		let campaignResult: 'win' | 'lose' | undefined;
		const kind: SimStep['kind'] = travelOnly ? 'travel' : (pf?.kind ?? 'travel');

		if (travelOnly) {
			({ state: after, firedReports } = travelTo(before, location, travelCost, ps.useTicket === true));
		} else if (!pf) {
			// Unknown file at this location (stale share link / removed): relocate, apply nothing.
			problems.push({ kind: 'no_file', detail: loc('problem_no_file', { file: ps.fileCode, node: locationName(location) }) });
			({ state: after, firedReports } = travelTo(before, location, travelCost, ps.useTicket === true));
		} else {
			// Stop-lockout: a location may be stopped at once (the start hub is exempt — prologue + revisit).
			if (before.visitedStops.has(location) && location !== meta.startLocation) {
				problems.push({ kind: 'stop_locked', detail: loc('problem_stop_locked', { node: locationName(location) }) });
			}

			if (pf.isSideStory) {
				const sc = sideStoryChosen(location, ps.fileCode);
				chosen = sc ? [sc] : [];
			} else {
				const file = getFile(ps.fileCode)!;
				const resolution = resolveFile(file, ps.choices ?? {}, before, entryTime, location);
				chosen = resolution.chosen;
				for (const g of resolution.gates) problems.push(gateProblem(ps.fileCode, g));
				if (pf.kind === 'finale') {
					finale = predictFinale(before);
					if (finale.judgmentLog) {
						chosen = [
							{ decisionId: 'COTK.judgment', decisionType: 'vote_outcome', selectable: false, option: { id: finale.judgment, selectable: false, effects: [{ type: 'record', entryId: finale.judgmentLog }], conditionLogic: null } },
							...chosen,
						];
					}
				}
				campaignResult = campaignResultOf(chosen);
			}
			({ state: after, firedReports } = applyFile(before, location, ps.fileCode, chosen, travelCost, ps.useTicket === true));
		}

		// Key theft (crossing the ζ box holding a Key) + Ruses & Reclamation take-back, informational only.
		if (before.timePassed < ZETA_BOX && after.timePassed >= ZETA_BOX) {
			if ([...before.keys.values()].some(bearerIsInvestigator)) theftRisk = true;
		}
		if (theftRisk && ps.fileCode === '14-C') recoveryAvailable = true;

		steps.push({
			location,
			fileCode: ps.fileCode,
			kind,
			chosen,
			travelCost,
			usedTicket,
			entryTime,
			timeAfter: after.timePassed,
			stateAfter: after,
			trustDelta: computeTrust(after.recorded) - computeTrust(before.recorded),
			deceptionDelta: computeDeception(after.recorded) - computeDeception(before.recorded),
			firedReports,
			travelOnly,
			problems,
			warnings,
			finale,
			campaignResult,
		});
		state = after;
	}

	const scenarioCount = steps.filter((s) => !s.travelOnly && (s.kind === 'scenario' || s.kind === 'prologue' || s.kind === 'finale')).length;
	return {
		steps,
		finalState: state,
		scenarioCount,
		keysHeld: keysHeldByInvestigator(state),
		keyTheftRisk: theftRisk,
		keyRecoveryAvailable: recoveryAvailable,
		finale: predictFinale(state),
	};
}

// --- picker helpers (annotate, never hide — invalid steps are allowed) ------

export interface Destination {
	node: NodeId;
	name: string;
	/** Shortest-path hops from the current location; null if unreachable now. */
	travel: number | null;
	locked: boolean;
	markerType: ReturnType<typeof getLocation>['markerType'];
	/** Files (and side stories) playable here. */
	files: PlayableFile[];
}

/** Every location with a playable file, annotated with travel cost + lock state from `state`. */
export function reachableDestinations(state: CampaignState): Destination[] {
	const out: Destination[] = [];
	for (const id of locationIds()) {
		const files = playableFilesAt(id);
		if (files.length === 0) continue;
		const d = distance(state.unlocked, state.location, id);
		out.push({
			node: id,
			name: locationName(id),
			travel: Number.isFinite(d) ? d : null,
			locked: !isNodeUnlocked(id, state.unlocked),
			markerType: getLocation(id).markerType,
			files,
		});
	}
	out.sort((a, b) => (a.travel ?? Infinity) - (b.travel ?? Infinity) || (a.name < b.name ? -1 : 1));
	return out;
}

/** Test-only reset. */
export function _resetSimulateCaches(): void {
	_unlockers = null;
}
