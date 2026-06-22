/**
 * The campaign state machine (pure).
 *
 * Every transition returns a fresh `CampaignState`; the input is never mutated. `applyFile`
 * is the single "stop" transition: it folds travel + the file's chosen options' time into one
 * clock advance (firing every time-track marker crossed, applying its status report), then
 * applies the chosen options' structured effects. `travelTo` moves without stopping.
 */

import { getMarker, loadLogic, metadata, statusReportOption } from '../data/load.js';
import type { BearerId, CampaignState, FileCode, KeyId, LogId, MarkerSymbol, NodeId } from '../types.js';
import { applyEffect, type Draft, sumTime } from './effects.js';
import type { ChosenOption } from './model.js';

/** Fresh campaign state at the start location (London), pre-prologue. */
export function initialState(): CampaignState {
	return {
		location: metadata().startLocation,
		timePassed: 0,
		visitedStops: new Set(),
		visitedFiles: new Set(),
		recorded: new Set(),
		tallies: new Map(),
		keys: new Map(),
		assets: new Set(),
		// The TSK chaos bag starts with one Tablet and one Elder Thing; trust/deception shift them.
		tablet: 1,
		elderThing: 1,
		cultist: 0,
		xpBonus: 0,
		hasTicket: false,
		unlocked: new Set(),
		markers: new Map(),
		boardStates: new Set(),
		chosenOptions: new Set(),
	};
}

// --- trust / deception (epilogue tallies) -----------------------------------

/** Foundation-Trust tally = recorded `epilogueTally.foundationTrust` entries. */
export function computeTrust(recorded: ReadonlySet<LogId>): number {
	return loadLogic().epilogueTally.foundationTrust.filter((l) => recorded.has(l)).length;
}
/** Cell-Deception tally = recorded `epilogueTally.cellDeception` entries. */
export function computeDeception(recorded: ReadonlySet<LogId>): number {
	return loadLogic().epilogueTally.cellDeception.filter((l) => recorded.has(l)).length;
}

// --- time-track crossing ----------------------------------------------------

function toDraft(s: CampaignState): Draft {
	return {
		recorded: new Set(s.recorded),
		tallies: new Map(s.tallies),
		keys: new Map(s.keys),
		assets: new Set(s.assets),
		tablet: s.tablet,
		elderThing: s.elderThing,
		cultist: s.cultist,
		xpBonus: s.xpBonus,
		hasTicket: s.hasTicket,
		unlocked: new Set(s.unlocked),
		markers: new Map(s.markers),
	};
}

/**
 * Advance the clock from `t0` to `t1`, firing every printed or written marker whose box lies
 * in `(t0, t1]` (in box order) and applying its status report's effects to `draft` (unlock
 * nodes, add a cultist token, etc.). Returns the symbols fired.
 */
function crossTime(draft: Draft, t0: number, t1: number): MarkerSymbol[] {
	const crossed: { symbol: MarkerSymbol; box: number }[] = [];
	for (const m of loadLogic().timeMarkers) {
		const box = m.box ?? draft.markers.get(m.symbol);
		if (box === undefined) continue;
		if (t0 < box && box <= t1) crossed.push({ symbol: m.symbol, box });
	}
	crossed.sort((a, b) => a.box - b.box);
	for (const { symbol } of crossed) {
		const marker = getMarker(symbol);
		if (marker?.reportOptionId) {
			const opt = statusReportOption(marker.reportOptionId);
			if (opt) for (const e of opt.effects) applyEffect(draft, e, t1);
		}
	}
	return crossed.map((c) => c.symbol);
}

function freeze(draft: Draft, base: CampaignState, location: NodeId, t1: number, visitedStops: ReadonlySet<NodeId>, visitedFiles: ReadonlySet<FileCode>, chosenOptions: ReadonlySet<string>): CampaignState {
	return {
		location,
		timePassed: t1,
		visitedStops,
		visitedFiles,
		recorded: draft.recorded,
		tallies: draft.tallies,
		keys: draft.keys,
		assets: draft.assets,
		tablet: draft.tablet,
		elderThing: draft.elderThing,
		cultist: draft.cultist,
		xpBonus: draft.xpBonus,
		hasTicket: draft.hasTicket,
		unlocked: draft.unlocked,
		markers: draft.markers,
		boardStates: base.boardStates,
		chosenOptions,
	};
}

// --- the transitions --------------------------------------------------------

export interface StopResult {
	state: CampaignState;
	/** Markers fired (in time order) while travelling + playing this stop. */
	firedReports: MarkerSymbol[];
}

/**
 * Travel `travelCost` hops to `location`, then stop and resolve `chosen` (the player's picks +
 * auto branches, in file order). Pre-step time = travel + every chosen option's `time` effect;
 * the clock advances once (firing markers), then the options' non-time effects apply. When
 * `useTicket` is true the travel is a 0-time Expedited Ticket jump (the ticket is consumed). Pure.
 */
export function applyFile(state: CampaignState, location: NodeId, fileCode: FileCode, chosen: ChosenOption[], travelCost: number, useTicket = false): StopResult {
	const draft = toDraft(state);
	if (useTicket) draft.hasTicket = false;

	const optionTime = chosen.reduce((t, c) => t + sumTime(c.option.effects), 0);
	const t0 = state.timePassed;
	const t1 = t0 + travelCost + optionTime;
	const fired = crossTime(draft, t0, t1);
	for (const c of chosen) for (const e of c.option.effects) applyEffect(draft, e, t1);

	const visitedStops = new Set(state.visitedStops);
	visitedStops.add(location);
	const visitedFiles = new Set(state.visitedFiles);
	visitedFiles.add(fileCode);
	const chosenOptions = new Set(state.chosenOptions);
	for (const c of chosen) chosenOptions.add(c.option.id);
	return { state: freeze(draft, state, location, t1, visitedStops, visitedFiles, chosenOptions), firedReports: fired };
}

/**
 * Travel to `location` WITHOUT stopping — the rules let the cell move and decline to act.
 * Advances the clock (firing any markers crossed), relocates, consumes a ticket if `useTicket`.
 * No stop is recorded and no option effects apply. Lets a plan loop to burn time. Pure.
 */
export function travelTo(state: CampaignState, location: NodeId, travelCost: number, useTicket = false): StopResult {
	const draft = toDraft(state);
	if (useTicket) draft.hasTicket = false;
	const t1 = state.timePassed + travelCost;
	const fired = crossTime(draft, state.timePassed, t1);
	return { state: freeze(draft, state, location, t1, state.visitedStops, state.visitedFiles, state.chosenOptions), firedReports: fired };
}

// --- key helpers ------------------------------------------------------------

/** Is this bearer one the cell controls at the finale? */
export function bearerIsInvestigator(bearer: BearerId | undefined): boolean {
	return bearer === 'investigator';
}

/** Keys currently held by an investigator (the cell) — for the finale tally. */
export function keysHeldByInvestigator(state: CampaignState): KeyId[] {
	const held: KeyId[] = [];
	for (const [key, bearer] of state.keys) if (bearerIsInvestigator(bearer)) held.push(key);
	return held.sort();
}
