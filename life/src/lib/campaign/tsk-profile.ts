/**
 * tsk-profile.ts — per-campaign aggregate for The Scarlet Keys widgets, built from
 * the recorded logs of every TSK play (the same `CampaignRecord.recorded` the EotE
 * `buildEoe` reads). Two researched aspects the final log can't summarise on its own:
 *
 *  • Trust vs Deception — every Coterie-facing scenario opens with a binary choice
 *    that records a distinct campaign-log entry; a TRUST act swings the Foundation's
 *    trust, a DECEPTION act swings the Cell's deception (which together steer the
 *    epilogue). We classify each recorded choice log into trust/deception. The
 *    trust/deception → log mapping is cross-referenced from the tsk-solver decision
 *    graph (options carrying a `trust`/`deception` effect + a `record`) against the
 *    campaign-data entry ids. Intro choices that only adjust the chaos bag (no
 *    distinct log, e.g. Sanguine Shadows' Bolívar) are intentionally absent.
 *
 *  • The Red Coterie — how each play resolved with the Coterie at the finale
 *    (joined / overthrew / escaped / spared / destroyed from within / allied).
 */
import { achievementsFor, evaluateAchievement, getCampaignLog, isCleared } from '@5argon/arkham-campaign-data';
import * as m from '$lib/paraglide/messages.js';
import type { CampaignRecord } from './achievement-aggregate';
import type { ResolutionTally } from './resolution-coverage';
import {
	baleEngineQuestFromLogs,
	congressVersionForJudgment,
	coterieAllyMembers,
	coterieEnemyMembers,
	coterieVoteRows,
	deadAndGoneFromLogs,
	judgmentFromLogs,
	keyObtainedFromScenario,
	ruinousChimeQuestFromLogs,
	scenarioResultFromResolution,
	scenarioVersionFromLogs,
	sideQuestsFromLogs,
	TSK_KEY_SCENARIOS,
} from './tsk-solver';

const TSK_FAMILY = 'tskc';
const P = 'campaign_notes.';

/** Achievement ids the "Successful Routes" widget tags each winning route with — so
 *  it can surface the most recent run that earned each. (Order = display order.) */
export const TSK_ROUTE_ACHIEVEMENTS = [
	'red_looks_good',
	'bloody_red',
	'speed_demon',
	'trust_nobody',
	'trust_everybody',
	'badge',
] as const;

/** Recorded choice logs that are a TRUST act (label = the campaign-log entry id). */
export const TSK_TRUST_LOGS: Record<string, () => string> = {
	[`${P}cell_told_the_truth_to_taylor`]: () => m.campaign_tsk_trust_log_told_truth_taylor(),
	[`${P}cell_is_working_with_ece`]: () => m.campaign_tsk_trust_log_worked_with_ece(),
	[`${P}cell_made_a_deal_with_thorne`]: () => m.campaign_tsk_trust_log_deal_thorne(),
	[`${P}cell_made_a_deal_with_the_claret_knight`]: () => m.campaign_tsk_trust_log_deal_claret_knight(),
	[`${P}cell_possesses_a_mysterious_whistle`]: () => m.campaign_tsk_trust_log_aliki_whistle(),
};

/** Recorded choice logs that are a DECEPTION act. */
export const TSK_DECEPTION_LOGS: Record<string, () => string> = {
	[`${P}cell_hid_the_truth_from_taylor`]: () => m.campaign_tsk_deception_log_hid_truth_taylor(),
	[`${P}cell_is_deceiving_ece`]: () => m.campaign_tsk_deception_log_deceived_ece(),
	[`${P}foundation_remains_in_the_dark`]: () => m.campaign_tsk_deception_log_foundation_dark(),
	[`${P}cell_is_assisting_agent_sirry`]: () => m.campaign_tsk_deception_log_sided_sirry(),
	[`${P}cell_refused_alikis_offer`]: () => m.campaign_tsk_deception_log_refused_aliki(),
};

// ─── Foundation Trust & Cell Deception — the EPILOGUE TALLY ───────────────────
// Counted at the finale: each recorded (or, for delivering intel, crossed-off) entry adds 1 to its
// side. This is a SEPARATE axis from the chaos-bag Tablet/Elder Thing acts below — e.g. aiding the
// Claret Knight is a chaos-bag *Trust* act but a *Cell Deception* tally entry, the reverse of
// assisting Agent Sirry. Mirrors tsk-solver's `epilogueTally`.
// Each entry is a bare campaign_notes id; its display label is the log-note text from campaign-data
// (`tskTallyLabel`), so the wording stays in one authoritative, localizable place.
export interface TallyEntry {
	/** Bare campaign_notes id (no `campaign_notes.` prefix). */
	id: string;
	/** True when the entry is counted as CROSSED OFF rather than recorded (delivering intel). */
	crossoff?: boolean;
}
export const TSK_FOUNDATION_TRUST: TallyEntry[] = [
	{ id: 'cell_is_assisting_agent_sirry' },
	{ id: 'cell_told_the_truth_to_taylor' },
	{ id: 'agent_quinn_has_your_back' },
	{ id: 'cell_is_delivering_foundation_intel', crossoff: true },
];
export const TSK_CELL_DECEPTION: TallyEntry[] = [
	{ id: 'cell_hid_the_truth_from_taylor' },
	{ id: 'cell_is_off_mission' },
	{ id: 'cell_aided_the_knight' },
	{ id: 'ece_trusts_the_cell' },
	{ id: 'cell_made_a_deal_with_thorne' },
	{ id: 'aliki_is_on_your_side' },
	{ id: 'desi_is_in_your_debt' },
	{ id: 'tuwile_masai_is_on_your_side' },
];

// ─── Chaos-bag Tablet/Elder Thing acts (the "Tablet vs Elder Thing" axis) ─────
// Every choice that swaps the chaos bag (Trust: −Elder Thing +Tablet; Deception: the reverse), with
// how a recorded play is DETECTED. Most write a campaign_notes log (or cross one off); three leave no
// log trace and are captured by an Extra input (Riddles and Rain, Sanguine Shadows' Bolívar, and On
// Thin Ice's refuse). An act counts if ANY of its detectors matches. Mirrors the tsk-solver
// `chaosAdjustments()` catalog. Each act maps to one scenario; its label is that scenario's name from
// campaign-data (`tskBagActLabel`), so no display strings are hand-written here. The per-act detection
// rule is documented in the widget's header doc (widget/tsk/token-balance).
type BagDetector =
	| { mode: 'log'; id: string }
	| { mode: 'crossoff'; id: string }
	| { mode: 'extra'; key: string; value: string };
export interface BagAct {
	id: string;
	kind: 'trust' | 'deception';
	/** kohaku scenario id — resolves to the display name via campaign-data `scenarioNames`. */
	scenario: string;
	any: BagDetector[];
}
export const TSK_BAG_ACTS: BagAct[] = [
	// Trust (−Elder Thing, +Tablet)
	{ id: 'rr_offer', kind: 'trust', scenario: 'riddles_and_rain', any: [{ mode: 'extra', key: 'riddles_and_rain.intro_offer', value: 'take_offer' }] },
	{ id: 'foundation_tell', kind: 'trust', scenario: 'the_foundation', any: [{ mode: 'log', id: 'cell_told_the_truth_to_taylor' }] },
	{ id: 'bolivar_all', kind: 'trust', scenario: 'sanguine_shadows', any: [{ mode: 'extra', key: 'sanguine_shadows.bolivar', value: 'all' }] },
	{ id: 'dealings_work', kind: 'trust', scenario: 'dealings_in_the_dark', any: [{ mode: 'log', id: 'cell_is_working_with_ece' }] },
	{ id: 'deadgone_tell', kind: 'trust', scenario: 'london', any: [{ mode: 'crossoff', id: 'agent_quinn_does_not_trust_the_cell' }] },
	{ id: 'onthinice_deal', kind: 'trust', scenario: 'on_thin_ice', any: [{ mode: 'log', id: 'cell_made_a_deal_with_thorne' }, { mode: 'extra', key: 'on_thin_ice.raw_deal', value: 'accept' }] },
	{ id: 'dogs_aid', kind: 'trust', scenario: 'dogs_of_war', any: [{ mode: 'log', id: 'cell_aided_the_knight' }] },
	{ id: 'whistle_accept', kind: 'trust', scenario: 'kathmandu', any: [{ mode: 'log', id: 'cell_possesses_a_mysterious_whistle' }] },
	// Deception (−Tablet, +Elder Thing)
	{ id: 'rr_own', kind: 'deception', scenario: 'riddles_and_rain', any: [{ mode: 'extra', key: 'riddles_and_rain.intro_offer', value: 'reject_offer' }] },
	{ id: 'foundation_hide', kind: 'deception', scenario: 'the_foundation', any: [{ mode: 'log', id: 'cell_hid_the_truth_from_taylor' }] },
	{ id: 'bolivar_nada', kind: 'deception', scenario: 'sanguine_shadows', any: [{ mode: 'extra', key: 'sanguine_shadows.bolivar', value: 'nada' }] },
	{ id: 'dealings_deceive', kind: 'deception', scenario: 'dealings_in_the_dark', any: [{ mode: 'log', id: 'cell_is_deceiving_ece' }] },
	{ id: 'deadgone_keep', kind: 'deception', scenario: 'london', any: [{ mode: 'log', id: 'foundation_remains_in_the_dark' }] },
	{ id: 'onthinice_refuse', kind: 'deception', scenario: 'on_thin_ice', any: [{ mode: 'extra', key: 'on_thin_ice.raw_deal', value: 'reject' }] },
	{ id: 'dogs_sirry', kind: 'deception', scenario: 'dogs_of_war', any: [{ mode: 'log', id: 'cell_is_assisting_agent_sirry' }] },
	{ id: 'whistle_refuse', kind: 'deception', scenario: 'kathmandu', any: [{ mode: 'log', id: 'cell_refused_alikis_offer' }] },
];

