/**
 * DB → solver normalization layer.
 *
 * Turns raw scenarios / interludes into uniform `StopOption`s, builds the
 * flag/asset producer index that drives unlock-prerequisite expansion, and
 * evaluates the database's `requires` strings against a `CampaignState`.
 *
 * Modeling decisions (documented in README §"Modeling assumptions"):
 *  - `requires` tokens that the solver cannot route for (play-time / decision
 *    conditions such as "told_truth_to_taylor", "call_amaranth_true_name",
 *    "3+ of [...]") are treated as satisfiable by player choice. Only tokens the
 *    solver actually tracks (unlock codes, the curated routing flags/assets,
 *    markers, time conditions, versions) can block an option.
 *  - Symbols printed on the time track without an explicit box in the JSON
 *    (alpha/gamma/zeta/epsilon) are not auto-fired; we do not invent their box.
 */

import { alliesById, getInterlude, getLocation, getScenario, loadDatabase, sideStoryForNode } from '../data/load.js';
import type {
	AllyId,
	CampaignState,
	FlagId,
	KeyId,
	MarkerSymbol,
	NodeId,
	RawInterludeOutcome,
	RawIntroChoice,
	RawResolution,
	RawScenario,
} from '../types.js';

export interface StopOption {
	/** Node this option plays at. */
	node: NodeId;
	/** Resolution / outcome id, e.g. `R1`, `M2`, `DG6`, `first_meet`. */
	optionId: string;
	/** Short human description (resolution desc/note, or interlude outcome note), if the data has one. */
	desc?: string;
	kind: 'scenario' | 'interlude' | 'finale';
	/** Time marked when playing this option (excludes travel). */
	baseTime: number;
	/** Key in play and who bears it (investigator => held by the cell). */
	key: KeyId | null;
	bearer: string | null;
	/** Key explicitly granted (interlude outcomes); always to an investigator. */
	grantsKey?: KeyId;
	logs: FlagId[];
	grantsAsset?: string;
	grantsAllies: AllyId[];
	unlocks?: FlagId;
	clearsLog?: FlagId;
	writesMarker?: { symbol: MarkerSymbol; offset: number };
	xpBonus: number;
	/** Chaos-bag tokens upgraded by this option (a freebie, e.g. Special Delivery). */
	improvesChaos?: number;
	noResolution: boolean;
	outcome?: 'WIN_CAMPAIGN' | 'LOSE_CAMPAIGN';
	requires?: string;
	/** Version gate (e.g. `v2`) implied by `requires: version_v2`. */
	version?: string;
	achievement?: string;
	/** Chaos token text, e.g. "-bless +curse" (bless≈Tablet, curse≈Elder Thing). */
	chaos?: string;
	/** True for the start node's revisit interlude (e.g. London / Dead and Gone). */
	isRevisit?: boolean;
	/** True for the prologue scenario. */
	isPrologue?: boolean;
}

// --- xp parsing -------------------------------------------------------------

/** Extract numeric bonus XP from an `xp` field like `victory_x+3`. Unknown => 0. */
export function parseXpBonus(xp: string | number | null | undefined): number {
	if (xp === null || xp === undefined) return 0;
	if (typeof xp === 'number') return xp;
	const m = /victory_x\+(\d+)/.exec(xp);
	return m ? Number(m[1]) : 0;
}

// --- flag / asset normalization --------------------------------------------

/**
 * Shorthand `requires` tokens that map to a tracked campaign-log flag. The data frequently abbreviates
 * a recorded log (e.g. `deceiving_ece`) — these map each shorthand to the full flag id so the gate is
 * actually enforced rather than silently treated as a free play-time decision.
 */
