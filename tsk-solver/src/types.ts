/**
 * All exported types for the TSK solver.
 *
 * Two families live here:
 *  - "Raw" types (prefixed `Raw`) describe the shape of `tsk_database.json` verbatim.
 *  - Public API types describe `solve()`'s input/output surface (see README §3).
 *
 * IDs are kept as plain `string` aliases (never branded) so that callers can pass
 * literals from the database without ceremony. They are documented for intent only.
 */

export type NodeId = string;
export type ScenarioId = string;
export type KeyId = string;
export type AllyId = string;
export type ResId = string;
export type ChainId = string;
export type AchievementId = string;
/** Who currently bears a key: an investigator (the cell) or a named story character/enemy. */
export type BearerId = string;
/** A campaign-log entry or unlock code, e.g. `off_mission`, `code_56Y_written`. */
export type FlagId = string;
export type MarkerSymbol = 'alpha' | 'beta' | 'gamma' | 'epsilon' | 'zeta' | 'theta' | 'psi' | 'delta' | 'omega';
export type Locale = 'en' | 'fr' | 'es' | 'it';

// ---------------------------------------------------------------------------
// Raw database types (match tsk_database.json)
// ---------------------------------------------------------------------------

export type NodeKind = 'start' | 'scenario' | 'finale' | 'interlude' | 'side_story';
export type NodeStatus = 'standard' | 'side' | 'locked' | 'start';

export interface RawCampaignMetadata {
	name: string;
	campaign_code: string;
	start_node: NodeId;
	finale_node: NodeId;
	global_time_track_boxes: number;
	location_count: number;
}

/** How an achievement is routed for / detected. `feat: 'in_session'` => routing only
 * positions the player; the table feat itself is unverifiable by the planner. */
export type AchievementConstraintMeta =
	| { kind: 'time_cap'; max_time: number }
	| { kind: 'scenario_resolution'; scenario: ScenarioId; resolution: ResId; feat?: 'in_session' }
	| { kind: 'visit_scenario'; scenario: ScenarioId; max_time?: number; version?: string; feat?: 'in_session' }
	| { kind: 'scenario_version'; scenario: ScenarioId; version: string; feat?: 'in_session' }
	| { kind: 'visit_nodes'; nodes: NodeId[] }
	| { kind: 'difficulty'; difficulty: string }
	| { kind: 'finale_trial'; trial: number }
	| { kind: 'epilogue'; epilogue: string }
	| { kind: 'chaos'; token: 'tablet' | 'elder_thing'; count: number }
	| { kind: 'all_keys' }
	| { kind: 'none'; feat?: 'in_session' };

export interface RawAchievement {
	id: AchievementId;
	type: string;
	max_time?: number;
	requires?: string;
	scenario?: ScenarioId;
	resolution?: ResId;
	label?: string;
	constraint?: AchievementConstraintMeta;
	/** false => not a single-run planning constraint (e.g. cross-playthrough key collection). */
	planning?: boolean;
}

export interface RawKey {
	id: KeyId;
	scenario: ScenarioId | null;
	character: string;
	note?: string;
}

export interface RawAllyRecruit {
	node: NodeId;
	outcome: string;
	requires?: string;
}

export interface RawAlly {
	id: AllyId;
	name: string;
	deck_asset: boolean;
	recruit_via: RawAllyRecruit[];
	note?: string;
	source_set?: string;
}

export interface RawSideStoryProduct {
	id: string;
	name: string;
	/** Entry XP cost = time spent if this standalone is played. */
	xp_cost: number;
}

export interface RawSideStory {
	id: string;
	node: NodeId;
	products: RawSideStoryProduct[];
	grants_key?: KeyId;
	bearer?: BearerId;
	note?: string;
}

export interface RawWritesMarker {
	symbol: MarkerSymbol;
	offset: number;
}

export interface RawStatusReport {
	symbol: MarkerSymbol;
	type: 'box_symbol' | 'written_marker';
	at_box?: number | 'final';
	effect: string;
	sets?: FlagId;
	warning?: string;
	written_by?: string;
}

export interface RawLocation {
	id: NodeId;
	name: string;
	file: string | null;
	status: NodeStatus;
	node_kind: NodeKind;
	scenario_id: ScenarioId | null;
	connections: NodeId[];
	unlock_condition?: FlagId;
	revisit?: string;
	revisit_unlock?: FlagId;
}