// Display labels resolved from campaign-data (the authoritative, localizable source) — no widget text
// is hand-written in this file. Tally rows show the log-note wording; bag-act rows show the scenario.
function tskEn() {
	return getCampaignLog(TSK_FAMILY)?.en;
}
export function tskTallyLabel(e: TallyEntry): string {
	const raw = tskEn()?.entries?.[`${P}${e.id}`]?.text ?? e.id;
	const text = raw.charAt(0).toUpperCase() + raw.slice(1); // log notes are stored lowercase ("the cell …")
	return e.crossoff ? `${text} (crossed off)` : text;
}
// Bag-act label = scenario name (campaign-data) + " — " + a short action phrase (arkham.life paraglide,
// reusing the existing trust/deception-act messages where they exist). The "how we know" detection rule
// is NOT here — it lives in the widget's header doc (widget/tsk/token-balance).
const BAG_ACT_ACTION: Record<string, () => string> = {
	rr_offer: () => m.campaign_tsk_bagact_rr_offer(),
	foundation_tell: () => m.campaign_tsk_trust_log_told_truth_taylor(),
	bolivar_all: () => m.campaign_tsk_bagact_bolivar_all(),
	dealings_work: () => m.campaign_tsk_trust_log_worked_with_ece(),
	deadgone_tell: () => m.campaign_tsk_bagact_deadgone_tell(),
	onthinice_deal: () => m.campaign_tsk_trust_log_deal_thorne(),
	dogs_aid: () => m.campaign_tsk_trust_log_deal_claret_knight(),
	whistle_accept: () => m.campaign_tsk_trust_log_aliki_whistle(),
	rr_own: () => m.campaign_tsk_bagact_rr_own(),
	foundation_hide: () => m.campaign_tsk_deception_log_hid_truth_taylor(),
	bolivar_nada: () => m.campaign_tsk_bagact_bolivar_nada(),
	dealings_deceive: () => m.campaign_tsk_deception_log_deceived_ece(),
	deadgone_keep: () => m.campaign_tsk_deception_log_foundation_dark(),
	onthinice_refuse: () => m.campaign_tsk_bagact_onthinice_refuse(),
	dogs_sirry: () => m.campaign_tsk_deception_log_sided_sirry(),
	whistle_refuse: () => m.campaign_tsk_deception_log_refused_aliki(),
};
export function tskBagActLabel(act: BagAct): string {
	const scenario = tskEn()?.scenarioNames?.[act.scenario] ?? act.scenario;
	const action = BAG_ACT_ACTION[act.id]?.();
	return action ? `${scenario} — ${action}` : scenario;
}

/** Did this chaos-bag act happen in a play? (log present / crossed off / Extra chosen) */
function bagActDetected(act: BagAct, logs: ReadonlySet<string>, crossed: ReadonlySet<string> | undefined, choices: Record<string, string> | undefined): boolean {
	return act.any.some((d) =>
		d.mode === 'log' ? logs.has(`${P}${d.id}`) : d.mode === 'crossoff' ? (crossed?.has(`${P}${d.id}`) ?? false) : choices?.[d.key] === d.value,
	);
}

/**
 * Auto-inference for the two "Trust …" achievements, which the campaign-data DSL can't express (the
 * "never removed that token" half spans optional-scenario Extra inputs). Requires a WON run that ends
 * with four of one token AND never removed any of it — i.e. never made a single act of the OPPOSITE
 * kind (an act of secrecy removes a Tablet; an act of trust removes an Elder Thing). Sound only when
 * the player recorded every act (the three Extra choices included); a missing Extra can't be detected.
 */
export function tskTrustAchievements(args: {
	recordedLogs: ReadonlySet<string>;
	crossedLogs?: ReadonlySet<string>;
	scenarioChoices?: Record<string, string>;
	finalChaosBag?: Record<string, number>;
	won: boolean;
}): { trust_nobody: boolean; trust_everybody: boolean } {
	const { recordedLogs, crossedLogs, scenarioChoices, finalChaosBag, won } = args;
	const didKind = (kind: 'trust' | 'deception') => TSK_BAG_ACTS.some((a) => a.kind === kind && bagActDetected(a, recordedLogs, crossedLogs, scenarioChoices));
	return {
		// Four Tablets, never removed one → never made an act of secrecy.
		trust_everybody: won && finalChaosBag?.['tablet'] === TSK_BAG_CAP_END && !didKind('deception'),
		// Four Elder Things, never removed one → never made an act of trust.
		trust_nobody: won && finalChaosBag?.['elder_thing'] === TSK_BAG_CAP_END && !didKind('trust'),
	};
}
const TSK_BAG_CAP_END = 4;

/** The conditions the two `lifeInfer` Trust achievements check, for the gear modal (no expressible
 *  campaign-data rule exists). `[tablet]`/`[elder_thing]` markup renders as glyphs. */
export function tskTrustAchievementConditions(id: string): string[] {
	if (id === 'trust_everybody') return [m.campaign_tsk_trust_cond_won(), m.campaign_tsk_trust_cond_tablet4(), m.campaign_tsk_trust_cond_no_secrecy()];
	if (id === 'trust_nobody') return [m.campaign_tsk_trust_cond_won(), m.campaign_tsk_trust_cond_elder4(), m.campaign_tsk_trust_cond_no_trust()];
	return [];
}

// The Red Coterie widget no longer hand-picks a "member on your side" log or re-tallies the finale
// outcomes (those duplicate Congress of the Keys' Meeting Routes). Its rows now come from the
// finale vote table via `coterieVoteRows()` (tsk-solver), counted by `voteTransitions` below.

