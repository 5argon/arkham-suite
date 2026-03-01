/**
 * All exported types for the TSK planner.
 *
 * The data is split across two files, bridged by stable, language-neutral IDs:
 *  - `logic.json` — behaviour: choice structure, structured `effects`, `conditionLogic`,
 *    the finale vote table, the map graph, time markers, side stories. (The `Logic*` types.)
 *  - `en.json` — display strings keyed by the same IDs. (The `En*` types.)
 *
 * Public API types (`CampaignState`, `Constraint`, `LocalizedString`, …) describe the
 * simulator's input/output surface and are locale-independent.
 */

export type NodeId = string; // a map location, e.g. `yborCity`
export type FileCode = string; // a campaign file, e.g. `5-A`, `Foundation`, `59-Z`
export type KeyId = string; // a campaign Key, e.g. `eyeOfRavens`
export type CharacterId = string; // a Coterie member / NPC, e.g. `thorne`; or the sentinel `investigator`
export type BearerId = CharacterId; // who bears a Key (`investigator` = the cell's chosen investigator)
export type LogId = string; // a campaign-log entry id, e.g. `log.notSeenRedGlovedMan`
export type AchievementId = string; // e.g. `ach.cluedIn`
export type DecisionId = string; // e.g. `RR.resolution`
export type OptionId = string; // e.g. `RR.R1`
/** A Greek symbol printed/written on the time track, e.g. `α`, `β`, `Θ`, `ω`. */
export type MarkerSymbol = string;
export type Locale = 'en';

// ---------------------------------------------------------------------------
// logic.json — behaviour
// ---------------------------------------------------------------------------

export type DecisionType =
	| 'pre_scenario'
	| 'interlude_directive'
	| 'scenario_interlude'
	| 'resolution'
	| 'conditional_outcome'
	| 'scenario_version'
	| 'time_scaling'
	| 'vote_outcome';

export type FileKind =
	| 'prologue'
	| 'scenario'
	| 'interlude'
	| 'location'
	| 'finale'
	| 'epilogue'
	| 'status_reports';

export type MarkerType = 'scenario' | 'locked' | 'sideStory' | 'secret';

export type Vote = 'yea' | 'nay' | 'abstain' | 'silent';

/** A structured campaign-state delta. `fullText` (en.json) is the human-readable version. */
export type Effect =
	| { type: 'record' | 'crossOff'; entryId: LogId }
	| { type: 'tally'; entryId: LogId; delta: number }
	| { type: 'key'; keyId: KeyId; bearer: BearerId }
	| { type: 'token'; token: 'tablet' | 'elderThing' | 'cultist'; delta: number }
	| { type: 'trust' }
	| { type: 'deception' }
	| { type: 'time'; delta: number }
	| { type: 'xp'; scope?: 'each' | 'lead'; amount?: number; victoryDisplay?: boolean; variable?: boolean; amountRef?: string }
	| { type: 'trauma'; scope?: string; physical?: number; mental?: number; amount?: number; kind?: string }
	| { type: 'storyAsset'; asset: string; action: 'add' | 'remove'; deckFree?: boolean }
	| { type: 'statusMarker'; symbol: MarkerSymbol; offsetFromNow: number }
	| { type: 'unlock'; locationIds: NodeId[]; fileCode?: FileCode }
	| { type: 'card'; card: string; action: string; scope?: string; weakness?: boolean }
	| { type: 'chaosTokenAdjust'; delta: number; choose?: unknown }
	| { type: 'campaign'; result: 'win' | 'lose' }
	| { type: 'note'; textRef: string }
	/** This stop lifts the one-stop-per-location lockout for its location (Rome/Bermuda/the Ybor City safehouse). `afterScenario` => the revisit is legal only once another scenario has been played since. */
	| { type: 'allowRevisit'; afterScenario: boolean };

