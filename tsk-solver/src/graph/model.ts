/**
 * File/decision/option model — the bridge between the raw `logic.json` files and the simulator.
 *
 * A "playable file" is something the cell can stop and resolve at a location: a scenario,
 * interlude, the prologue/finale, or a side story. Each file is a list of `decisions`; the
 * player actively picks `selectable` ones (dropdowns) while the game auto-resolves the rest via
 * `conditionLogic`. This module enumerates playable files, exposes their decisions, and resolves
 * a step's chosen options (player picks + auto branches) into a flat list the simulator applies.
 */

import { getFile, getLocation, locationIds, sideStoryForLocation } from '../data/load.js';
import type { CampaignState, Condition, DecisionId, DecisionType, FileCode, FileKind, KeyId, LogicDecision, LogicFile, LogicOption, LogId, NodeId, OptionId } from '../types.js';
import { evalCondition } from './conditions.js';

export interface PlayableFile {
	/** A real file code (`5-A`) or, for a side story, its product id (`fortuneAndFolly`). */
	fileCode: FileCode;
	location: NodeId;
	kind: FileKind | 'sideStory';
	isSideStory: boolean;
	keyAtStake?: KeyId;
}

/** The files (and side-story products) playable at a location. */
export function playableFilesAt(location: NodeId): PlayableFile[] {
	const out: PlayableFile[] = [];
	const loc = getLocation(location);
	for (const fc of loc.fileCodes) {
		const f = getFile(fc);
		if (!f) continue;
		out.push({ fileCode: fc, location, kind: f.kind, isSideStory: false, keyAtStake: f.keyAtStakeId });
	}
	const side = sideStoryForLocation(location);
	if (side) {
		for (const p of side.products) {
			out.push({ fileCode: p.id, location, kind: 'sideStory', isSideStory: true, keyAtStake: side.grantsKeyId });
		}
	}
	return out;
}

/** Every playable file across all locations (for the destination/step picker). */
export function allPlayableFiles(): PlayableFile[] {
	return locationIds().flatMap(playableFilesAt);
}

// --- decisions --------------------------------------------------------------

/** Decisions the simulator folds for a file (everything except finale member-vote/judgment tables). */
export function applicableDecisions(file: LogicFile): LogicDecision[] {
	return file.decisions.filter((d) => d.decisionType !== 'vote_outcome');
}

/**
 * For an interlude played at one of several locations (e.g. Quid Pro Quo at San Francisco OR Moscow),
 * each location has its own decision whose id names that location. Such a decision applies only when
 * played there; location-agnostic decisions always apply. Files with a single location never filter.
 */
function decisionLocation(file: LogicFile, decisionId: DecisionId): NodeId | undefined {
	if (file.locationIds.length <= 1) return undefined;
	const id = decisionId.toLowerCase();
	for (const lid of file.locationIds) if (id.includes(lid.toLowerCase())) return lid;
	return undefined;
}
export function decisionAppliesAt(file: LogicFile, decisionId: DecisionId, location: NodeId | undefined): boolean {
	if (!location) return true;
	const dl = decisionLocation(file, decisionId);
	return dl === undefined || dl === location;
}

/** The selectable decisions a player picks at this file/location (the dropdowns the form renders). */
export function selectableDecisions(fileCode: FileCode, location?: NodeId): LogicDecision[] {
	const f = getFile(fileCode);
	if (!f) return [];
	return f.decisions.filter((d) => d.selectable && decisionAppliesAt(f, d.decisionId, location));
}

/** True when a file has no player choices — the game resolves it entirely (e.g. The Safehouse). */
export function isAutoFile(fileCode: FileCode): boolean {
	const f = getFile(fileCode);
	if (!f) return false;
	const applicable = applicableDecisions(f);
	return applicable.length > 0 && applicable.every((d) => !d.selectable);
}

/** Selectable options offered for a decision's dropdown. */
export function optionsForDecision(fileCode: FileCode, decisionId: DecisionId): LogicOption[] {
	const f = getFile(fileCode);
	const d = f?.decisions.find((x) => x.decisionId === decisionId);
	return d ? d.options.filter((o) => o.selectable) : [];
}

/** The default (preselected) option id for a selectable decision — the first selectable option. */
export function defaultOptionId(fileCode: FileCode, decisionId: DecisionId): OptionId | undefined {
	return optionsForDecision(fileCode, decisionId)[0]?.id;
}

// --- choice resolution ------------------------------------------------------

export interface ChosenOption {
	decisionId: DecisionId;
	decisionType: DecisionType;
	option: LogicOption;
	/** true => the player picked it; false => the game auto-resolved it from state. */
	selectable: boolean;
}

/** An unmet derivable prerequisite on a chosen resolution option (a flaggable problem). */
export interface GateViolation {
	decisionId: DecisionId;
	option: LogicOption;
	/** `requires` — the plannable precondition was unmet; `version` — not reachable in the version played. */
	reason: 'requires' | 'version';
	requires?: Condition | null;
	version?: OptionId;
}

export interface FileResolution {
	chosen: ChosenOption[];
	gates: GateViolation[];
}