export interface CampaignTsk {
	family: string;
	plays: number;
	/** Total trust / deception acts made across all plays. */
	trustActs: number;
	deceptionActs: number;
	/** Per-act play counts (how many plays made each choice), keyed by log id. */
	trustByLog: Record<string, number>;
	deceptionByLog: Record<string, number>;
	/** EPILOGUE TALLY — plays recording each Foundation Trust / Cell Deception entry, keyed by bare id
	 *  (delivering intel counts when crossed off). Distinct from the chaos-bag acts. */
	foundationTrustTally: Record<string, number>;
	cellDeceptionTally: Record<string, number>;
	/** CHAOS-BAG acts — plays where each Tablet/Elder Thing swap happened, keyed by {@link BagAct.id}. */
	bagActCounts: Record<string, number>;
	/** Highest recorded Foundation Trust / Cell Deception counter across plays. */
	foundationTrustMax: number | null;
	cellDeceptionMax: number | null;
	/** High-score: the biggest lead Foundation Trust took over Cell Deception in a run (and vice versa);
	 *  null until a play recorded both counters. */
	maxTrustMargin: number | null;
	maxDeceptionMargin: number | null;
	/**
	 * Coterie member vote transitions — per member (tsk-solver character id) → resulting vote
	 * (`nay` | `yea` | `abstain` | `silent`) → plays where you achieved that change off their default.
	 * Counted from the finale vote table's trigger logs (see `coterieVoteRows`), replacing the old
	 * hand-picked "member on your side" tally and the finale-outcome tally (the latter duplicated
	 * Congress of the Keys' Meeting Routes).
	 */
	voteTransitions: Record<string, Record<string, number>>;
	/**
	 * Who fought the FINAL BATTLE alongside you — per member (tsk-solver character id) → campaigns
	 * where they voted **Nay** (so they joined as a Conspirator/ally), by difficulty. Same vote
	 * resolution as `voteTransitions`, gated on reaching the Congress; Desi uses the real/impostor Extra.
	 */
	finaleAllies: Record<string, ResolutionTally>;
	/**
	 * Who stood AGAINST you in the final battle — per member, campaigns they voted **Yea** and had an
	 * enemy card (so set aside as an enemy), by difficulty; the Red-Gloved Man is counted every finale
	 * (always an enemy). Only members with an enemy card appear (Tuwile / Abarran / Razin never do).
	 */
	finaleEnemies: Record<string, ResolutionTally>;
	/** Per-campaign Congress vote HIGHSCORES: the single trial with the biggest Yea-over-Nay lead, the
	 *  biggest Nay-over-Yea lead, and the most Eerily Silent votes among the Coterie — each with the
	 *  route that achieved it (ties → the most recent play). A lead only counts when strictly positive
	 *  (so Abstain / Eerily Silent votes, counted toward neither side, lower it); null when no recorded
	 *  trial produced one. */
	voteHighs: {
		yeaOverNay: TskVoteHigh | null;
		nayOverYea: TskVoteHigh | null;
		silent: TskVoteHigh | null;
	};
	/** Plays that reached each Congress judgment (meeting route), keyed by judgment id, with a
	 *  per-difficulty breakdown for the Reached hover. */
	judgments: Record<string, ResolutionTally>;
	/**
	 * Three extremal runs by FINAL chaos-bag composition — the run with the most Tablet, the most
	 * Elder Thing, and the fewest COMBINED tokens — each carrying that run's full Tablet + Elder
	 * Thing counts and its route (ties broken by the most recent play, so the route reads as a
	 * "recent route" like the other tables). Trust acts swap an Elder Thing for a Tablet and
	 * deception the reverse (each capped at 4 → overflow becomes bonus XP), so the ending balance
	 * can't recover the exact act count — but these highlights still tell the story. null until a
	 * play recorded a final chaos bag. (cf. EotE Frost tokens.)
	 */
	mostTabletRun: TskBagRun | null;
	mostElderThingRun: TskBagRun | null;
	leastCombinedRun: TskBagRun | null;
	/** Winning routes (the scenario sequence played), for the Routings widgets. */
	routes: TskRoute[];
	/**
	 * Per scenario → recorded variant (level/version) option id → resolution id →
	 * reach tally. ONLY counts plays that recorded the variant in the Extra tab, so
	 * a per-variant table can credit a resolution to the exact variant it was reached
	 * on. A play that left the variant blank contributes nothing here (it still shows
	 * in the catch-all Resolution Coverage, which uses every play).
	 */
	scenarioVariantTallies: Record<string, Record<string, Record<string, ResolutionTally>>>;
	/**
	 * Per scenario → recorded variant (level/version) option id → run tally (total +
	 * per-difficulty). The AUTHORITATIVE "you played this scenario at this variant" count,
	 * taken from the recorded tier itself — so it's set even for a play that filled the Extra
	 * tab (tier + resolution) but logged no narrative entry for the scenario (such a play never
	 * enters the log-derived `routes`). Drives the per-variant Runs column (with its
	 * per-difficulty hover) so a lit resolution always has a matching run count.
	 */
	scenarioVariantPlays: Record<string, Record<string, ResolutionTally>>;
	/**
	 * Per scenario → how many plays RECORDED that scenario in ANY authoritative way (scenario XP,
	 * a resolution, or a tier), deduped per play and broken down by difficulty. The count the
	 * passport's "played" badge shows — a superset of BOTH the XP-only generic count and the
	 * resolution-derived Succeed/Failed, so `plays ≥ succeed + failed` always holds. The XP-only
	 * generic count (`scenarioXp.plays`) misses a play that recorded a resolution but earned no
	 * scenario XP — e.g. On Thin Ice when "there is nothing of note in Anchorage" skips the
	 * scenario yet the cell still recorded its outcome — which then showed as `played < failed`.
	 */
	scenarioPlays: Record<string, ResolutionTally>;
	/**
	 * Every recorded `campaign_notes` entry → number of plays that recorded it (keyed by
	 * bare entry id). The general escape hatch for bespoke per-scenario widgets that count
	 * a specific narrative moment across plays (e.g. Dealings' "Refused Ece"), without
	 * threading each one through a dedicated tally. Pure user data (ids + counts).
	 */
	logCounts: Record<string, number>;
	/**
	 * Per-scenario log-derived "Succeed vs Failed" tally (the rules live in tsk-solver's
	 * `scenarioOutcomeFromLogs`), each side broken down by difficulty for the per-difficulty
	 * hover. Only scenarios with a clean signal have an entry. Keyed by scenario id.
	 */
	scenarioOutcomes: Record<string, { succeed: ResolutionTally; failed: ResolutionTally }>;
	/**
	 * Per scenario → variant (level/version) option id → { succeed, failed } tally (each by
	 * difficulty). The Succeed/Failed split of {@link scenarioVariantPlays}'s runs, so the
	 * per-variant table can show Succeed/Failed columns per tier row instead of a Runs count.
	 */
	scenarioVariantOutcomes: Record<
		string,
		Record<string, { succeed: ResolutionTally; failed: ResolutionTally }>
	>;
	/**
	 * Per Scarlet Key (item id) → how many plays OBTAINED it (any of the cell's
	 * investigators bore it) vs how many plays the SUBJECT'S OWN investigator BORE it,
	 * each broken down by difficulty, plus the most-recent bearer's investigator code on
	 * each side (its card art). Drives the two Scarlet Keys widgets (Obtained / Bearer).
	 */
	keys: Record<string, TskKeyStat>;
	/**
	 * Per scenario (the 7 whose Key is won via its own resolution) → how many plays OBTAINED the Key
	 * there (a cell investigator took it) vs how many plays could be DETERMINED at all (a resolution
	 * was recorded — the evaluator relies strictly on it). Derived from the recorded resolution + logs
	 * via `keyObtainedFromScenario`, NOT from final possession (a Key can be stolen after the fact).
	 * The scenario widget shows the obtained count only when `determinable > 0`. `obtained` carries a
	 * per-difficulty breakdown (for the hover), `determinable` is the total plays with a resolution.
	 */
	keyObtained: Record<string, { obtained: ResolutionTally; determinable: number }>;
	/**
	 * The Bale Engine quest (Tuwile Masai) — a no-scenario Key, fully log-derived. `obtained` (by
	 * difficulty) = plays that won it; `nairobi` = won outright when Masai trusted you; `bermuda` = won
	 * back at The Great Work after he fled; `fled` = plays he fled to Bermuda; `lost` = fled and never
	 * won back. See `baleEngineQuestFromLogs`.
	 */
	baleEngine: { obtained: ResolutionTally; nairobi: number; bermuda: number; fled: number; lost: number };
	/**
	 * The Ruinous Chime quest (Dr. Irawan) — a no-scenario Key, fully log-derived. `obtained` (by
	 * difficulty) = plays that won it at Manokwari; `met` = met her in Perth; `newGuinea` = she left for
	 * New Guinea; `vanished` = she vanished from existence (lost). See `ruinousChimeQuestFromLogs`.
	 */
	ruinousChime: { obtained: ResolutionTally; met: number; newGuinea: number; vanished: number };
	/**
	 * TSK side quests — the optional mini-quest stops, every fact log-derived. `delivery`/`architecture`
	 * complete by a CROSSED-OFF note (so `delivered`/`completed` count crossed-off runs, by difficulty,
	 * while `pickedUp`/`noticed` count the plays that recorded the note at all). `quidProQuo` counts the
	 * two intel notes. `ruses` only has its persistent `wrong_leads` count (the theft + recovery are
	 * hidden notes). See `sideQuestsFromLogs`.
	 */
	sideQuests: {
		delivery: { delivered: ResolutionTally; pickedUp: number };
		architecture: { completed: ResolutionTally; noticed: number };
		quidProQuo: { amaranth: number; desi: number };
		ruses: { wrongLeadsTotal: number; wrongLeadsMax: number };
	};
	/**
	 * Dead and Gone — the secret-scenario quest funnel (the hidden path to Without a Trace), fully
	 * log-derived. The progression beats (`whistle` → `offMission` → `enteredWaT` → `trueNature`, the
	 * last two by difficulty) plus the setbacks (`quinnVanished`, `refusedWhistle`). See `deadAndGoneFromLogs`.
	 */
	deadAndGone: {
		whistle: number;
		refusedWhistle: number;
		quinnVanished: number;
		offMission: number;
		enteredWaT: ResolutionTally;
		trueNature: ResolutionTally;
	};
	/**
	 * Sanguine Shadows' secret boss — the Sanguine Watcher: plays that took it down
	 * (`have_not_seen_the_last_of_the_sanguine_watcher`) vs plays where its torment
	 * continues (`sanguine_watchers_torment_continues`), each by difficulty.
	 */
	sanguineWatcher: {
		tookDown: ResolutionTally;
		tormentContinues: ResolutionTally;
		/** tookDown + tormentContinues merged — every run that CONFRONTED the Watcher
		 *  ("teamed up to take down the true threat"), with the per-difficulty breakdown.
		 *  Precomputed so the widget reads it instead of merging the two tallies live. */
		confronted: ResolutionTally;
	};
	/**
	 * Sanguine Shadows' "targets kept" rows: target count → runs (by difficulty) + the
	 * most-recent route that kept that many. Keyed by the recorded `targets` count, except
	 * a run that recruited La Chica Roja (`chica_roja_is_on_your_side`) is inferred as 6 —
	 * the secret boss is only reachable by keeping all six, where target counting is skipped.
	 */
	sanguineTargets: Record<number, { runs: ResolutionTally; route: TskRoute | null }>;
	/**
	 * Shades of Suffering — Tzu San Niang's sway: plays where she fell under YOUR sway
	 * (`tzu_san_niang_is_under_your_sway`) vs plays where SHE has you under HERS
	 * (`tzu_san_niang_has_you_under_her_sway`), each by difficulty.
	 */
	shadesOfSuffering: {
		tzuUnderYourSway: ResolutionTally;
		tzuHasYouUnderHerSway: ResolutionTally;
	};
	/**
	 * Without a Trace — its outcome notes, each by difficulty. The true-nature / Aliki notes are RECORDED
	 * only by Without a Trace (the Congress merely CHECKS them), so they're counted straight from the log
	 * — Without a Trace is a secret scenario played BEFORE the Congress, so a run usually goes on to the
	 * Congress (don't gate on that). `cell_was_hollowed` is shared with the Congress, so it's pinned to
	 * Without a Trace only when no Congress judgment was reached (a WaT hollowing ends the run early).
	 */
	withoutATrace: {
		knowsTrueNature: ResolutionTally;
		alikiOnYourSide: ResolutionTally;
		notSeenAliki: ResolutionTally;
		cellHollowed: ResolutionTally;
	};
	// ── Headline aggregates ──────────────────────────────────────────────────────
	// Precomputed scalars so `.ahlifepro` consumers read them directly rather than
	// re-deriving in the UI (see the serialization principle in compiled-profile.ts).
	/** trustActs + deceptionActs — total Coterie-facing acts across all plays. */
	actsTotal: number;
	/** Share of acts that were Trust (rather than Deception), 0–100; 0 when no acts. */
	trustPct: number;
	/** Fastest / slowest winning run by "time passed"; null until a won route recorded a time. */
	fastestWinTime: number | null;
	slowestWinTime: number | null;
	/** Distinct Scarlet Keys ever obtained (any bearer) / borne by the subject's own investigator. */
	distinctKeysObtained: number;
	distinctKeysBorne: number;
	/**
	 * Dead Heat civilians — the rescued/slain Extra counters, for its bespoke widget.
	 * Comparative stats count plays that recorded BOTH counters; the per-player-count
	 * "best play" tables also need a known player count (total civilians per game =
	 * (playerCount + 1) × 5 locations).
	 */
	deadHeat: {
		/** Plays where rescued > slain. */
		rescuedOverSlain: number;
		/** Plays where rescued > 2 × slain. */
		rescuedOverDoubleSlain: number;
		/** Plays where slain > rescued. */
		slainOverRescued: number;
		/** Plays where slain > 2 × rescued. */
		slainOverDoubleRescued: number;
		/** Most civilians rescued in a single play; null if none recorded. */
		mostRescued: number | null;
		/** Fewest civilians slain in a single play; null if none recorded. */
		leastSlain: number | null;
		/** Plays that reunited the lovers — Amaranth's R1 resolution (the `lovers_are_reunited`
		 *  note, the same entry that secures her in the Coterie widget). */
		loversReunited: number;
		/** Player count → the best play by NET saved (rescued − slain). */
		bestByNet: Record<number, DeadHeatCivilianRun>;
		/** Player count → the best play by SURPLUS over twice slain (rescued − 2 × slain). */
		bestByDouble: Record<number, DeadHeatCivilianRun>;
	};
	/** Most recent unique cards erased from existence (Dancing Mad / On Thin Ice), newest first,
	 *  capped at 10. A card-level campaign-log fact shared across the cell; each paired with the finish
	 *  date of the campaign it happened in (null if that campaign isn't finished). */
	erasedFromExistence: TskErasedCard[];
}