const SHORTHAND_FLAG: Record<string, FlagId> = {
	met_irawan: 'the_cell_met_dr_irawan',
	off_mission: 'the_cell_is_off_mission',
	// The Safehouse (Ybor City) blade is gated by Dancing Mad R1's passphrase.
	know_passphrase: 'you_know_the_passphrase',
	// Cross-step prerequisites recorded under a fuller flag name (audited against the guide).
	masai_fled_to_bermuda: 'tuwile_masai_fled_to_bermuda',
	appreciated_the_architecture: 'the_cell_appreciated_the_architecture',
	hid_truth: 'the_cell_hid_the_truth_from_taylor',
	told_truth_to_taylor: 'the_cell_told_the_truth_to_taylor',
	flint_solo: 'flint_is_working_solo',
	// Coterie "on your side" tallies used by Infernal Machinery's count gate.
	la_chica_roja_on_side: 'la_chica_roja_is_on_your_side',
	aided_knight: 'the_cell_aided_the_knight',
	aliki_on_side: 'aliki_is_on_your_side',
	desi_on_side: 'desi_is_in_your_debt',
	ece_trusts: 'ece_trusts_the_cell',
	deal_with_thorne: 'the_cell_made_a_deal_with_thorne',
};

/** Shorthand tokens satisfied when a flag is ABSENT (e.g. "quinn_trusts" = NOT "does not trust"). */
const NEGATED_SHORTHAND: Record<string, FlagId> = {
	quinn_trusts: 'agent_quinn_does_not_trust_the_cell',
};

/** Shorthand `requires` tokens that map to a tracked asset. */
const SHORTHAND_ASSET: Record<string, string> = {
	cell_possesses_whistle: 'mysterious_whistle',
};

/** Routing flags the solver tracks and therefore enforces when required. */
const TRACKED_FLAGS = new Set<FlagId>([
	'the_cell_is_off_mission',
	'the_cell_met_dr_irawan',
	// Special Delivery: you can only "deliver" intel after "receive"-ing it (enforces stop order).
	'the_cell_is_delivering_intel',
	// Dancing Mad R1 gives the passphrase → gates The Safehouse (Ybor City) Mirroring Blade.
	'you_know_the_passphrase',
	// Cross-step prerequisites recorded under their exact flag name (audited against the guide):
	'agent_flint_is_missing', // Blood, Sweat & Tea → gates Shades of Suffering intro
	'flint_traveled_to_kuala_lumpur', // Blood, Sweat & Tea → gates Shades of Suffering intro
	'the_cell_knows_amaranths_real_name', // Quid Pro Quo (San Francisco intel) → gates Dead Heat R3
]);

const isUnlockCode = (t: string): boolean => /^code_.*_written$/.test(t);

function isAlly(id: string): boolean {
	return alliesById().has(id);
}

// --- stop-option derivation -------------------------------------------------

function scenarioResolutionOption(node: NodeId, scenario: RawScenario, scenarioId: string, res: RawResolution, prologueIntroTime: number): StopOption {
	const versionMatch = res.requires ? /version_(v\d+)/.exec(res.requires) : null;
	const version = versionMatch ? versionMatch[1] : undefined;
	const isFinale = scenario.role === 'finale';

	// Fold version data: flags the version sets + its time-window gate.
	const versionData = version && scenario.versions ? scenario.versions[version] : undefined;
	const logs = [...(res.logs ?? []), ...(versionData?.sets ?? [])];
	let requires = res.requires;
	if (versionData?.min_time !== undefined) requires = appendClause(requires, `time>=${versionData.min_time}`);
	if (versionData?.max_time !== undefined) requires = appendClause(requires, `time<=${versionData.max_time}`);

	return {
		node,
		optionId: res.id,
		desc: res.desc ?? res.note ?? undefined,
		kind: isFinale ? 'finale' : 'scenario',
		baseTime: res.time + prologueIntroTime,
		key: res.key ?? null,
		bearer: res.bearer ?? null,
		logs,
		grantsAllies: [],
		writesMarker: res.writes_marker,
		xpBonus: parseXpBonus(res.xp),
		noResolution: res.no_resolution === true,
		outcome: res.outcome,
		requires,
		version,
		achievement: res.achievement,
		chaos: res.chaos,
	};
}

function appendClause(requires: string | undefined, clause: string): string {
	return requires ? `${requires} + ${clause}` : clause;
}