export interface RawResolution {
	id: ResId;
	time: number;
	bearer?: BearerId | null;
	key?: KeyId | null;
	logs?: FlagId[];
	xp?: string | number | null;
	trauma?: string;
	achievement?: AchievementId;
	requires?: string;
	no_resolution?: boolean;
	outcome?: 'WIN_CAMPAIGN' | 'LOSE_CAMPAIGN';
	note?: string;
	/** Short human description of this resolution (for the UI resolution picker). */
	desc?: string;
	writes_marker?: RawWritesMarker;
	chaos?: string;
}

export interface RawIntroChoice {
	id: string;
	time?: number;
	chaos?: string;
	note?: string;
	logs?: FlagId[];
	requires?: string;
	grants_asset?: AllyId | string;
}

export interface RawTimeScaling {
	at: string;
	effect: string;
	doom?: string;
	forces_resolution?: ResId;
}

/** A time-based "level" a scenario is in when entered (ascending by maxTime; null = no upper bound). */
export interface RawTimeTier {
	maxTime: number | null;
	label: string;
}

export interface RawVersion {
	requires?: string;
	label?: string;
	note?: string;
	/** Flags set by playing this version (e.g. assisting Sirry => Foundation trust). */
	sets?: FlagId[];
	/** Version is only available within this time window. */
	min_time?: number;
	max_time?: number;
	/** For the finale: the Trial branch that produces this version. */
	trial?: number;
}

export interface RawScenario {
	name: string;
	location: NodeId;
	file: string;
	role?: 'prologue' | 'finale';
	intro_choices?: RawIntroChoice[];
	interlude_choices?: RawIntroChoice[];
	key?: KeyId | null;
	time_scaling?: RawTimeScaling[];
	time_tiers?: RawTimeTier[];
	versions?: Record<string, RawVersion>;
	boss?: string;
	arrival?: string[];
	resolutions: RawResolution[];
}

export interface RawInterludeOutcome {
	id: string;
	time?: number;
	logs?: FlagId[];
	xp?: number;
	requires?: string;
	note?: string;
	grants_key?: KeyId;
	grants_asset?: AllyId | string;
	bearer?: BearerId;
	unlocks?: FlagId;
	writes_marker?: RawWritesMarker;
	clears_log?: FlagId;
	chaos?: string;
	requires_location?: NodeId;
	trauma?: string;
	/** Number of chaos-bag tokens this outcome upgrades (e.g. Special Delivery delivery). */
	improves_chaos?: number;
}

export interface RawInterlude {
	name: string;
	file: string;
	location?: NodeId;
	locations?: NodeId[];
	trigger?: string;
	time?: number;
	note?: string;
	requires?: string;
	outcomes?: RawInterludeOutcome[];
	options?: RawInterludeOutcome[];
}

export interface RawChainWaypoint {
	node: NodeId;
	outcome: string;
	requires?: string;
	sets?: string;
	note?: string;
	grants?: string[];
}

export interface RawNarrativeChain {
	label: string;
	waypoints: RawChainWaypoint[];
	finale_impact?: string;
}

export interface RawArchetype {
	label: string;
	objective: string;
	weights: Record<string, number>;
}

export interface RawDiversity {
	max_results: number;
	similarity_metric: string;
	cluster_on: string[];
	merge_threshold: number;
	loyalist_vs_renegade_max_similarity: number;
}

export interface RawTrustDeception {
	foundation_trust_sources: string[];
	cell_deception_sources: string[];
	epilogue: string;
}

export interface RawTrialLogic {
	description: string;
	voters: Record<string, Record<string, string>>;
	branches: Record<string, string>;
}

export interface RawDatabase {
	$comment?: string;
	schema_version: string;
	campaign_metadata: RawCampaignMetadata;
	time_mechanics: Record<string, string>;
	achievements: RawAchievement[];
	keys: RawKey[];
	allies: RawAlly[];
	side_stories: RawSideStory[];
	status_reports: Record<string, RawStatusReport>;
	locations: RawLocation[];
	scenarios: Record<string, RawScenario>;
	interludes: Record<string, RawInterlude>;
	narrative_chains: Record<string, RawNarrativeChain>;
	trial_logic: RawTrialLogic;
	trust_deception: RawTrustDeception;
	archetypes: Record<string, RawArchetype>;
	diversity: RawDiversity;
}