/** Auto-resolve a non-selectable decision: first option whose condition holds, else the default. */
function autoResolve(d: LogicDecision, state: CampaignState): LogicOption | undefined {
	return (
		d.options.find((o) => o.conditionLogic && o.conditionLogic.default !== true && evalCondition(o.conditionLogic, state)) ??
		d.options.find((o) => o.conditionLogic?.default === true) ??
		d.options.find((o) => !o.conditionLogic) ??
		d.options[0]
	);
}

/** Thread an option's recorded logs + tally + its own id (for `choseOption`) into a state clone. */
function thread(state: CampaignState, option: LogicOption): CampaignState {
	const recorded = new Set(state.recorded);
	const tallies = new Map(state.tallies);
	const chosenOptions = new Set(state.chosenOptions);
	chosenOptions.add(option.id);
	for (const e of option.effects) {
		if (e.type === 'record') recorded.add(e.entryId);
		else if (e.type === 'crossOff') recorded.delete(e.entryId);
		else if (e.type === 'tally') tallies.set(e.entryId, (tallies.get(e.entryId) ?? 0) + e.delta);
	}
	return { ...state, recorded, tallies, chosenOptions };
}

/** Pick the player's option for a selectable decision (their choice, else the first selectable). */
function pickSelectable(d: LogicDecision, choices: Record<DecisionId, OptionId>): LogicOption | undefined {
	const picked = choices[d.decisionId];
	return (picked ? d.options.find((o) => o.id === picked) : undefined) ?? d.options.find((o) => o.selectable) ?? d.options[0];
}

/** Is `option` reachable in `version`? (Only meaningful when its decision `gatesResolutions`.) */
function reachableInVersion(option: LogicOption, gates: boolean, version: OptionId | undefined): boolean {
	if (!gates || !option.reachableInVersions?.length) return true;
	return version !== undefined && option.reachableInVersions.includes(version);
}

/**
 * Resolve every applicable decision of `file` into a chosen option, in file order, threading each
 * decision's recorded logs + chosen option ids forward (so later auto-branches and resolution gates
 * see them). A `resolution` is gated on its explicit `requires` (the plannable precondition) and,
 * for a version-gating scenario, on `reachableInVersions`; either failure is a `GateViolation`.
 * `entryTime` is the clock on arrival. Excludes finale vote tables.
 */
export function resolveFile(file: LogicFile, choices: Record<DecisionId, OptionId>, state: CampaignState, entryTime: number, location?: NodeId): FileResolution {
	const chosen: ChosenOption[] = [];
	const gates: GateViolation[] = [];
	let running: CampaignState = { ...state, timePassed: entryTime };
	let version: OptionId | undefined;
	let gatesResolutions = false;

	for (const d of applicableDecisions(file)) {
		if (!decisionAppliesAt(file, d.decisionId, location)) continue;
		const option = d.selectable ? pickSelectable(d, choices) : autoResolve(d, running);
		if (!option) continue;
		if (d.decisionType === 'scenario_version') {
			version = option.id;
			gatesResolutions = d.gatesResolutions === true;
		}
		if (d.decisionType === 'resolution' && d.selectable) {
			if (option.requires && !evalCondition(option.requires, running)) gates.push({ decisionId: d.decisionId, option, reason: 'requires', requires: option.requires });
			if (!reachableInVersion(option, gatesResolutions, version)) gates.push({ decisionId: d.decisionId, option, reason: 'version', version });
		}
		chosen.push({ decisionId: d.decisionId, decisionType: d.decisionType, option, selectable: d.selectable });
		running = thread(running, option);
	}
	return { chosen, gates };
}

/** A resolution option annotated with whether the plan can currently offer it (for the picker). */
export interface ResolutionOffer {
	option: LogicOption;
	/** `requires` satisfiable + reachable in the played version. */
	offerable: boolean;
}

/**
 * The selectable resolution options of `fileCode` at `location`, each annotated with `offerable`
 * (its `requires` holds against the planned upstream choices/time, and it's reachable in the version
 * the plan lands in). The UI hides non-offerable ones and labels the rest by `playOutcome`.
 */
export function resolutionOffers(fileCode: FileCode, choices: Record<DecisionId, OptionId>, state: CampaignState, entryTime: number, location?: NodeId): ResolutionOffer[] {
	const file = getFile(fileCode);
	if (!file) return [];
	let running: CampaignState = { ...state, timePassed: entryTime };
	let version: OptionId | undefined;
	let gatesResolutions = false;
	let resolution: LogicDecision | undefined;
	for (const d of applicableDecisions(file)) {
		if (!decisionAppliesAt(file, d.decisionId, location)) continue;
		if (d.decisionType === 'resolution') {
			resolution = d;
			continue; // evaluate against the state built from the upstream decisions
		}
		const option = d.selectable ? pickSelectable(d, choices) : autoResolve(d, running);
		if (!option) continue;
		if (d.decisionType === 'scenario_version') {
			version = option.id;
			gatesResolutions = d.gatesResolutions === true;
		}
		running = thread(running, option);
	}
	if (!resolution) return [];
	return resolution.options
		.filter((o) => o.selectable)
		.map((o) => ({ option: o, offerable: evalCondition(o.requires ?? null, running) && reachableInVersion(o, gatesResolutions, version) }));
}