function interludeOption(node: NodeId, outcome: RawInterludeOutcome): StopOption {
	const grantsAllies: AllyId[] = [];
	if (outcome.grants_asset && isAlly(outcome.grants_asset)) grantsAllies.push(outcome.grants_asset);
	return {
		node,
		optionId: outcome.id,
		desc: outcome.note ?? undefined,
		kind: 'interlude',
		baseTime: outcome.time ?? 0,
		key: null,
		bearer: outcome.bearer ?? null,
		grantsKey: outcome.grants_key,
		logs: outcome.logs ?? [],
		// An ally granted here goes into grantsAllies only — never also into assets (applyStop adds both
		// sets blindly), keeping the allies/assets collections disjoint as the pre-choice path does.
		grantsAsset: outcome.grants_asset && isAlly(outcome.grants_asset) ? undefined : outcome.grants_asset,
		grantsAllies,
		unlocks: outcome.unlocks,
		clearsLog: outcome.clears_log,
		writesMarker: outcome.writes_marker,
		xpBonus: outcome.xp ?? 0,
		improvesChaos: outcome.improves_chaos,
		noResolution: false,
		requires: outcome.requires,
		chaos: outcome.chaos,
	};
}

const optionCache = new Map<NodeId, StopOption[]>();

/**
 * All ways to "play" (stop at) a node. Returns `[]` for pure connectors and for
 * side-story nodes (whose play-time cost is not encoded in the data — README).
 */
export function stopOptions(node: NodeId): StopOption[] {
	const cached = optionCache.get(node);
	if (cached) return cached;

	const loc = getLocation(node);
	let options: StopOption[] = [];
	const sid = loc.scenario_id;
	if (sid) {
		const scenario = getScenario(sid);
		const interlude = getInterlude(sid);
		if (scenario) {
			const isPrologue = scenario.role === 'prologue';
			// Pre-scenario choices (intro/interlude) are selected explicitly per plan step and folded
			// in by applyStop, so a resolution option carries only its own time/chaos here.
			options = scenario.resolutions.map((r) => ({
				...scenarioResolutionOption(node, scenario, sid, r, 0),
				isPrologue,
			}));
		} else if (interlude) {
			options = (interlude.outcomes ?? interlude.options ?? []).map((o) => interludeOption(node, o));
		}
	}

	// Green (side-story) nodes: one playable option per standalone product. Playing one costs time
	// = its entry XP cost (pass-through is free, modeled by simply not stopping). Fortune and Folly
	// awards The Wellspring of Fortune. These options exist so the solver CAN route here when asked,
	// but side-story nodes are excluded from the enrichment pool, so a plan never inserts one unbidden.
	if (loc.node_kind === 'side_story') {
		const side = sideStoryForNode(node);
		if (side) {
			for (const product of side.products) {
				options.push({
					node,
					optionId: product.id,
					kind: 'interlude',
					baseTime: product.xp_cost,
					key: null,
					bearer: side.bearer ?? null,
					grantsKey: side.grants_key,
					logs: [],
					grantsAllies: [],
					xpBonus: 0,
					noResolution: false,
				});
			}
		}
	}

	// Start-node revisit interlude (London / Dead and Gone): a permitted second stop,
	// gated by the revisit unlock flag (code_27H_written).
	if (loc.revisit) {
		const revisit = getInterlude(loc.revisit);
		if (revisit) {
			for (const o of revisit.outcomes ?? []) {
				const opt = interludeOption(node, o);
				opt.isRevisit = true;
				opt.requires = loc.revisit_unlock
					? opt.requires
						? `${opt.requires} + ${loc.revisit_unlock}`
						: loc.revisit_unlock
					: opt.requires;
				options.push(opt);
			}
		}
	}
	optionCache.set(node, options);
	return options;
}

/**
 * Is this node a combat scenario stop (the canonical ten, incl. the prologue + finale)? True iff its
 * scenario id resolves to a real scenario; interludes/side-stories return false. Drives scenario count.
 */
export function isCombatScenarioNode(node: NodeId): boolean {
	const sid = getLocation(node).scenario_id;
	return sid !== null && getScenario(sid) !== undefined;
}

/**
 * Pre-scenario choices made at a scenario node BEFORE its resolution — the scenario's `intro_choices`
 * (e.g. trust/defy a contact) plus its `interlude_choices`. These commonly alter trust/deception and
 * the chaos bag; `applyStop` folds the selected ones in. Empty for interlude / side-story nodes (whose
 * single chosen outcome already carries those effects).
 */