// ---------------------------------------------------------------------------
// Campaign state machine (see README §2.4)
// ---------------------------------------------------------------------------

export interface CampaignState {
	/** Current location. */
	node: NodeId;
	/** Boxes filled on the time track. */
	timePassed: number;
	/** Stop-lockout: nodes already stopped at. */
	visitedStops: ReadonlySet<NodeId>;
	/** Log entries + unlock codes (e.g. `off_mission`, `code_56Y_written`). */
	flags: ReadonlySet<FlagId>;
	/** key -> bearer (investigator | enemy | story_asset). */
	keys: ReadonlyMap<KeyId, BearerId>;
	/** Deck-bound story assets recruited. */
	allies: ReadonlySet<AllyId>;
	/** e.g. mysterious_whistle, expedited_ticket, foundation_intel. */
	assets: ReadonlySet<string>;
	/** TSK chaos tokens (each capped at 4). Tablet ≈ "bless", Elder Thing ≈ "curse". */
	tablet: number;
	elderThing: number;
	/** Accumulated bonus XP (for the Scholar archetype). */
	xpBonus: number;
	/** Running Foundation-trust / cell-deception tallies. */
	trust: number;
	deception: number;
	/** Whether an unused Expedited Ticket is in hand. */
	hasTicket: boolean;
	/** Written symbols: theta/psi/delta -> box index where they were written. */
	markers: ReadonlyMap<string, number>;
}

/**
 * The campaign's special chaos tokens (capped at 4). The campaign guide PDF
 * mis-rendered these as "bless"/"curse"; in TSK they are the Tablet and Elder Thing
 * tokens. `CampaignState` carries them as `tablet`/`elderThing`.
 */
export interface ChaosTokens {
	tablet: number;
	elderThing: number;
}

// ---------------------------------------------------------------------------
// Localized strings (see README §8)
// ---------------------------------------------------------------------------

/**
 * Opaque, locale-independent string descriptor produced by the solver core.
 * `id` is a Paraglide message id; `params` are the message parameters.
 * Resolve to a concrete string with `resolveLocalized` (i18n/recipe.ts).
 */
export interface LocalizedString {
	id: string;
	params: Record<string, string | number>;
}

// ---------------------------------------------------------------------------
// Public API: constraints (see README §3.1)
// ---------------------------------------------------------------------------

/** Any constraint may be negated (`negate: true`) to exclude routes that satisfy it. */
export interface ConstraintBase {
	negate?: boolean;
}

export type Constraint = ConstraintBase &
	(
		| { kind: 'visit_scenario'; scenario: ScenarioId }
		| { kind: 'scenario_resolution'; scenario: ScenarioId; resolution: ResId }
		| { kind: 'scenario_version'; scenario: ScenarioId; version: string }
		| { kind: 'get_key'; key: KeyId; bearer?: 'investigator' }
		| { kind: 'recruit_ally'; ally: AllyId }
		| { kind: 'achievement'; id: AchievementId }
		| { kind: 'narrative_chain'; id: ChainId }
		| { kind: 'visit_node'; node: NodeId }
		| { kind: 'play_side_story'; sideStory: string }
		| { kind: 'avoid_scenario'; scenario: ScenarioId }
		| { kind: 'reach_ending'; trial: string }
		| { kind: 'finale_outcome'; outcome: 'WIN' }
		// Trust/Deception chaos-bag goals (see README §"Trust/Deception").
		| { kind: 'chaos_mix'; tablet?: number; elderThing?: number }
		| { kind: 'chaos_overflow_xp'; min: number }
		| { kind: 'chaos_balanced' }
	);

export type Archetype = 'speedrunner' | 'collector' | 'loyalist' | 'renegade' | 'scholar';

export type Difficulty = 'easy' | 'standard' | 'hard' | 'expert';

