/**
 * The campaign state machine (README §2.4).
 *
 * State transitions are pure: every helper returns a fresh `CampaignState`; the
 * input is never mutated. `applyStop` is the single transition used by the search —
 * it folds travel time, status-report / marker interrupts, and the chosen stop
 * option's effects into the next state, reporting which interrupts fired.
 */

import { alliesById, loadDatabase } from '../data/load.js';
import type { BearerId, CampaignState, FlagId, KeyId, MarkerSymbol, RawIntroChoice } from '../types.js';
import type { StopOption } from './model.js';

const CHAOS_CAP = 4;

/** Fresh campaign state at London, pre-prologue. */
export function initialState(): CampaignState {
	const meta = loadDatabase().campaign_metadata;
	return {
		node: meta.start_node,
		timePassed: 0,
		visitedStops: new Set(),
		flags: new Set(),
		keys: new Map(),
		allies: new Set(),
		assets: new Set(),
		// The TSK chaos bag starts with one Tablet and one Elder Thing; trust/defy choices shift them.
		tablet: 1,
		elderThing: 1,
		xpBonus: 0,
		trust: 0,
		deception: 0,
		hasTicket: false,
		markers: new Map(),
	};
}

// --- trust / deception ------------------------------------------------------

/** Base flag id with any parenthetical note stripped, e.g. "x (crossed off)" -> "x". */
function baseFlag(source: string): FlagId {
	return source.replace(/\([^)]*\)/g, '').trim();
}

let _trustSources: FlagId[] | null = null;
let _deceptionSources: FlagId[] | null = null;
function trustSources(): FlagId[] {
	if (!_trustSources) _trustSources = loadDatabase().trust_deception.foundation_trust_sources.map(baseFlag);
	return _trustSources;
}
function deceptionSources(): FlagId[] {
	if (!_deceptionSources)
		_deceptionSources = loadDatabase().trust_deception.cell_deception_sources.map(baseFlag);
	return _deceptionSources;
}

export function computeTrust(flags: ReadonlySet<FlagId>): number {
	return trustSources().filter((f) => flags.has(f)).length;
}
export function computeDeception(flags: ReadonlySet<FlagId>): number {
	return deceptionSources().filter((f) => flags.has(f)).length;
}

// --- time interrupts (status reports + written markers) ---------------------

interface Crossing {
	timePassed: number;
	flags: Set<FlagId>;
	elderThing: number;
	fired: MarkerSymbol[];
}

/**
 * Advance time from `state` by `delta`, firing every status report / written marker
 * whose box is crossed. box-symbol reports without a numeric box are never fired
 * (their position is not in the data); markers already written in `state` fire when
 * their box is crossed (e.g. psi -> code_50S_written unlocks Hong Kong).
 */
function crossTime(state: CampaignState, delta: number): Crossing {
	const db = loadDatabase();
	const t0 = state.timePassed;
	const t1 = t0 + delta;
	const flags = new Set(state.flags);
	let elderThing = state.elderThing;
	const fired: MarkerSymbol[] = [];

	const fire = (symbol: MarkerSymbol, sets: FlagId | undefined, effect: string) => {
		if (sets) flags.add(sets);
		// The guide's "(curse)" token is the Elder Thing token in TSK.
		if (/curse|elder/i.test(effect)) elderThing = Math.min(CHAOS_CAP, elderThing + 1);
		fired.push(symbol);
	};

	// box-symbol status reports with a defined box.
	const finalBox = db.campaign_metadata.global_time_track_boxes;
	for (const report of Object.values(db.status_reports)) {
		if (report.type !== 'box_symbol') continue;
		const box = report.at_box === 'final' ? finalBox : typeof report.at_box === 'number' ? report.at_box : undefined;
		if (box === undefined) continue;
		if (t0 < box && box <= t1) fire(report.symbol, report.sets, report.effect);
	}

	// previously-written markers crossed during this advance.
	for (const [sym, box] of state.markers) {
		const report = db.status_reports[sym];
		if (!report) continue;
		if (t0 < box && box <= t1) fire(report.symbol, report.sets, report.effect);
	}

	return { timePassed: t1, flags, elderThing, fired };
}

// --- the transition ---------------------------------------------------------

export interface StopResult {
	state: CampaignState;
	/** Interrupts that fired while traveling + playing this stop (in time order). */
	firedReports: MarkerSymbol[];
	/** Travel cost folded into this transition. */
	travelCost: number;
}

/**
 * Apply: travel `travelCost` hops to `option.node`, optionally make the selected pre-scenario
 * choices, stop, and resolve `option`. Pre-choices' time/logs/chaos/granted-asset apply BEFORE the
 * resolution (they routinely shift trust/deception and the chaos bag pre-play). When `useTicket` is
 * true, the travel is a 0-time Expedited Ticket jump (the ticket is consumed). Returns the next state
 * plus any interrupts fired. Pure.
 */