/** One Dead Heat play's recorded civilian counts (the best play at a player count). */
export interface DeadHeatCivilianRun {
	rescued: number;
	slain: number;
}

/** One unique card erased from existence + the finish date of the campaign it happened in. */
export interface TskErasedCard {
	code: string;
	finishDate: number | null;
}

/** The single trial with the most votes in a category (Yea / Nay+Abstain / Eerily Silent), plus the
 *  route that achieved it. */
export interface TskVoteHigh {
	count: number;
	route: TskRoute | null;
}

/** One run's FINAL chaos-bag Tablet/Elder Thing composition plus that run's route — for the
 *  "Most Tablet / Most Elder Thing / Least combined in a run" highlights. `route` is null when
 *  the extremal play logged no route. */
export interface TskBagRun {
	tablet: number;
	elderThing: number;
	/** Bonus XP this run earned from adding tokens to an already-full bag (4) — Tablet + Elder Thing
	 *  overflow combined; 0 when nothing overflowed. */
	bonusXp: number;
	route: TskRoute | null;
}

/** One Scarlet Key's obtained-vs-borne tally across the player's TSK plays. */
export interface TskKeyStat {
	/** Plays where the cell obtained this Key (any non-NPC bearer), by difficulty. */
	obtained: ResolutionTally;
	/** Plays where the subject's OWN investigator bore it, by difficulty. */
	borne: ResolutionTally;
	/** Most-recent non-NPC bearer's investigator code (the cell's bearer art); null if none. */
	obtainedBearer: string | null;
	/** Most-recent subject-investigator bearer's code (your bearer art); null if none. */
	borneBearer: string | null;
}

/** One scenario stop on a route, with the level/version tier played (if recorded). */
export interface RouteStep {
	scenarioId: string;
	level?: string;
	version?: string;
	/** Congress of the Keys only — the finale version (roman) derived from the trial's
	 *  judgment (the log), since it isn't a recorded tier. */
	finaleVersion?: string;
}

/** A single campaign's route through TSK. Includes complete runs (won or lost — see
 *  {@link isCompleteRoute}) AND abandoned runs that never reached a finale; consumers
 *  filter by {@link TskRoute.complete}/{@link TskRoute.won} as needed. */
export interface TskRoute {
	campaignId?: string;
	finishDate: number | null;
	length: number;
	steps: RouteStep[];
	/** Whether the campaign was won (recorded a winning outcome). Losing-but-complete routes still count. */
	won: boolean;
	/** Whether the run reached a finale (started at Riddles and Rain, ended at a finale).
	 *  `false` for an abandoned/in-progress run shown in the per-scenario widgets. */
	complete: boolean;
	/** Total "time passed" at campaign end (the `time` counter); null if unrecorded. */
	time: number | null;
	/** Which {@link TSK_ROUTE_ACHIEVEMENTS} this campaign earned (inferred or ticked). */
	achievements: string[];
}

// TSK always opens with Riddles and Rain and can only reach a campaign *outcome*
// (win, or the "cell was hollowed" loss) at one of two finales. A route that
// starts and ends at these is a complete campaign; anything else was abandoned
// mid-run and isn't a real travel path, so it shouldn't be counted.
const ROUTE_START = 'riddles_and_rain';
const ROUTE_FINALES = new Set(['without_a_trace', 'congress_of_the_keys']);

/** A route is complete iff it begins with Riddles and Rain and ends at a finale. */
function isCompleteRoute(steps: RouteStep[]): boolean {
	if (!steps.length) return false;
	return steps[0].scenarioId === ROUTE_START && ROUTE_FINALES.has(steps[steps.length - 1].scenarioId);
}