export interface SolvePreferences {
	respectOrder?: boolean;
	maxScenarios?: number;
	/**
	 * How many 14-C "Ruses and Reclamation" take-back sites a route should pass through to recover a
	 * stolen Key, IF it still holds Keys when it crosses the Zeta box (theft). Default 1; raise for
	 * more insurance against the "wrong leads" randomness. Routes that finish before Zeta need none.
	 */
	keyTakeBackSites?: number;
	/** Max distinct routes returned per scenario-count bucket (default 6). */
	maxPerScenarioCount?: number;
	/** Overall safety cap on total returned routes across all buckets (default 48). */
	maxResults?: number;
	difficulty?: Difficulty;
	allowExpeditedTicket?: boolean;
	ticketUse?: { mode: 'auto' } | { mode: 'manual'; jumpTo: NodeId };
	locale?: Locale;
	/** Upper bound on explored search states (determinism / responsiveness). Default 60000. */
	maxStates?: number;
}

export interface SolveInput {
	constraints: Constraint[];
	preferences?: SolvePreferences;
}

// ---------------------------------------------------------------------------
// Public API: output (see README §3.2)
// ---------------------------------------------------------------------------

export type StepType = 'travel' | 'stop' | 'play' | 'use_ticket' | 'status_report' | 'finale';

export interface Step {
	type: StepType;
	node?: NodeId;
	/** Time added by this travel leg (for `travel`/`use_ticket`). */
	pathCost?: number;
	/** For `use_ticket`. */
	from?: NodeId;
	to?: NodeId;
	timeSaved?: number;
	scenario?: ScenarioId;
	/** For stops; named when a specific resolution is required. */
	resolution?: ResId;
	/** false => "any resolution OK" (see README §3.3). */
	resolutionRequired: boolean;
	/** Why this step / why this resolution. */
	reason?: LocalizedString;
	/** Symbol fired, for `status_report`. */
	marker?: MarkerSymbol;
	/** For scenario stops: the time-based "level" the scenario is in at entry (e.g. "Lv. 3/4 — …"). */
	scenarioLevel?: LocalizedString;
	/** Bonus XP gained at this stop, if any. */
	xp?: number;
	timeAfter: number;
}

/** A reference back to an input constraint that a recipe satisfies. */
export interface ConstraintRef {
	index: number;
	kind: Constraint['kind'];
	label: LocalizedString;
}

/**
 * An achievement a recipe earns or makes possible.
 *  - `guaranteed`: the route fully satisfies it (e.g. Speed Demon's time cap, a forced resolution).
 *  - `in_session`: the route positions you correctly (right scenario/version), but the table feat
 *    itself (e.g. "defeat both Desis simultaneously") is up to play.
 */
export interface EarnedAchievement {
	id: AchievementId;
	label: LocalizedString;
	status: 'guaranteed' | 'in_session';
	/** True if this achievement was one of the input constraints (vs a surprise bonus). */
	requested: boolean;
}

export interface Recipe {
	steps: Step[];
	totalTime: number;
	scenarioCount: number;
	/** Combat scenarios played, in route order (for grouping + scenario-icon display). */
	playedScenarios: ScenarioId[];
	/** Keys held by an investigator at the finale. */
	keysHeld: KeyId[];
	alliesRecruited: AllyId[];
	trust: number;
	deception: number;
	/** Total bonus XP grabbed along the route. */
	bonusXp: number;
	/** Max extra XP achievable from over-trusting/over-deceiving (chaos-bag overflow). */
	chaosMaxOverflowXp: number;
	/** Brief summary of opportunistic side gains (XP, Foundation Intel, chaos-bag upgrades). */
	freebies: LocalizedString[];
	/** Predicted Trial outcome / epilogue branch. */
	endingBranch: string;
	/** TSK chaos tokens at the finale. */
	tablet: number;
	elderThing: number;
	warnings: LocalizedString[];
	satisfies: ConstraintRef[];
	/** Achievements this route earns (guaranteed) or makes possible (in_session). */
	earnableAchievements: EarnedAchievement[];
}

export interface ImpossibilityBreakdownItem {
	label: string;
	value: number;
}

export type ImpossibilityKind = 'time_floor' | 'scenario_count' | 'logical' | 'search_budget';

export interface ImpossibilityProof {
	kind: ImpossibilityKind;
	conflict: string;
	cap: number;
	breakdown: ImpossibilityBreakdownItem[];
	floor: number;
	message: LocalizedString;
}

export type SolveOutput =
	| { ok: true; recipes: Recipe[] }
	| { ok: false; proof: ImpossibilityProof };