/** Numeric comparison shape shared by `time`, `timeSinceMarker`, `countRecorded`, `tally`. */
export interface NumBound {
	lt?: number;
	lte?: number;
	gt?: number;
	gte?: number;
	min?: number;
	max?: number;
	eq?: number;
}

/**
 * A structured precondition for an auto-resolved branch or a vote-table row. A `null`
 * conditionLogic means "unconditional". Evaluated by `graph/conditions.ts`.
 */
export interface Condition {
	recorded?: LogId;
	notRecorded?: LogId;
	time?: NumBound;
	timeSinceMarker?: NumBound & { symbol: MarkerSymbol };
	timeMarkerReached?: MarkerSymbol;
	countRecorded?: NumBound & { anyOf: LogId[] };
	tally?: NumBound & { entry: LogId };
	tallyCompare?: { left: LogId; op: string; right: LogId };
	visited?: FileCode;
	notVisited?: FileCode;
	voteTally?: 'yeaWinsOrTie' | 'nayWins';
	votedNay?: CharacterId[];
	eerilySilentCount?: NumBound;
	noResolution?: boolean;
	allDefeated?: boolean;
	perDefeatedInvestigator?: boolean;
	atOtherCity?: NodeId;
	random?: boolean;
	scenarioState?: string;
	/** An upstream decision option the player selected (and its negation) — gates some resolutions. */
	choseOption?: OptionId;
	notChoseOption?: OptionId;
	default?: boolean;
	all?: Condition[];
	any?: Condition[];
	not?: Condition;
}

export interface VoteRow {
	when: Condition | null;
	votes: Record<CharacterId, Vote>;
	/** A flavour flag on this row (e.g. a coin flip or a forced vote) — surfaced as a note in the UI. */
	note?: string;
}

export type PlayOutcome = 'win' | 'partial' | 'loss' | 'noResolution';

export interface LogicOption {
	id: OptionId;
	selectable: boolean;
	effects: Effect[];
	conditionLogic: Condition | null;
	/** Finale `COTK.memberVotes` only: ordered rows; the first whose `when` holds sets the votes. */
	voteTable?: VoteRow[];
	/**
	 * Resolution option in a scenario whose `scenario_version` decision `gatesResolutions`: the
	 * version option ids this resolution can occur in (the version's cards make it reachable).
	 * Absent / empty => any version.
	 */
	reachableInVersions?: OptionId[];
	/** Resolution option representing the "no resolution reached" (all resigned/defeated) outcome. */
	isNoResolution?: boolean;
	/** Plannable precondition for a resolution (player choices / time / version) — used to hide it. */
	requires?: Condition | null;
	/** How the session must go to land here: not plannable, shown as outcome-dependent. */
	playOutcome?: PlayOutcome;
}

export interface LogicDecision {
	decisionId: DecisionId;
	decisionType: DecisionType;
	/** true => the player actively picks (render a dropdown); false => the game/state decides it. */
	selectable: boolean;
	options: LogicOption[];
	/** On a `scenario_version` decision: true if the version restricts which resolutions are reachable. */
	gatesResolutions?: boolean;
	gatingSource?: string;
	/** This decision only applies (is offered + resolved) when this condition holds against the state built from earlier decisions. Omitted => always applies. */
	appliesIf?: Condition;
}

export interface LogicFile {
	fileCode: FileCode;
	mapCode: string | null;
	kind: FileKind;
	keyAtStakeId?: KeyId;
	decisions: LogicDecision[];
	/** Map locations this file can be played at (usually one; some interludes span several). */
	locationIds: NodeId[];
}

export interface XY {
	x: number;
	y: number;
}

export interface LogicLocation {
	fileCodes: FileCode[];
	position: XY;
	markerType: MarkerType;
	positionConfidence?: string;
	connections: NodeId[];
}

export interface TimeMarker {
	symbol: MarkerSymbol;
	id: string;
	hasReport: boolean;
	reportOptionId: string | null;
	unlocksFinale?: boolean;
	forcesFinale?: boolean;
	timerOnly?: boolean;
	/** The printed box this marker fires at (α7…ω35); absent => written onto the track at runtime. */
	box?: number;
}