export function buildTsk(records: CampaignRecord[]): CampaignTsk[] {
	const recs = records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? (log.db.originalId ?? log.db.code) === TSK_FAMILY : false;
	});
	if (!recs.length) return [];

	// The achievement defs the "Successful Routes" widget tags each run with, looked
	// up once (the family is fixed). Evaluated per play below (inferred → from the
	// recorded state; manual-only ones, e.g. Trust Nobody/Everybody → from ticks).
	const baseLog = getCampaignLog(TSK_FAMILY);
	const routeAchDefs = baseLog
		? achievementsFor(baseLog)
				.map((a) => a.def)
				.filter((d) => (TSK_ROUTE_ACHIEVEMENTS as readonly string[]).includes(d.id))
		: [];
	const earnedRouteAchievements = (rec: CampaignRecord): string[] =>
		routeAchDefs
			.filter((def) =>
				def.infer || def.itemInfer
					? evaluateAchievement(def, rec.recorded).earned === true || rec.manual.has(def.id)
					: rec.manual.has(def.id)
			)
			.map((def) => def.id);

	const trustByLog: Record<string, number> = {};
	const deceptionByLog: Record<string, number> = {};
	const foundationTrustTally: Record<string, number> = {};
	const cellDeceptionTally: Record<string, number> = {};
	const bagActCounts: Record<string, number> = {};
	// Chaos-bag overflow: adding a token to an already-full bag (4) grants +1 XP instead — counted
	// per run (attached to that run's TskBagRun.bonusXp below), not aggregated across runs.
	const TSK_BAG_CAP = 4;
	// member (tsk-solver character id) -> resulting vote -> plays that ENDED on that vote at the
	// Congress (the member's default vote included). Per member: their default vote + each transition
	// (resulting vote + the trigger notes that produce it), so a play resolves to exactly one vote.
	const voteRows = coterieVoteRows();
	const voteIndex = new Map<string, { defaultVote: string; transitions: { toVote: string; keys: string[] }[] }>();
	for (const r of voteRows) {
		const e = voteIndex.get(r.member) ?? { defaultVote: r.defaultVote, transitions: [] };
		if (!r.isDefault) e.transitions.push({ toVote: r.toVote, keys: r.triggerNoteKeys });
		voteIndex.set(r.member, e);
	}
	const voteTransitions: Record<string, Record<string, number>> = {};
	// member -> campaigns they fought the final battle alongside you (voted Nay), by difficulty.
	const finaleAllies: Record<string, ResolutionTally> = {};
	// member -> campaigns they stood against you (voted Yea + enemy card), by difficulty.
	const finaleEnemies: Record<string, ResolutionTally> = {};
	// Which members actually take a board slot (have the matching card); excludes card-less voters.
	const allyMemberIds = new Set(coterieAllyMembers().map((a) => a.member));
	const enemyMemberIds = new Set(coterieEnemyMembers().map((a) => a.member));
	// Per-campaign vote highscores (biggest Yea-over-Nay / Nay-over-Yea lead, most Eerily Silent in a
	// single trial) + the route; a tie keeps the most recent play (`date` is the tie-break, dropped).
	type VoteHighAcc = { count: number; route: TskRoute | null; date: number };
	let maxYeaOverNay: VoteHighAcc | null = null;
	let maxNayOverYea: VoteHighAcc | null = null;
	let maxSilent: VoteHighAcc | null = null;
	const considerHigh = (cur: VoteHighAcc | null, count: number, route: TskRoute | null, date: number): VoteHighAcc | null =>
		count <= 0 ? cur : !cur || count > cur.count || (count === cur.count && date >= cur.date) ? { count, route, date } : cur;
	const judgments: Record<string, ResolutionTally> = {};
	let trustActs = 0;
	let deceptionActs = 0;
	let foundationTrustMax: number | null = null;
	let cellDeceptionMax: number | null = null;
	let maxTrustMargin: number | null = null;
	let maxDeceptionMargin: number | null = null;
	// Three extremal runs by final chaos-bag composition. Each keeps its headline `score` (higher
	// wins — Tablet count, Elder Thing count, or NEGATED combined for the "fewest" slot), the run,
	// and its date, so ties break to the higher bonus XP, then to the most recent play.
	let bagMostTablet: { run: TskBagRun; date: number; score: number } | null = null;
	let bagMostElder: { run: TskBagRun; date: number; score: number } | null = null;
	let bagLeastCombined: { run: TskBagRun; date: number; score: number } | null = null;
	// Better candidate for an extremal-run slot: higher `score` wins; ties break to higher bonus XP,
	// then to the more recent play (so its route reads as a "recent route").
	const bagBeats = (
		cand: { run: TskBagRun; date: number; score: number },
		cur: { run: TskBagRun; date: number; score: number } | null
	): boolean =>
		!cur ||
		cand.score > cur.score ||
		(cand.score === cur.score &&
			(cand.run.bonusXp > cur.run.bonusXp ||
				(cand.run.bonusXp === cur.run.bonusXp && cand.date >= cur.date)));
	const routes: TskRoute[] = [];
	// scenario -> variant option id -> resolution -> tally (difficulty-broken-down).
	const scenarioVariantTallies: Record<string, Record<string, Record<string, ResolutionTally>>> = {};
	// scenario -> variant option id -> plays that recorded that tier (authoritative run
	// count, broken down by difficulty for the per-difficulty Runs hover).
	const scenarioVariantPlays: Record<string, Record<string, ResolutionTally>> = {};
	// scenario id -> plays that recorded it in ANY way (xp / resolution / tier), deduped per play
	// and per-difficulty. The authoritative play-count behind the passport badge — always
	// ≥ succeed+failed (unlike the XP-only generic count, which misses resolution-only plays).
	const scenarioPlays: Record<string, ResolutionTally> = {};
	// bare campaign_notes entry id -> plays that recorded it (general per-log count).
	const logCounts: Record<string, number> = {};
	// scenario id -> { succeed, failed } tally (difficulty-broken-down), log-derived.
	const scenarioOutcomes: Record<string, { succeed: ResolutionTally; failed: ResolutionTally }> = {};
	// scenario id -> variant option id -> { succeed, failed } tally (the outcome pinned to the
	// tier it was reached on, so the per-variant table can show Succeed/Failed per row).
	const scenarioVariantOutcomes: Record<
		string,
		Record<string, { succeed: ResolutionTally; failed: ResolutionTally }>
	> = {};
	// Scarlet Key item id -> obtained/borne tally + bearer art; with the finishDate of the
	// most-recent assignment seen (so the bearer art tracks the latest play).
	const keys: Record<string, TskKeyStat> = {};
	const keyObtainedDate: Record<string, number> = {};
	const keyBorneDate: Record<string, number> = {};
	// scenario id -> Key obtained (by difficulty) / determinable plays (see keyObtainedFromScenario).
	const keyObtained: Record<string, { obtained: ResolutionTally; determinable: number }> = {};
	// No-scenario Key quests (Tuwile / Dr. Irawan), fully log-derived.
	const baleEngine = { obtained: { total: 0, byTier: {} as Record<string, number> }, nairobi: 0, bermuda: 0, fled: 0, lost: 0 };
	const ruinousChime = { obtained: { total: 0, byTier: {} as Record<string, number> }, met: 0, newGuinea: 0, vanished: 0 };
	// TSK side quests (optional mini-quest stops), all log-derived.
	const sideQuests = {
		delivery: { delivered: { total: 0, byTier: {} as Record<string, number> }, pickedUp: 0 },
		architecture: { completed: { total: 0, byTier: {} as Record<string, number> }, noticed: 0 },
		quidProQuo: { amaranth: 0, desi: 0 },
		ruses: { wrongLeadsTotal: 0, wrongLeadsMax: 0 },
	};
	// Dead and Gone — the secret-scenario quest funnel (path to Without a Trace), fully log-derived.
	const deadAndGone = {
		whistle: 0,
		refusedWhistle: 0,
		quinnVanished: 0,
		offMission: 0,
		enteredWaT: { total: 0, byTier: {} as Record<string, number> },
		trueNature: { total: 0, byTier: {} as Record<string, number> },
	};
	// Sanguine Shadows' secret boss tally (the Sanguine Watcher).
	const sanguineWatcher = {
		tookDown: { total: 0, byTier: {} } as ResolutionTally,
		tormentContinues: { total: 0, byTier: {} } as ResolutionTally,
	};
	// Sanguine Shadows' "targets kept" rows: target count -> runs (by difficulty) + the
	// most-recent route that kept that many (tracked via finishDate).
	const sanguineTargets: Record<number, { runs: ResolutionTally; route: TskRoute | null }> = {};
	const sanguineTargetsDate: Record<number, number> = {};
	// Shades of Suffering — Tzu San Niang's sway (who swayed whom), by difficulty.
	const shadesTzuYours: ResolutionTally = { total: 0, byTier: {} };
	const shadesTzuHers: ResolutionTally = { total: 0, byTier: {} };
	// Without a Trace outcome notes (by difficulty), pinned to this finale by the absence of a Congress
	// judgment. cell_was_hollowed is shared with Congress; the other three Congress only checks.
	const watKnows: ResolutionTally = { total: 0, byTier: {} };
	const watAliki: ResolutionTally = { total: 0, byTier: {} };
	const watNotSeenAliki: ResolutionTally = { total: 0, byTier: {} };
	const watHollowed: ResolutionTally = { total: 0, byTier: {} };
	// Dead Heat civilians (rescued/slain Extra counters): comparative stats + the best play
	// per player count, ranked two ways (net saved / surplus over twice slain). `rank` is the
	// ranking diff for that table, kept only to compare candidates (stripped from the payload).
	const dhRescued: number[] = [];
	const dhSlain: number[] = [];
	let dhRescuedOverSlain = 0;
	let dhRescuedOverDoubleSlain = 0;
	let dhSlainOverRescued = 0;
	let dhSlainOverDoubleRescued = 0;
	const dhBestNet: Record<number, { rescued: number; slain: number; rank: number }> = {};
	const dhBestDouble: Record<number, { rescued: number; slain: number; rank: number }> = {};

	for (const rec of recs) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const difficulty = rec.recorded.difficulty ?? 'standard';
		const recDate = rec.finishDate ?? 0;

		// Build this run's route (won/lost/abandoned). `won` + `complete` are tagged so
		// widgets filter as needed: the Routes widget wants winning routes only, the
		// per-scenario widgets also show abandoned mid-runs.
		const log = getCampaignLog(rec.campaignCode);
		const won = log ? isCleared(log, rec.recorded) === true : false;
		// Merge in any log-INFERABLE versions (e.g. Dancing Mad's, from the deal-with-Desi vs
		// ambushed note) so the variant table + route badge work without the Extra input —
		// only when not already recorded. The rule lives in tsk-solver.
		const tiers: Record<string, string> = { ...(rec.scenarioTiers ?? {}) };
		for (const scenarioId of rec.route ?? []) {
			const vkey = `${scenarioId}.version`;
			if (!tiers[vkey]) {
				const inferred = scenarioVersionFromLogs(scenarioId, logs);
				if (inferred) tiers[vkey] = inferred;
			}
		}
		// Congress of the Keys' finale version isn't a recorded tier — derive it from the
		// trial's judgment (the campaign log) so the route still shows a version badge.
		const judgment = judgmentFromLogs(logs);
		const congressVersion = judgment ? congressVersionForJudgment(judgment) : null;
		const steps: RouteStep[] = (rec.route ?? []).map((scenarioId) => ({
			scenarioId,
			level: tiers[`${scenarioId}.level`],
			version: tiers[`${scenarioId}.version`],
			finaleVersion:
				scenarioId === 'congress_of_the_keys' && congressVersion ? congressVersion : undefined,
		}));
		// Keep every run that visited at least one scenario — complete (won/lost) AND
		// abandoned. The Routes widget filters to winning routes; the per-scenario
		// widgets show abandoned routes too (a run in progress is still a travel path).
		let thisRoute: TskRoute | null = null;
		if (steps.length) {
			thisRoute = {
				campaignId: rec.campaignId,
				finishDate: rec.finishDate ?? null,
				length: steps.length,
				steps,
				won,
				complete: isCompleteRoute(steps),
				time: rec.recorded.logCounts?.['time'] ?? null,
				achievements: earnedRouteAchievements(rec),
			};
			routes.push(thisRoute);
		}

		// Count this play under every variant (level/version) it recorded a tier for —
		// the authoritative run count, independent of whether the scenario logged a
		// narrative entry (and thus appears in `routes`).
		for (const [tierKey, optionId] of Object.entries(tiers)) {
			const dot = tierKey.lastIndexOf('.'); // key = "<scenario>.<kind>"
			if (dot < 0 || !optionId) continue;
			const scenario = tierKey.slice(0, dot);
			const byVariant = (scenarioVariantPlays[scenario] ??= {});
			const tally = (byVariant[optionId] ??= { total: 0, byTier: {} });
			tally.total += 1;
			tally.byTier[difficulty] = (tally.byTier[difficulty] ?? 0) + 1;
		}

		// Authoritative per-scenario play count: every scenario this play recorded in ANY way —
		// scenario XP, a resolution, or a tier — deduped so a play that recorded several (the usual
		// case) still counts once. A superset of both the XP-only generic count and the
		// resolution-derived outcomes, so the passport's "played" badge never trails Succeed+Failed
		// (e.g. an On Thin Ice play that recorded R4 but earned no XP because the scenario was
		// skipped — "nothing of note in Anchorage" — still counts as a play).
		{
			const encountered = new Set<string>([
				...Object.keys(rec.scenarioXp ?? {}),
				...Object.keys(rec.scenarioResolutions ?? {}),
			]);
			for (const tierKey of Object.keys(tiers)) {
				const dot = tierKey.lastIndexOf('.'); // key = "<scenario>.<kind>"
				if (dot > 0) encountered.add(tierKey.slice(0, dot));
			}
			for (const scenario of encountered) {
				const t = (scenarioPlays[scenario] ??= { total: 0, byTier: {} });
				t.total += 1;
				t.byTier[difficulty] = (t.byTier[difficulty] ?? 0) + 1;
			}
		}

		// Pin each recorded resolution to the variant (level/version) it was reached on,
		// but ONLY when the play recorded that variant — otherwise it stays in the
		// catch-all coverage and isn't attributed to any specific row.
		for (const [scenario, resolution] of Object.entries(rec.scenarioResolutions ?? {})) {
			for (const kind of ['level', 'version'] as const) {
				const optionId = tiers[`${scenario}.${kind}`];
				if (!optionId) continue;
				const byVariant = (scenarioVariantTallies[scenario] ??= {});
				const byRes = (byVariant[optionId] ??= {});
				const t = (byRes[resolution] ??= { total: 0, byTier: {} });
				t.total += 1;
				t.byTier[difficulty] = (t.byTier[difficulty] ?? 0) + 1;
			}
		}

		// General per-log count: every recorded campaign note, by bare id, across plays.
		for (const key of logs) {
			if (key.startsWith(P)) {
				const id = key.slice(P.length);
				logCounts[id] = (logCounts[id] ?? 0) + 1;
			}
		}

		// Succeed/Failed per scenario, by difficulty — STRICTLY from the recorded resolution (Extra
		// tab). Neutral resolutions (Dead Heat R5) and plays with no resolution count toward neither.
		for (const [scenarioId, resolution] of Object.entries(rec.scenarioResolutions ?? {})) {
			const result = scenarioResultFromResolution(scenarioId, resolution);
			if (result !== 'success' && result !== 'failure') continue;
			const o = (scenarioOutcomes[scenarioId] ??= {
				succeed: { total: 0, byTier: {} },
				failed: { total: 0, byTier: {} },
			});
			const t = result === 'success' ? o.succeed : o.failed;
			t.total += 1;
			t.byTier[difficulty] = (t.byTier[difficulty] ?? 0) + 1;
			// Pin the outcome to each recorded variant (level/version) — so the per-variant table can
			// show Succeed/Failed per tier row (they sum to that row's runs).
			for (const kind of ['level', 'version'] as const) {
				const optionId = tiers[`${scenarioId}.${kind}`];
				if (!optionId) continue;
				const byVariant = (scenarioVariantOutcomes[scenarioId] ??= {});
				const vo = (byVariant[optionId] ??= {
					succeed: { total: 0, byTier: {} },
					failed: { total: 0, byTier: {} },
				});
				const vt = result === 'success' ? vo.succeed : vo.failed;
				vt.total += 1;
				vt.byTier[difficulty] = (vt.byTier[difficulty] ?? 0) + 1;
			}
		}

		// Sanguine Shadows aggregation tallies (the secret boss + "targets kept" rows) — life-side
		// counts over the log, not Succeed/Failed rules.
		{
			// Secret boss — the Sanguine Watcher.
			if (logs.has(`${P}have_not_seen_the_last_of_the_sanguine_watcher`)) {
				sanguineWatcher.tookDown.total += 1;
				sanguineWatcher.tookDown.byTier[difficulty] =
					(sanguineWatcher.tookDown.byTier[difficulty] ?? 0) + 1;
			}
			if (logs.has(`${P}sanguine_watchers_torment_continues`)) {
				sanguineWatcher.tormentContinues.total += 1;
				sanguineWatcher.tormentContinues.byTier[difficulty] =
					(sanguineWatcher.tormentContinues.byTier[difficulty] ?? 0) + 1;
			}
			// Sanguine Shadows' "targets kept" rows: tally runs per target count (by difficulty)
			// and keep the most-recent route that kept that many. The count is the recorded
			// `targets` Extra choice — EXCEPT a run that recruited La Chica Roja
			// (`chica_roja_is_on_your_side`) is inferred as all 6: the secret-boss path is only
			// reachable by keeping every target, and once on it the player stops counting targets,
			// so the box is typically left blank. An explicit `targets` input still works for a
			// 6-target run that chose NOT to face the boss (so it recorded no Chica log).
			const targetsRaw = rec.scenarioChoices?.['sanguine_shadows.targets'];
			const inputCount = targetsRaw !== undefined && targetsRaw !== '' ? Number(targetsRaw) : NaN;
			const targetCount = logs.has(`${P}chica_roja_is_on_your_side`) ? 6 : inputCount;
			if (Number.isInteger(targetCount)) {
				const e = (sanguineTargets[targetCount] ??= { runs: { total: 0, byTier: {} }, route: null });
				e.runs.total += 1;
				e.runs.byTier[difficulty] = (e.runs.byTier[difficulty] ?? 0) + 1;
				if (recDate >= (sanguineTargetsDate[targetCount] ?? -Infinity)) {
					sanguineTargetsDate[targetCount] = recDate;
					e.route = thisRoute;
				}
			}
		}

		// Shades of Suffering — Tzu San Niang's sway, each by difficulty (life-side log counts).
		if (logs.has(`${P}tzu_san_niang_is_under_your_sway`)) {
			shadesTzuYours.total += 1;
			shadesTzuYours.byTier[difficulty] = (shadesTzuYours.byTier[difficulty] ?? 0) + 1;
		}
		if (logs.has(`${P}tzu_san_niang_has_you_under_her_sway`)) {
			shadesTzuHers.total += 1;
			shadesTzuHers.byTier[difficulty] = (shadesTzuHers.byTier[difficulty] ?? 0) + 1;
		}

		// Without a Trace's outcome notes. It's a SECRET SCENARIO played before the Congress (not a
		// replacement finale), so surviving it and then reaching the Congress is the normal case. The
		// true-nature / Aliki notes are RECORDED only by Without a Trace (the Congress merely CHECKS
		// them), so count them straight from the log regardless of whether the Congress was reached.
		const bumpWat = (t: ResolutionTally) => {
			t.total += 1;
			t.byTier[difficulty] = (t.byTier[difficulty] ?? 0) + 1;
		};
		if (logs.has(`${P}cell_knows_the_true_nature_of_the_coterie`)) bumpWat(watKnows);
		if (logs.has(`${P}aliki_is_on_your_side`)) bumpWat(watAliki);
		if (logs.has(`${P}have_not_seen_the_last_of_aliki_zoni_uperetria`)) bumpWat(watNotSeenAliki);
		// `cell_was_hollowed` is recorded at BOTH Without a Trace and the Congress. Attribute it to
		// Without a Trace only when no Congress judgment was reached — a WaT hollowing ends the run
		// before the Congress, whereas a Congress hollowing rides alongside a vote outcome.
		if (judgment === null && logs.has(`${P}cell_was_hollowed`)) bumpWat(watHollowed);

		// Dead Heat civilians — the rescued/slain Extra counters. Comparative stats need
		// both; the per-player-count best tables also need a known player count.
		{
			const rescuedRaw = rec.scenarioChoices?.['dead_heat.rescued_civilians'];
			const slainRaw = rec.scenarioChoices?.['dead_heat.slain_civilians'];
			const rescued =
				rescuedRaw && Number.isFinite(Number(rescuedRaw)) ? Number(rescuedRaw) : null;
			const slain = slainRaw && Number.isFinite(Number(slainRaw)) ? Number(slainRaw) : null;
			if (rescued !== null) dhRescued.push(rescued);
			if (slain !== null) dhSlain.push(slain);
			if (rescued !== null && slain !== null) {
				if (rescued > slain) dhRescuedOverSlain += 1;
				if (rescued > 2 * slain) dhRescuedOverDoubleSlain += 1;
				if (slain > rescued) dhSlainOverRescued += 1;
				if (slain > 2 * rescued) dhSlainOverDoubleRescued += 1;
				const pc = rec.playerCount;
				if (pc != null && pc > 0) {
					// Higher ranking diff wins each player-count row; tie-break on more rescued.
					const consider = (
						best: Record<number, { rescued: number; slain: number; rank: number }>,
						rank: number
					) => {
						const cur = best[pc];
						if (!cur || rank > cur.rank || (rank === cur.rank && rescued > cur.rescued))
							best[pc] = { rescued, slain, rank };
					};
					consider(dhBestNet, rescued - slain);
					consider(dhBestDouble, rescued - 2 * slain);
				}
			}
		}

		// Scarlet Keys: per key, count this play's OBTAINED (any of the cell's bearers)
		// and BORNE (a bearer that is one of the subject's own investigators), and keep
		// the latest play's bearer code on each side for the corner art.
		const subjectInv = new Set(rec.subjectInvestigators ?? []);
		for (const [keyId, bearerCodes] of Object.entries(rec.scarletKeyBearers ?? {})) {
			const k = (keys[keyId] ??= {
				obtained: { total: 0, byTier: {} },
				borne: { total: 0, byTier: {} },
				obtainedBearer: null,
				borneBearer: null,
			});
			k.obtained.total += 1;
			k.obtained.byTier[difficulty] = (k.obtained.byTier[difficulty] ?? 0) + 1;
			if (recDate >= (keyObtainedDate[keyId] ?? -Infinity)) {
				keyObtainedDate[keyId] = recDate;
				k.obtainedBearer = bearerCodes[bearerCodes.length - 1] ?? null;
			}
			const mine = bearerCodes.find((c) => subjectInv.has(c));
			if (mine) {
				k.borne.total += 1;
				k.borne.byTier[difficulty] = (k.borne.byTier[difficulty] ?? 0) + 1;
				if (recDate >= (keyBorneDate[keyId] ?? -Infinity)) {
					keyBorneDate[keyId] = recDate;
					k.borneBearer = mine;
				}
			}
		}

		// Epilogue tally (Foundation Trust / Cell Deception) — recorded, or crossed-off for delivering intel.
		// The per-play TOTAL each side is the count of its present entries (this IS the epilogue tally).
		// The per-entry BREAKDOWN counts every play (even losing/abandoned). The HIGH-SCORE numbers, however,
		// only count plays that actually reached the epilogue — so they line up with the permanent-position /
		// dismantled totals below (the tally is only meaningful once the run was judged).
		const crossed = rec.recorded.crossedLogs;
		const present = (e: TallyEntry) => (e.crossoff ? (crossed?.has(`${P}${e.id}`) ?? false) : logs.has(`${P}${e.id}`));
		const reachedEpilogue = logs.has(`${P}cell_was_given_a_permanent_position`) || logs.has(`${P}cell_was_dismantled`);
		let ftCount = 0;
		for (const e of TSK_FOUNDATION_TRUST) {
			if (present(e)) {
				foundationTrustTally[e.id] = (foundationTrustTally[e.id] ?? 0) + 1;
				ftCount += 1;
			}
		}
		let cdCount = 0;
		for (const e of TSK_CELL_DECEPTION) {
			if (present(e)) {
				cellDeceptionTally[e.id] = (cellDeceptionTally[e.id] ?? 0) + 1;
				cdCount += 1;
			}
		}
		// High-scores: only plays that reached the epilogue (so they add up with permanent / dismantled).
		if (reachedEpilogue) {
			foundationTrustMax = Math.max(foundationTrustMax ?? 0, ftCount);
			cellDeceptionMax = Math.max(cellDeceptionMax ?? 0, cdCount);
			maxTrustMargin = Math.max(maxTrustMargin ?? -Infinity, ftCount - cdCount);
			maxDeceptionMargin = Math.max(maxDeceptionMargin ?? -Infinity, cdCount - ftCount);
		}
		// Chaos-bag acts — an act counts if any of its detectors matches (log / crossed-off / Extra input).
		const playActs: BagAct[] = [];
		for (const act of TSK_BAG_ACTS) {
			if (bagActDetected(act, logs, crossed, rec.scenarioChoices)) {
				bagActCounts[act.id] = (bagActCounts[act.id] ?? 0) + 1;
				playActs.push(act);
			}
		}
		// Replay this run's swaps in chronological order to count bonus XP from adding to a full bag (4).
		// Order by the scenario each act happened at: the fixed opening first (Riddles and Rain → The
		// Foundation), then the play's route. A Trust act overflows the Tablet side, Deception the Elder Thing.
		const actOrder = (scenario: string): number =>
			scenario === 'riddles_and_rain' ? -2 : scenario === 'the_foundation' ? -1 : ((i) => (i >= 0 ? i : Number.MAX_SAFE_INTEGER))((rec.route ?? []).indexOf(scenario));
		playActs.sort((a, b) => actOrder(a.scenario) - actOrder(b.scenario));
		let tablet = 1;
		let elder = 1;
		let runTabletXp = 0;
		let runElderXp = 0;
		for (const act of playActs) {
			if (act.kind === 'trust') {
				elder = Math.max(0, elder - 1);
				if (tablet >= TSK_BAG_CAP) runTabletXp += 1;
				else tablet += 1;
			} else {
				tablet = Math.max(0, tablet - 1);
				if (elder >= TSK_BAG_CAP) runElderXp += 1;
				else elder += 1;
			}
		}

		for (const key of Object.keys(TSK_TRUST_LOGS)) {
			if (logs.has(key)) {
				trustActs += 1;
				trustByLog[key] = (trustByLog[key] ?? 0) + 1;
			}
		}
		for (const key of Object.keys(TSK_DECEPTION_LOGS)) {
			if (logs.has(key)) {
				deceptionActs += 1;
				deceptionByLog[key] = (deceptionByLog[key] ?? 0) + 1;
			}
		}
		// The Coterie vote only happens at the Congress, so the vote tally counts plays that REACHED
		// the finale (a judgment was recorded). Each member resolves to exactly one vote — the first
		// transition whose trigger notes are recorded, else their default vote — so a "kept default"
		// row counts too. Desi needs the Congress real/impostor Extra (you flip the stored copy of his
		// card at the Trial — story-asset side = real, encounter back = impostor); Razin votes only if reunited.
		if (judgment) {
			const tally = { yea: 0, nay: 0, silent: 0 };
			const bump = (m: Record<string, ResolutionTally>, member: string) => {
				const t = (m[member] ??= { total: 0, byTier: {} });
				t.total += 1;
				t.byTier[difficulty] = (t.byTier[difficulty] ?? 0) + 1;
			};
			const inc = (member: string, vote: string) => {
				const byVote = (voteTransitions[member] ??= {});
				byVote[vote] = (byVote[vote] ?? 0) + 1;
				if (vote === 'yea') {
					tally.yea += 1;
					// A Yea voter is set aside as an enemy — but only if they have an enemy card.
					if (enemyMemberIds.has(member)) bump(finaleEnemies, member);
				} else if (vote === 'nay') {
					tally.nay += 1;
					// A Nay voter joins as a Conspirator — but only if they have a Conspirator asset (not Tuwile).
					if (allyMemberIds.has(member)) bump(finaleAllies, member);
				} else if (vote === 'silent') tally.silent += 1;
				// Abstain counts toward neither margin — it "matters" by lowering both Yea−Nay and Nay−Yea.
			};
			// The real/impostor flip is recorded on the Congress Extra (where the game officially
			// instructs the look). Fall back to the legacy `dancing_mad.desi_identity` key so identity
			// recorded before the input moved tabs still resolves Desi's vote (it's a manual Extra — not
			// re-derivable from the log — so the old value must not be orphaned).
			const desiId =
				rec.recorded.scenarioChoiceValues?.['congress_of_the_keys.desi_identity'] ??
				rec.recorded.scenarioChoiceValues?.['dancing_mad.desi_identity'];
			for (const [member, info] of voteIndex) {
				if (member === 'desi') {
					// Nay = in your debt AND the real Desi survived; eerily silent = never seen again OR you
					// saved the impostor; in-your-debt without the Extra is indeterminate (don't guess).
					const inDebt = logs.has(`${P}desi_is_in_your_debt`);
					const notSeen = logs.has(`${P}have_not_seen_the_last_of_desi`);
					let v: string | undefined;
					if (notSeen || desiId === 'impostor') v = 'silent';
					else if (inDebt) v = desiId === 'real' ? 'nay' : undefined;
					else v = 'yea';
					if (v) inc('desi', v);
					continue;
				}
				let resolved = info.defaultVote;
				for (const tr of info.transitions) {
					if (tr.keys.some((k) => logs.has(k))) {
						resolved = tr.toVote;
						break;
					}
				}
				// 'absent' default (Razin Farhi) — only counts when a transition fired (he otherwise doesn't vote).
				if (resolved !== 'absent') inc(member, resolved);
			}
			// Highscore leads (Yea−Nay, Nay−Yea) — considerHigh ignores ≤ 0, so only a real lead counts.
			// The Red-Gloved Man is always set aside as an enemy (he's eerily silent, never voting Yea).
				if (enemyMemberIds.has('redGlovedMan')) bump(finaleEnemies, 'redGlovedMan');
				maxYeaOverNay = considerHigh(maxYeaOverNay, tally.yea - tally.nay, thisRoute, recDate);
			maxNayOverYea = considerHigh(maxNayOverYea, tally.nay - tally.yea, thisRoute, recDate);
			maxSilent = considerHigh(maxSilent, tally.silent, thisRoute, recDate);
		}
		if (judgment) {
			const jt = (judgments[judgment] ??= { total: 0, byTier: {} });
			jt.total += 1;
			jt.byTier[difficulty] = (jt.byTier[difficulty] ?? 0) + 1;
		}
		// Per-scenario Key obtained, from the recorded resolution (+ logs). Only counts when a
		// resolution was recorded for that scenario (the evaluator returns null otherwise), so a
		// player who skipped the Extra tab simply contributes nothing here.
		for (const { scenarioId } of TSK_KEY_SCENARIOS) {
			const got = keyObtainedFromScenario(scenarioId, rec.scenarioResolutions?.[scenarioId], logs);
			if (got === null) continue;
			const k = (keyObtained[scenarioId] ??= { obtained: { total: 0, byTier: {} }, determinable: 0 });
			k.determinable += 1;
			if (got) {
				k.obtained.total += 1;
				k.obtained.byTier[difficulty] = (k.obtained.byTier[difficulty] ?? 0) + 1;
			}
		}
		// No-scenario Key quests (fully log-derived; no resolution needed).
		const bale = baleEngineQuestFromLogs(logs);
		if (bale.obtained) {
			baleEngine.obtained.total += 1;
			baleEngine.obtained.byTier[difficulty] = (baleEngine.obtained.byTier[difficulty] ?? 0) + 1;
		}
		if (bale.wonAt === 'nairobi') baleEngine.nairobi += 1;
		if (bale.wonAt === 'bermuda') baleEngine.bermuda += 1;
		if (bale.fled) baleEngine.fled += 1;
		if (bale.lost) baleEngine.lost += 1;
		const chime = ruinousChimeQuestFromLogs(logs);
		if (chime.obtained) {
			ruinousChime.obtained.total += 1;
			ruinousChime.obtained.byTier[difficulty] = (ruinousChime.obtained.byTier[difficulty] ?? 0) + 1;
		}
		if (chime.met) ruinousChime.met += 1;
		if (chime.newGuinea) ruinousChime.newGuinea += 1;
		if (chime.vanished) ruinousChime.vanished += 1;
		// Side quests (optional stops), all log-derived (presence + crossed-off status + a count).
		const sq = sideQuestsFromLogs(logs, rec.recorded.crossedLogs);
		if (sq.deliveryPickedUp) sideQuests.delivery.pickedUp += 1;
		if (sq.deliveryDelivered) {
			sideQuests.delivery.delivered.total += 1;
			sideQuests.delivery.delivered.byTier[difficulty] = (sideQuests.delivery.delivered.byTier[difficulty] ?? 0) + 1;
		}
		if (sq.architectureNoticed) sideQuests.architecture.noticed += 1;
		if (sq.architectureCompleted) {
			sideQuests.architecture.completed.total += 1;
			sideQuests.architecture.completed.byTier[difficulty] = (sideQuests.architecture.completed.byTier[difficulty] ?? 0) + 1;
		}
		if (sq.amaranthIntel) sideQuests.quidProQuo.amaranth += 1;
		if (sq.desiIntel) sideQuests.quidProQuo.desi += 1;
		const wrongLeads = rec.recorded.logCounts?.['wrong_leads'] ?? 0;
		sideQuests.ruses.wrongLeadsTotal += wrongLeads;
		sideQuests.ruses.wrongLeadsMax = Math.max(sideQuests.ruses.wrongLeadsMax, wrongLeads);
		// Dead and Gone — the secret-scenario quest funnel (fully log-derived).
		const dag = deadAndGoneFromLogs(logs);
		if (dag.whistle) deadAndGone.whistle += 1;
		if (dag.refusedWhistle) deadAndGone.refusedWhistle += 1;
		if (dag.quinnVanished) deadAndGone.quinnVanished += 1;
		if (dag.offMission) deadAndGone.offMission += 1;
		if (dag.enteredWaT) {
			deadAndGone.enteredWaT.total += 1;
			deadAndGone.enteredWaT.byTier[difficulty] = (deadAndGone.enteredWaT.byTier[difficulty] ?? 0) + 1;
		}
		if (dag.trueNature) {
			deadAndGone.trueNature.total += 1;
			deadAndGone.trueNature.byTier[difficulty] = (deadAndGone.trueNature.byTier[difficulty] ?? 0) + 1;
		}
		const bag = rec.recorded.finalChaosBag;
		if (bag && (bag['tablet'] !== undefined || bag['elder_thing'] !== undefined)) {
			const t = bag['tablet'] ?? 0;
			const e = bag['elder_thing'] ?? 0;
			// bonusXp = this run's overflow from the swap replay above (Tablet + Elder Thing combined).
			const run: TskBagRun = { tablet: t, elderThing: e, bonusXp: runTabletXp + runElderXp, route: thisRoute };
			// Most Tablet / Most Elder Thing / fewest combined — ties break to higher bonus XP, then recency.
			const candTablet = { run, date: recDate, score: t };
			if (bagBeats(candTablet, bagMostTablet)) bagMostTablet = candTablet;
			const candElder = { run, date: recDate, score: e };
			if (bagBeats(candElder, bagMostElder)) bagMostElder = candElder;
			const candLeast = { run, date: recDate, score: -(t + e) };
			if (bagBeats(candLeast, bagLeastCombined)) bagLeastCombined = candLeast;
		}
	}

	// Headline aggregates derived from the tallies above (serialized so consumers
	// read them directly — see compiled-profile.ts).
	const mergeTally = (a: ResolutionTally, b: ResolutionTally): ResolutionTally => {
		const byTier: Record<string, number> = { ...a.byTier };
		for (const [tier, n] of Object.entries(b.byTier)) byTier[tier] = (byTier[tier] ?? 0) + n;
		return { total: a.total + b.total, byTier };
	};
	const actsTotal = trustActs + deceptionActs;
	const wonTimes = routes.filter((r) => r.won && r.time !== null).map((r) => r.time as number);
	// Drop the internal ranking `rank` from each best-play entry for the payload.
	const stripRank = (
		m: Record<number, { rescued: number; slain: number; rank: number }>
	): Record<number, DeadHeatCivilianRun> => {
		const out: Record<number, DeadHeatCivilianRun> = {};
		for (const [pc, v] of Object.entries(m)) out[Number(pc)] = { rescued: v.rescued, slain: v.slain };
		return out;
	};

	// Erased From Existence — unique cards exiled in Dancing Mad / On Thin Ice (campaign-log card
	// facts shared across the cell). Dedupe by card code, keeping the most recent campaign it
	// happened in; newest first, capped at 5.
	const erasedDate: Record<string, number | null> = {};
	for (const rec of recs) {
		for (const code of rec.erasedCards ?? []) {
			if (!(code in erasedDate) || (rec.finishDate ?? 0) >= (erasedDate[code] ?? 0))
				erasedDate[code] = rec.finishDate ?? null;
		}
	}
	const erasedFromExistence: TskErasedCard[] = Object.entries(erasedDate)
		.map(([code, finishDate]) => ({ code, finishDate }))
		.sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0))
		.slice(0, 10);

	return [
		{
			family: TSK_FAMILY,
			plays: recs.length,
			trustActs,
			deceptionActs,
			trustByLog,
			deceptionByLog,
			foundationTrustTally,
			cellDeceptionTally,
			bagActCounts,
			foundationTrustMax,
			cellDeceptionMax,
			maxTrustMargin,
			maxDeceptionMargin,
			voteTransitions,
			finaleAllies,
			finaleEnemies,
			voteHighs: {
				yeaOverNay: maxYeaOverNay ? { count: maxYeaOverNay.count, route: maxYeaOverNay.route } : null,
				nayOverYea: maxNayOverYea ? { count: maxNayOverYea.count, route: maxNayOverYea.route } : null,
				silent: maxSilent ? { count: maxSilent.count, route: maxSilent.route } : null,
			},
			judgments,
			mostTabletRun: bagMostTablet?.run ?? null,
			mostElderThingRun: bagMostElder?.run ?? null,
			leastCombinedRun: bagLeastCombined?.run ?? null,
			routes,
			scenarioVariantTallies,
			scenarioVariantPlays,
			scenarioPlays,
			logCounts,
			scenarioOutcomes,
			scenarioVariantOutcomes,
			keys,
			keyObtained,
			baleEngine,
			ruinousChime,
			sideQuests,
			deadAndGone,
			sanguineWatcher: {
				...sanguineWatcher,
				confronted: mergeTally(sanguineWatcher.tookDown, sanguineWatcher.tormentContinues),
			},
			sanguineTargets,
			shadesOfSuffering: {
				tzuUnderYourSway: shadesTzuYours,
				tzuHasYouUnderHerSway: shadesTzuHers,
			},
			withoutATrace: {
				knowsTrueNature: watKnows,
				alikiOnYourSide: watAliki,
				notSeenAliki: watNotSeenAliki,
				cellHollowed: watHollowed,
			},
			actsTotal,
			trustPct: actsTotal > 0 ? Math.round((trustActs / actsTotal) * 100) : 0,
			fastestWinTime: wonTimes.length ? Math.min(...wonTimes) : null,
			slowestWinTime: wonTimes.length ? Math.max(...wonTimes) : null,
			distinctKeysObtained: Object.values(keys).filter((k) => k.obtained.total > 0).length,
			distinctKeysBorne: Object.values(keys).filter((k) => k.borne.total > 0).length,
			deadHeat: {
				rescuedOverSlain: dhRescuedOverSlain,
				rescuedOverDoubleSlain: dhRescuedOverDoubleSlain,
				slainOverRescued: dhSlainOverRescued,
				slainOverDoubleRescued: dhSlainOverDoubleRescued,
				mostRescued: dhRescued.length ? Math.max(...dhRescued) : null,
				leastSlain: dhSlain.length ? Math.min(...dhSlain) : null,
				loversReunited: logCounts['lovers_are_reunited'] ?? 0,
				bestByNet: stripRank(dhBestNet),
				bestByDouble: stripRank(dhBestDouble),
			},
			erasedFromExistence,
		},
	];
}