export function preChoicesAt(node: NodeId): RawIntroChoice[] {
	const sid = getLocation(node).scenario_id;
	const s = sid ? getScenario(sid) : undefined;
	if (!s) return [];
	return [...(s.intro_choices ?? []), ...(s.interlude_choices ?? [])];
}

/**
 * Interludes the GAME resolves automatically by checking the log/clock ("Check log: if X → 2; else → 3"),
 * rather than the player choosing an outcome (audited against the guide). The simulator picks the outcome
 * whose `requires` the current state satisfies. (The Coiled Serpent is intentionally excluded: its CS5/CS6
 * outcomes share identical requires in the data and can't be auto-disambiguated, so it stays a choice.)
 */
const AUTO_EVALUATED_INTERLUDES = new Set<string>([
	'the_safehouse',
	'strange_architecture',
	'ringing_hollow',
	'theory_of_annihilation',
	'paranatural_selection',
	'metamorphosis',
	'romulus_and_remus',
	'blood_sweat_and_tea',
	'special_delivery',
	'the_great_work',
	'infernal_machinery',
	'dead_and_gone',
]);

/** Is this node an auto-evaluated "check log → outcome" interlude (resolved by the game, not the player)? */
export function isAutoInterlude(node: NodeId): boolean {
	const sid = getLocation(node).scenario_id;
	return sid !== null && AUTO_EVALUATED_INTERLUDES.has(sid);
}

// --- requires evaluation ----------------------------------------------------

export interface RequiresContext {
	/** When evaluating an option, the node we are about to (re)enter. */
	node?: NodeId;
}

function clauseTokens(raw: string): string[] {
	// Strip parenthetical asides, then split conjuncts on '+'.
	return raw
		.replace(/\([^)]*\)/g, ' ')
		.split('+')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function evalNumeric(timePassed: number, op: string, n: number): boolean {
	switch (op) {
		case '<':
			return timePassed < n;
		case '<=':
			return timePassed <= n;
		case '>':
			return timePassed > n;
		case '>=':
			return timePassed >= n;
		default:
			return true;
	}
}

/** Evaluate one conjunct clause. Unknown/free-decision clauses return true. */
function evalClause(clause: string, state: CampaignState): boolean {
	const c = clause.toLowerCase();

	// time<N / time<=N / time>=N / time>N
	const timeMatch = /^time\s*(<=|>=|<|>)\s*(\d+)$/.exec(c);
	if (timeMatch) return evalNumeric(state.timePassed, timeMatch[1]!, Number(timeMatch[2]));

	// entered_at_time_25_plus  (and similar "_NN_plus")
	const enteredPlus = /entered_at_time_(\d+)_plus/.exec(c);
	if (enteredPlus) return state.timePassed >= Number(enteredPlus[1]);

	// "<=N time since MARKER" / ">=N time since MARKER"
	const sinceMatch = /(<=|>=|<|>)\s*(\d+)\s*time\s*since\s*(\w+)/.exec(c);
	if (sinceMatch) {
		const marker = sinceMatch[3]!.replace(/marker.*$/, '').trim();
		const box = state.markers.get(marker);
		if (box === undefined) return false; // marker not written yet
		const delta = state.timePassed - box;
		return evalNumeric(delta, sinceMatch[1]!, Number(sinceMatch[2]));
	}

	// at_or_after_MARKER / before_MARKER — the clock has (not) reached a written marker's box. The
	// marker must have been written first (e.g. Dancing Mad R1 writes theta), so an absent marker fails.
	const markerGate = /^(at_or_after|before)_(\w+)$/.exec(c);
	if (markerGate) {
		const box = state.markers.get(markerGate[2]!);
		if (box === undefined) return false;
		return markerGate[1] === 'before' ? state.timePassed < box : state.timePassed >= box;
	}

	// "at_least_N_of_[a,b,c]" / "at_most_N_of_[...]" / "exactly_N_of_[...]" — count set flags in the list
	// (the list elements are full flag ids). Used by the Coterie-coalition gates (Infernal Machinery,
	// The Great Work). Commas separate items, so this survives the '+'-conjunct split intact.
	const countMatch = /^(at_least|at_most|exactly)_(\d+)_of_\[(.+)\]$/.exec(c);
	if (countMatch) {
		const want = Number(countMatch[2]);
		const items = countMatch[3]!.split(',').map((s) => s.trim()).filter(Boolean);
		const have = items.filter((f) => state.flags.has(f)).length;
		return countMatch[1] === 'at_most' ? have <= want : countMatch[1] === 'exactly' ? have === want : have >= want;
	}

	// version gate handled at option level
	if (/^version_v\d+$/.test(c)) return true;

	// flag / asset presence
	const token = clause.trim();
	if (isUnlockCode(token)) return state.flags.has(token);
	if (SHORTHAND_FLAG[token]) return state.flags.has(SHORTHAND_FLAG[token]!);
	if (NEGATED_SHORTHAND[token]) return !state.flags.has(NEGATED_SHORTHAND[token]!);
	if (SHORTHAND_ASSET[token]) return state.assets.has(SHORTHAND_ASSET[token]!);
	if (TRACKED_FLAGS.has(token)) return state.flags.has(token);

	// Unknown token: a play-time / decision condition the solver does not route for.
	return true;
}