export interface SideStoryProduct {
	id: string;
	timeCost: number;
}

export interface SideStory {
	id: string;
	locationId: NodeId;
	grantsKeyId?: KeyId;
	bearer?: BearerId;
	products: SideStoryProduct[];
}

export interface WrapEdge {
	west: NodeId;
	east: NodeId;
	westSeam: XY;
	eastSeam: XY;
}

export interface Routing {
	curve: { type: string; k: number; sign: number; samplesHint?: number };
	edgeOverrides: Record<string, { sign?: number; k?: number }>;
	wrap: { bowUpK: number };
	warp: { timeCost: number; [k: string]: unknown };
	[k: string]: unknown;
}

export interface CampaignLogEntry {
	id: LogId;
	type?: 'tally';
}

/** How a planner detects whether a plan earns / sets up an achievement. */
export type AchievementDetect =
	| { kind: 'visitFile'; fileCode: FileCode; maxEntryTime?: number; inSession?: boolean }
	| { kind: 'resolution'; fileCode: FileCode; optionId: OptionId; inSession?: boolean }
	| { kind: 'version'; fileCode: FileCode; optionId: OptionId; inSession?: boolean }
	| { kind: 'finaleJudgment'; judgmentId: OptionId; inSession?: boolean }
	| { kind: 'timeCap'; maxTime: number }
	| { kind: 'chaos'; token: 'tablet' | 'elderThing'; count: number; inSession?: boolean }
	| { kind: 'epilogue'; optionId: OptionId }
	| { kind: 'visitLocations'; locationIds: NodeId[] }
	| { kind: 'allKeys' }
	| { kind: 'difficulty'; difficulty: string }
	| { kind: 'tableFeat' };

export interface AchievementEntry {
	id: AchievementId;
	detect: AchievementDetect;
	/** false => not a single-run planning goal (key collection / difficulty). */
	planning?: boolean;
}

export interface EpilogueTally {
	foundationTrust: LogId[];
	cellDeception: LogId[];
}

export interface MapImage {
	file: string;
	width: number;
	height: number;
	note?: string;
}

export interface LogicDatabase {
	campaign: string;
	schemaVersion: string;
	split: string;
	files: LogicFile[];
	campaignLog: CampaignLogEntry[];
	achievements: AchievementEntry[];
	epilogueTally: EpilogueTally;
	locations: Record<NodeId, LogicLocation>;
	timeMarkers: TimeMarker[];
	timeTrack: { boxes: number; note?: string };
	mapImage: MapImage;
	sideStories: SideStory[];
	routing: Routing;
	wrapEdges: WrapEdge[];
	_schema?: unknown;
}

// ---------------------------------------------------------------------------
// en.json — display strings
// ---------------------------------------------------------------------------

export interface EnOption {
	dropdownText: string;
	fullText: string;
	/** Prose version of the option's `conditionLogic`, for display under a selected option. */
	condition: string | null;
}

export interface EnDecision {
	label: string;
	prompt: string;
	options: Record<OptionId, EnOption>;
}

export interface EnFile {
	title: string;
	location: string;
	note?: string;
	decisions: Record<DecisionId, EnDecision>;
}