export function applyStop(
	state: CampaignState,
	option: StopOption,
	travelCost: number,
	useTicket = false,
	preChoices: RawIntroChoice[] = [],
): StopResult {
	// 1. Travel + pre-choice time + the stop's own time (interrupts may fire across the whole leg).
	const preTime = preChoices.reduce((t, c) => t + (c.time ?? 0), 0);
	const totalDelta = travelCost + preTime + option.baseTime;
	const crossing = crossTime(state, totalDelta);

	const flags = crossing.flags;
	const keys = new Map<KeyId, BearerId>(state.keys);
	const allies = new Set(state.allies);
	const assets = new Set(state.assets);
	const markers = new Map(state.markers);
	const visitedStops = new Set(state.visitedStops);
	let elderThing = crossing.elderThing;
	let tablet = state.tablet;
	// Adding a chaos token to an already-full bag (cap 4) grants +1 XP instead (campaign rule).
	let overflowXp = 0;

	// chaos: best-effort from a "-bless +curse" style string (bless≈Tablet, curse≈Elder Thing).
	const bumpChaos = (chaos: string | undefined): void => {
		if (!chaos) return;
		if (/\+\s*(bless|tablet)/i.test(chaos)) tablet >= CHAOS_CAP ? overflowXp++ : tablet++;
		if (/-\s*(bless|tablet)/i.test(chaos)) tablet = Math.max(0, tablet - 1);
		if (/\+\s*(curse|elder)/i.test(chaos)) elderThing >= CHAOS_CAP ? overflowXp++ : elderThing++;
		if (/-\s*(curse|elder)/i.test(chaos)) elderThing = Math.max(0, elderThing - 1);
	};
	const grant = (asset: string): void => {
		if (alliesById().has(asset)) allies.add(asset);
		else assets.add(asset);
	};

	// 2. Stop-lockout bookkeeping (London may be stopped twice — prologue + revisit).
	visitedStops.add(option.node);

	// 3. Pre-scenario choices (applied before the resolution).
	for (const c of preChoices) {
		for (const log of c.logs ?? []) flags.add(log);
		if (c.grants_asset) grant(c.grants_asset);
		bumpChaos(c.chaos);
	}

	// 4. Apply the option's structured effects.
	for (const log of option.logs) flags.add(log);
	if (option.unlocks) flags.add(option.unlocks);
	if (option.clearsLog) flags.delete(option.clearsLog);
	if (option.grantsAsset) assets.add(option.grantsAsset);
	for (const ally of option.grantsAllies) allies.add(ally);

	// keys: resolution key goes to its bearer; granted keys go to an investigator.
	if (option.key) keys.set(option.key, option.bearer ?? 'unknown');
	if (option.grantsKey) keys.set(option.grantsKey, 'investigator');

	// markers written by this option land `offset` boxes ahead of current time.
	if (option.writesMarker) {
		markers.set(option.writesMarker.symbol, crossing.timePassed + option.writesMarker.offset);
	}

	bumpChaos(option.chaos);

	const next: CampaignState = {
		node: option.node,
		timePassed: crossing.timePassed,
		visitedStops,
		flags,
		keys,
		allies,
		assets,
		tablet,
		elderThing,
		xpBonus: state.xpBonus + option.xpBonus + overflowXp,
		trust: computeTrust(flags),
		deception: computeDeception(flags),
		// Acquiring the ticket sets it; using it (this jump) consumes it.
		hasTicket: useTicket ? false : state.hasTicket || option.grantsAsset === 'expedited_ticket',
		markers,
	};

	return { state: next, firedReports: crossing.fired, travelCost };
}

/** Is this key bearer one the cell controls at the finale (investigator, or conditionally so)? */
export function bearerIsInvestigator(bearer: BearerId | undefined): boolean {
	return bearer === 'investigator' || bearer === 'conditional';
}

/** Keys currently held by an investigator (the cell) — for the finale tally. */
export function keysHeldByInvestigator(state: CampaignState): KeyId[] {
	const held: KeyId[] = [];
	for (const [key, bearer] of state.keys) {
		if (bearerIsInvestigator(bearer)) held.push(key);
	}
	return held.sort();
}

/**
 * A stable string fingerprint of the routing-relevant parts of a state (for visited-set dedup).
 * Includes written markers and assets so that two states differing only in a pending marker
 * (e.g. an unfired psi/delta) or a held asset (e.g. the whistle) are never merged — which would
 * make later `requires` checks order-dependent and pruning unsound.
 */
export function stateSignature(state: CampaignState): string {
	const stops = [...state.visitedStops].sort().join(',');
	const flags = [...state.flags].sort().join(',');
	const markers = [...state.markers.entries()].map(([k, v]) => `${k}:${v}`).sort().join(',');
	const assets = [...state.assets].sort().join(',');
	return `${state.node}|${state.timePassed}|${stops}|${flags}|${state.hasTicket ? 1 : 0}|${markers}|${assets}`;
}