/** Does `state` satisfy a raw `requires` string? Empty/undefined => true. */
export function requiresSatisfied(raw: string | undefined, state: CampaignState): boolean {
	if (!raw) return true;
	return clauseTokens(raw).every((clause) => evalClause(clause, state));
}

// --- flag / asset producer index (unlock-prerequisite expansion) ------------

export interface FlagProducer {
	flag: string; // flag or asset id produced
	node: NodeId;
	optionId: string;
	/** Tracked prerequisite flags/assets that must hold before this producer is usable. */
	prereqFlags: string[];
	/** This producer's node is itself locked behind this flag (transitive). */
	nodeLock?: FlagId;
	baseTime: number;
}

/** Parse the *trackable* prerequisite tokens out of a `requires` string. */
function trackablePrereqs(raw: string | undefined): string[] {
	if (!raw) return [];
	const out: string[] = [];
	for (const clause of clauseTokens(raw)) {
		const token = clause.trim();
		if (isUnlockCode(token)) out.push(token);
		else if (SHORTHAND_FLAG[token]) out.push(SHORTHAND_FLAG[token]!);
		else if (SHORTHAND_ASSET[token]) out.push(SHORTHAND_ASSET[token]!);
		else if (TRACKED_FLAGS.has(token)) out.push(token);
	}
	return out;
}

let _producers: Map<string, FlagProducer[]> | null = null;

/**
 * Map every producible flag/asset -> the stop options that produce it.
 * Used by waypoint expansion to satisfy locked-node unlock conditions transitively.
 */
export function flagProducers(): ReadonlyMap<string, FlagProducer[]> {
	if (_producers) return _producers;
	const map = new Map<string, FlagProducer[]>();
	const add = (flag: string, p: FlagProducer) => {
		const list = map.get(flag) ?? [];
		list.push(p);
		map.set(flag, list);
	};

	for (const loc of loadDatabase().locations) {
		const nodeLock = loc.status === 'locked' ? loc.unlock_condition : undefined;
		for (const opt of stopOptions(loc.id)) {
			const prereqFlags = trackablePrereqs(opt.requires);
			const producer = (flag: string): FlagProducer => ({
				flag,
				node: loc.id,
				optionId: opt.optionId,
				prereqFlags,
				nodeLock,
				baseTime: opt.baseTime,
			});
			if (opt.unlocks) add(opt.unlocks, producer(opt.unlocks));
			for (const log of opt.logs) add(log, producer(log));
			if (opt.grantsAsset) add(opt.grantsAsset, producer(opt.grantsAsset));
			if (opt.grantsKey) add(opt.grantsKey, producer(opt.grantsKey));
		}
	}

	// status-report producers with a defined box (beta -> 59-Z at box 15).
	const db = loadDatabase();
	for (const report of Object.values(db.status_reports)) {
		if (report.sets && typeof report.at_box === 'number') {
			add(report.sets, {
				flag: report.sets,
				node: db.campaign_metadata.finale_node,
				optionId: `status:${report.symbol}`,
				prereqFlags: [],
				baseTime: 0,
			});
		}
	}

	_producers = map;
	return map;
}

/** Reset caches (test isolation only). */
export function _resetModelCaches(): void {
	optionCache.clear();
	_producers = null;
}