export interface EnLocale {
	campaign: string;
	locale: string;
	split: string;
	legend: Record<string, unknown>;
	files: Record<FileCode, EnFile>;
	campaignLog: Record<LogId, string>;
	achievements: Record<AchievementId, { name: string; description: string }>;
	effectText: Record<string, string>;
	keys: Record<KeyId, string>;
	characters: Record<CharacterId, string>;
	locations: Record<NodeId, string>;
	timeMarkers: Record<string, string>;
	sideStoryProducts: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Campaign state machine
// ---------------------------------------------------------------------------

export interface CampaignState {
	/** Current map location. */
	location: NodeId;
	/** Boxes filled on the (35-box) time track. */
	timePassed: number;
	/** Stop-lockout: `${fileCode}@${location}` keys already played. */
	visitedStops: ReadonlySet<string>;
	/** File codes already played (for `visited`/`notVisited` conditions). */
	visitedFiles: ReadonlySet<FileCode>;
	/** Recorded campaign-log entries (`log.*`). */
	recorded: ReadonlySet<LogId>;
	/** Tally entries (`log.foundationTrust`, `log.cellDeception`, `log.wrongLeads`) → count. */
	tallies: ReadonlyMap<LogId, number>;
	/** keyId -> bearer (`investigator` or a character id). */
	keys: ReadonlyMap<KeyId, BearerId>;
	/** Story assets in hand (deck-free or otherwise). */
	assets: ReadonlySet<string>;
	/** TSK chaos-bag special tokens (tablet/elderThing capped at 4; cultist uncapped). */
	tablet: number;
	elderThing: number;
	cultist: number;
	/** Accumulated bonus XP (victory display + chaos overflow). */
	xpBonus: number;
	/** An unused Expedited Ticket is in hand. */
	hasTicket: boolean;
	/** Map locations explicitly unlocked by `unlock` effects (status reports / interludes). */
	unlocked: ReadonlySet<NodeId>;
	/** Written time-track markers: symbol -> box index where it was placed. */
	markers: ReadonlyMap<MarkerSymbol, number>;
	/** Player-asserted board outcomes the plan can't derive (e.g. `desiReal` / `desiImpostor`). */
	boardStates: ReadonlySet<string>;
	/** Decision option ids the plan has selected so far (for `choseOption` resolution gates). */
	chosenOptions: ReadonlySet<OptionId>;
}

// ---------------------------------------------------------------------------
// Localized strings
// ---------------------------------------------------------------------------

/**
 * A locale-independent string descriptor produced by the simulator for *system* messages
 * (problems, warnings, computed labels). `id` is a Paraglide message id; resolve with
 * `resolveLocalized` (i18n/recipe.ts). Content strings (option text, names) come straight
 * from en.json via the loader's display accessors instead.
 */
export interface LocalizedString {
	id: string;
	params: Record<string, string | number>;
}

// ---------------------------------------------------------------------------
// Public API: constraints (the goals checklist)
// ---------------------------------------------------------------------------

export interface ConstraintBase {
	negate?: boolean;
}

export type Constraint = ConstraintBase &
	(
		| { kind: 'visit_file'; fileCode: FileCode }
		| { kind: 'resolution'; fileCode: FileCode; optionId: OptionId }
		| { kind: 'scenario_version'; fileCode: FileCode; optionId: OptionId }
		| { kind: 'scenario_level'; fileCode: FileCode; optionId: OptionId }
		| { kind: 'get_key'; key: KeyId; bearer?: 'investigator' }
		| { kind: 'achievement'; id: AchievementId }
		| { kind: 'campaign_log'; entryId: LogId }
		| { kind: 'play_side_story'; product: string }
		| { kind: 'reach_judgment'; judgment: OptionId }
		| { kind: 'finale_outcome'; outcome: 'WIN' }
		| { kind: 'epilogue'; optionId: OptionId }
		| { kind: 'chaos_mix'; tablet?: number; elderThing?: number }
		| { kind: 'chaos_balanced' }
	);

export type Difficulty = 'easy' | 'standard' | 'hard' | 'expert';

/**
 * An achievement a plan earns or makes possible.
 *  - `guaranteed`: the plan fully satisfies it.
 *  - `in_session`: the plan positions you correctly, but the table feat is up to play.
 */
export interface EarnedAchievement {
	id: AchievementId;
	label: LocalizedString;
	status: 'guaranteed' | 'in_session';
	/** True if this achievement was one of the input goals (vs a surprise bonus). */
	requested: boolean;
}
