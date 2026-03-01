/**
 * tsk-solver.ts — bridge from the `life` app to the researched TSK campaign data
 * in `@5argon/arkham-tsk-solver`. The solver catalogues, per scenario, the
 * "levels" (time-scaling tiers — e.g. On Thin Ice's "+1 doom per 5 time passed")
 * and "versions" (scenario variants — e.g. Dogs of War I/II/III) that the final
 * campaign log can't reveal. We surface these as pickers in the Extra tab so a
 * play records which tier/version it was, enriching what widgets can compute.
 *
 * The solver keys scenarios by FileCode (`33-K`); `life` keys them by kohaku
 * Scenario id. We join through the scenario's display name (the solver's file
 * title equals campaign-data's scenarioName for every playable TSK scenario).
 */
import {
	catalog,
	characterName,
	coterieVoteGuide,
	getEnFile,
	getFile,
	keyName,
	locationName,
	logText,
	resolutionGating,
	type CoterieMemberVotes,
	type Vote,
} from '@5argon/arkham-tsk-solver';
import { CardType, EncounterSet, getScenarioData, Scenario } from '@5argon/arkham-kohaku';
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { getAllCards } from '$lib/card-data';

/** One selectable tier/version option, resolved with its label. */
export interface TierOption {
	id: string;
	label: string;
}

export interface ScenarioTiers {
	levels: TierOption[];
	versions: TierOption[];
}

const EMPTY: ScenarioTiers = { levels: [], versions: [] };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// The solver loads a sizable JSON; build the catalogue (and the name→FileCode
// index) once, lazily, on first use.
let _cat: ReturnType<typeof catalog> | null = null;
let _fileByName: Map<string, string> | null = null;

function cat() {
	return (_cat ??= catalog());
}

function fileCodeForName(scenarioName: string): string | undefined {
	if (!_fileByName) {
		_fileByName = new Map();
		for (const f of cat().files ?? []) _fileByName.set(norm(f.label), f.id);
	}
	return _fileByName.get(norm(scenarioName));
}

/** The levels/versions the solver knows for a scenario, looked up by its display name. */
export function scenarioTiersByName(scenarioName: string): ScenarioTiers {
	const code = fileCodeForName(scenarioName);
	if (!code) return EMPTY;
	const c = cat();
	return {
		levels: (c.levels[code] ?? []).map((o) => ({ id: o.id, label: o.label })),
		versions: (c.versions[code] ?? []).map((o) => ({ id: o.id, label: o.label })),
	};
}

/** Resolve a recorded option id back to its label (read-only display). */
export function tierOptionLabel(scenarioName: string, optionId: string): string {
	const { levels, versions } = scenarioTiersByName(scenarioName);
	return [...levels, ...versions].find((o) => o.id === optionId)?.label ?? optionId;
}

// ─── Congress of the Keys judgments (the "meeting routes") ───────────────────

export interface CongressJudgment {
	id: string;
	/** Full label, e.g. "Deemed a liability → finale v.I". */
	label: string;
	/** Finale version this judgment leads to ('I' | 'II' | 'III'). */
	version: string;
}

// 6 judgments collapse onto 3 finale versions (tsk-solver's internal JUDGMENT_TO_VERSION).
const JUDGMENT_VERSION: Record<string, string> = {
	'COTK.judgment.liability': 'I',
	'COTK.judgment.asset': 'II',
	'COTK.judgment.overthrow': 'II',
	'COTK.judgment.join': 'II',
	'COTK.judgment.spared': 'III',
	'COTK.judgment.destroyed': 'III',
};

/** The Congress meeting routes (6 judgment outcomes), with their finale version. */
export function congressJudgments(): CongressJudgment[] {
	return cat().judgments.map((j) => ({
		id: j.id,
		label: j.label,
		version: JUDGMENT_VERSION[j.id] ?? '',
	}));
}

// ─── Coterie member vote transitions (the "Red Coterie" widget) ──────────────
//
// The finale `voteTable` (single-sourced in tsk-solver) gives every member's DEFAULT vote and each
// way the campaign can change it, keyed by tsk-solver log ids (`log.dealWithThorne`). arkham.life
// records the same facts under campaign-data note ids (`campaign_notes.cell_made_a_deal_with_thorne`),
// so we translate each trigger log to its note key here — the one piece of glue the widget needs.
// A transition's resulting vote (Desi → Nay) is credited to a play when ANY of its trigger notes is
// recorded, exactly how the old "member on your side" tally read its single favourable log.

const NOTE_PREFIX = 'campaign_notes.';

/** tsk-solver vote-trigger log id → campaign-data note id (verified against tskc / fof data). */
const VOTE_TRIGGER_NOTE: Record<string, string> = {
	'log.aidedKnight': 'cell_aided_the_knight',
	'log.failedBeast': 'cell_failed_to_fend_off_the_beast',
	'log.notSeenClaretKnight': 'have_not_seen_the_last_of_the_claret_knight',
	'log.dogsAtWar': 'dogs_are_at_war',
	'log.eceTrusts': 'ece_trusts_the_cell',
	'log.eceDistrusts': 'ece_does_not_trust_the_cell',
	'log.loversReunited': 'lovers_are_reunited',
	'log.notSeenAmaranth': 'have_not_seen_the_last_of_amaranth',
	'log.amaranthLeftCoterie': 'amaranth_has_left_the_coterie',
	'log.dealWithThorne': 'cell_made_a_deal_with_thorne',
	'log.notSeenThorne': 'have_not_seen_the_last_of_thorne',
	'log.thorneDisappeared': 'thorne_disappeared',
	'log.alikiOnYourSide': 'aliki_is_on_your_side',
	'log.notSeenAliki': 'have_not_seen_the_last_of_aliki_zoni_uperetria',
	'log.desiInDebt': 'desi_is_in_your_debt',
	'log.notSeenDesi': 'have_not_seen_the_last_of_desi',
	'log.notSeenSanguineWatcher': 'have_not_seen_the_last_of_the_sanguine_watcher',
	'log.watcherTormentContinues': 'sanguine_watchers_torment_continues',
	'log.notSeenLaChicaRoja': 'have_not_seen_the_last_of_la_chica_roja',
	'log.tzuUnderYourSway': 'tzu_san_niang_is_under_your_sway',
	'log.tuwileOnYourSide': 'tuwile_masai_is_on_your_side',
	'log.meddledAbarran': 'cell_meddled_in_abarrans_affairs',
};

/** tsk-solver character id → a representative card code (for CardStrip art). Most use their finale
 *  `red_coterie` card; Tuwile Masai has no card of his own, so he borrows The Bale Engine (the Great
 *  Work device he commands). */
const MEMBER_CARD: Record<string, string> = {
	redGlovedMan: '09752',
	laChicaRoja: '09753',
	sanguineWatcher: '09754',
	beast: '09755',
	claretKnight: '09756',
	thorne: '09757',
	desi: '09758',
	amaranth: '09759',
	tzuSanNiang: '09760',
	aliki: '09761',
	ece: '09584',
	razinFarhi: '09538',
	abarran: '88034a',
	tuwileMasai: '09769a',
};

export interface CoterieVoteRow {
	/** tsk-solver character id (stable key for the count tally). */
	member: string;
	memberName: string;
	/** Card code for the member's art (CardStrip), when one exists. */
	cardCode?: string;
	/** The baseline vote: `'yea' | 'nay' | 'abstain' | 'silent'`, or `'absent'` (only votes under a condition). */
	defaultVote: Vote | 'absent';
	/** The vote the member moves to when this transition fires. */
	toVote: Vote;
	/** Full `campaign_notes.<id>` keys that produce this vote (any one credits the play). Empty for the default row. */
	triggerNoteKeys: string[];
	/** Human label for the trigger(s), first letter capitalized, e.g. "The cell made a deal with Thorne". Empty for the default row. */
	triggerLabel: string;
	/** True for the synthetic "kept their default vote" row (no trigger; the member wasn't swayed). */
	isDefault?: boolean;
}

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Every Coterie member vote TRANSITION as flat rows for the widget — each carrying the campaign-data
 * note keys that trigger it (for counting) and a human trigger label. Derived from
 * {@link coterieVoteGuide}; members in book/vote-table order, transitions in the data's order.
 * Transitions whose triggers leave no recordable log (none in the base campaign) are dropped.
 */
let _voteRows: CoterieVoteRow[] | null = null;
export function coterieVoteRows(): CoterieVoteRow[] {
	if (_voteRows) return _voteRows;
	const out: CoterieVoteRow[] = [];
	for (const mem of coterieVoteGuide()) {
		const base = { member: mem.member, memberName: characterName(mem.member), cardCode: MEMBER_CARD[mem.member], defaultVote: mem.defaultVote };
		// The "kept their default vote" row — every member with a real default vote (Razin Farhi only
		// votes when the lovers reunite, so he has no default row).
		if (mem.defaultVote !== 'absent') {
			out.push({ ...base, toVote: mem.defaultVote, triggerNoteKeys: [], triggerLabel: '', isDefault: true });
		}
		for (const t of mem.transitions) {
			const noteIds = t.triggerLogs.map((l) => VOTE_TRIGGER_NOTE[l]).filter((n): n is string => !!n);
			if (!noteIds.length) continue; // no log-recordable trigger → can't be deduced from the log
			out.push({
				...base,
				toVote: t.toVote,
				triggerNoteKeys: noteIds.map((n) => NOTE_PREFIX + n),
				triggerLabel: capitalize(t.triggerLogs.map((l) => logText(l)).join(' / ')),
			});
		}
	}
	_voteRows = out;
	return out;
}

export interface CoterieBoardMember {
	/** tsk-solver character id (matches `finaleAllies` / `finaleEnemies` keys). */
	member: string;
	memberName: string;
	cardCode?: string;
}

// The finale board isn't symmetric with the votes (per the Congress setup rules):
//  • A Nay voter joins as a Conspirator ONLY if they have a Conspirator story asset — Tuwile Masai can
//    vote Nay but has none, so he never appears as an ally.
//  • A Yea voter is set aside as an enemy ONLY if they have an enemy card — Tuwile Masai, Abarran, and
//    Razin Farhi can vote Yea but have no enemy card. The Red-Gloved Man is ALWAYS set aside as an enemy.
const ALLY_NO_CARD = new Set(['tuwileMasai']);
const ENEMY_NO_CARD = new Set(['tuwileMasai', 'abarran', 'razinFarhi']);
/** Always an enemy in the finale regardless of vote (he's eerily silent). */
const ALWAYS_ENEMY = ['redGlovedMan'];

const canVote = (m: CoterieMemberVotes, vote: Vote) => m.defaultVote === vote || m.transitions.some((t) => t.toVote === vote);

/**
 * The Coterie members who can fight the final battle **alongside you** — they can vote Nay AND have a
 * Conspirator story asset (so Tuwile Masai, who has none, is excluded). In vote-table order. The
 * Congress widget lights up how often each actually joined you (`finaleAllies`).
 */
let _allyMembers: CoterieBoardMember[] | null = null;
export function coterieAllyMembers(): CoterieBoardMember[] {
	if (_allyMembers) return _allyMembers;
	_allyMembers = coterieVoteGuide()
		.filter((m) => canVote(m, 'nay') && !ALLY_NO_CARD.has(m.member))
		.map((m) => ({ member: m.member, memberName: characterName(m.member), cardCode: MEMBER_CARD[m.member] }));
	return _allyMembers;
}

/**
 * The Coterie members who can stand **against you** as enemies in the finale — they can vote Yea AND
 * have an enemy card (so Tuwile / Abarran / Razin, who have none, are excluded), plus the Red-Gloved
 * Man (always an enemy). In vote-table order, with the Red-Gloved Man last.
 */
let _enemyMembers: CoterieBoardMember[] | null = null;
export function coterieEnemyMembers(): CoterieBoardMember[] {
	if (_enemyMembers) return _enemyMembers;
	const voters = coterieVoteGuide()
		.filter((m) => canVote(m, 'yea') && !ENEMY_NO_CARD.has(m.member) && !ALWAYS_ENEMY.includes(m.member))
		.map((m) => m.member);
	_enemyMembers = [...voters, ...ALWAYS_ENEMY].map((member) => ({ member, memberName: characterName(member), cardCode: MEMBER_CARD[member] }));
	return _enemyMembers;
}

/** The finale version (roman numeral, e.g. `II`) a Congress judgment leads to, or null.
 *  Congress of the Keys' finale version is NOT a chosen tier — it's the trial's outcome,
 *  so it's derived from the play's judgment (see {@link judgmentFromLogs}). */
export function congressVersionForJudgment(judgmentId: string): string | null {
	return JUDGMENT_VERSION[judgmentId] ?? null;
}

// ─── Recorded-log interpretation (TSK game rules over a play's campaign log) ──
//
// TSK records far more inferable state in its campaign log than other campaigns, which is
// why these live in the tsk-solver layer rather than in a per-campaign widget: they read a
// single play's recorded `campaign_notes` and answer TSK-specific questions (the Congress
// judgment, a scenario's Succeed/Failed, a log-inferable scenario version). campaign-data
// stays for cross-campaign data; anything TSK-bespoke belongs here.

/** Recorded-log key prefix (campaign-data records narrative notes under this section). */
const NOTES = 'campaign_notes.';

/** Map a play's terminal Coterie logs to its Congress "judgment" (the meeting route; six of
 *  these collapse onto three finale versions). null when no finale was recorded. */
export function judgmentFromLogs(logs: ReadonlySet<string>): string | null {
	const has = (id: string) => logs.has(`${NOTES}${id}`);
	if (has('cell_joined_the_red_coterie')) return 'COTK.judgment.join';
	if (has('cell_overthrew_the_red_coterie')) return 'COTK.judgment.overthrow';
	if (has('red_coterie_was_destroyed_from_within')) return 'COTK.judgment.destroyed';
	if (has('red_coterie_spared_the_cell'))
		return has('cell_knows_the_true_nature_of_the_coterie')
			? 'COTK.judgment.spared'
			: 'COTK.judgment.asset';
	if (has('cell_escaped_the_red_coterie')) return 'COTK.judgment.liability';
	return null;
}

/** Congress of the Keys' finale version (roman) for a play, derived from its judgment. */
export function congressVersionFromLogs(logs: ReadonlySet<string>): string | null {
	const j = judgmentFromLogs(logs);
	return j ? congressVersionForJudgment(j) : null;
}

/**
 * Per-scenario Succeed / Failed, classified STRICTLY from the recorded resolution (the Extra-tab
 * value, e.g. `R2`) — no log-only inference or fallbacks. A resolution that's neither a win nor a
 * loss (e.g. Dead Heat R5 "arrived too late") maps to `neutral` and counts toward neither; a play
 * that recorded no resolution is `null` (excluded). Cross-referenced against the scenario guide +
 * tsk-solver resolution descriptions; bare campaign-data resolution ids.
 */
const SCENARIO_RESULT: Record<string, Record<string, 'success' | 'failure' | 'neutral'>> = {
	riddles_and_rain: { R1: 'success', R2: 'success', R3: 'failure', R4: 'failure', no_resolution: 'failure' },
	dead_heat: { R1: 'failure', R2: 'failure', R3: 'success', R4: 'success', R5: 'neutral', no_resolution: 'failure' },
	sanguine_shadows: { R1: 'success', R2: 'success', R3: 'failure', no_resolution: 'failure' },
	dealings_in_the_dark: { R1: 'success', R6: 'failure', no_resolution: 'failure' },
	dancing_mad: { R1: 'success', R2: 'failure', no_resolution: 'failure' },
	on_thin_ice: { R1: 'success', R2: 'success', R3: 'success', R4: 'failure', no_resolution: 'failure' },
	dogs_of_war: { R1: 'success', R2: 'success', R5: 'success', R6: 'success', R3: 'failure', no_resolution: 'failure' },
	shades_of_suffering: { R1: 'success', R2: 'success', R3: 'failure', no_resolution: 'failure' },
	without_a_trace: { R1: 'success', R2: 'success', R3: 'failure', R4: 'failure', no_resolution: 'failure' },
	congress_of_the_keys: { R1: 'success', no_resolution: 'failure' },
};

/** Scenarios that have a resolution-derived Succeed/Failed (callers iterate this for the tallies). */
export const TSK_OUTCOME_SCENARIOS: readonly string[] = Object.keys(SCENARIO_RESULT);

export type ScenarioResult = 'success' | 'failure' | 'neutral';

/**
 * A play's Succeed / Failed for `scenarioId`, from its recorded resolution alone. `'neutral'` for a
 * resolution that is neither (Dead Heat R5); `null` when no/blank resolution or not a known scenario
 * — the caller then counts nothing (this relies strictly on the Extra-tab resolution).
 */
export function scenarioResultFromResolution(
	scenarioId: string,
	resolution: string | undefined,
): ScenarioResult | null {
	if (!resolution) return null;
	return SCENARIO_RESULT[scenarioId]?.[resolution] ?? null;
}

// ─── Scarlet Key obtained from a scenario (resolution + logs) ────────────────
//
// "Obtained" = one of the cell's investigators became the Key's BEARER at the scenario — the same
// thing the tsk-solver graph computes when `applyFile` runs the resolution's `key` effect, but read
// standalone per scenario from the recorded resolution (+ logs) instead of by walking a whole plan.
// This is deliberately NOT "do you hold the Key now": a Key can be stolen later (the ζ-box theft, or
// a later scenario), so possession can't say WHERE it was won — only the resolution can.
//
// Covers the 7 Keys won via a scenario's own resolution. The Bale Engine, Ruinous Chime, and
// Mirroring Blade are won at interludes / the Safehouse (not a scenario resolution) and are out of
// scope here. Mapping cross-referenced against tsk-solver's `key`-effect bearers (see logic.json):
// every listed resolution grants the Key to the player; the rest hand it to a Red Coterie member.
// Dealings is the one case needing logs too — the same "recovered" outcome (R1) gives the Antiprism
// to YOU when you deceived/refused Ece, but to ECE when you worked with her.

/** The 7 scenarios whose Scarlet Key is won via the scenario's own resolution → its key item id. */
export const TSK_KEY_SCENARIOS: { scenarioId: string; keyId: string }[] = [
	{ scenarioId: 'riddles_and_rain', keyId: 'eye_of_ravens' },
	{ scenarioId: 'dead_heat', keyId: 'last_blossom' },
	{ scenarioId: 'sanguine_shadows', keyId: 'weeping_lady' },
	{ scenarioId: 'dealings_in_the_dark', keyId: 'twisted_antiprism' },
	{ scenarioId: 'on_thin_ice', keyId: 'sable_glass' },
	{ scenarioId: 'dogs_of_war', keyId: 'light_of_pharos' },
	{ scenarioId: 'shades_of_suffering', keyId: 'shade_reaper' }
];

const TSK_KEY_SCENARIO_IDS = new Set(TSK_KEY_SCENARIOS.map((s) => s.scenarioId));

/** True when `scenarioId` is one whose Key acquisition this evaluator can answer. */
export function scenarioHasObtainableKey(scenarioId: string): boolean {
	return TSK_KEY_SCENARIO_IDS.has(scenarioId);
}

/**
 * Whether the cell OBTAINED the scenario's Scarlet Key, from its recorded resolution (campaign-data
 * id, e.g. `R2`) + campaign logs. `true` = a cell investigator took it; `false` = a Red Coterie
 * member kept it; `null` = indeterminate (no resolution recorded, or not a key scenario) — the caller
 * then shows nothing, since this relies strictly on the Extra-tab resolution.
 */
export function keyObtainedFromScenario(
	scenarioId: string,
	resolution: string | undefined,
	logs: ReadonlySet<string>
): boolean | null {
	if (!TSK_KEY_SCENARIO_IDS.has(scenarioId)) return null;
	if (!resolution || resolution === 'no_resolution') return resolution === 'no_resolution' ? false : null;
	const has = (id: string) => logs.has(`${NOTES}${id}`);
	const isOneOf = (...rs: string[]) => rs.includes(resolution);
	switch (scenarioId) {
		case 'riddles_and_rain':
			return isOneOf('R1', 'R2'); // R3/R4 → the Red-Gloved Man keeps the Eye of Ravens
		case 'dead_heat':
			return isOneOf('R3', 'R4'); // R1/R2/R5 → Amaranth keeps The Last Blossom
		case 'sanguine_shadows':
			return isOneOf('R1', 'R2'); // R3 → La Chica Roja keeps The Weeping Lady
		case 'on_thin_ice':
			return resolution === 'R2'; // R1 → Thorne; R3/R4 → you don't end up with The Sable Glass
		case 'dogs_of_war':
			return isOneOf('R2', 'R6'); // R1/R5 cooperate → Claret Knight; R3 → the Beast
		case 'shades_of_suffering':
			return isOneOf('R1', 'R2'); // R3 → Tzu San Niang keeps The Shade Reaper
		case 'dealings_in_the_dark':
			// Only the "recovered the Antiprism" outcome (R1) can give it to you, and only when you
			// deceived or refused Ece; working with her hands her the Key. R6 → the cult / Red-Gloved Man.
			if (resolution !== 'R1') return false;
			if (has('cell_is_working_with_ece')) return false;
			if (has('cell_is_deceiving_ece') || has('cell_refused_eces_offer')) return true;
			return null; // recovered, but the Ece relationship wasn't recorded — can't tell the bearer
		default:
			return null;
	}
}

// ─── No-scenario Keys: The Bale Engine (Tuwile) & The Ruinous Chime (Dr. Irawan) ──────
// These two Scarlet Keys are won at INTERLUDE quests, not a combat scenario. Each winning path
// records a "joined the cell" note, so unlike the scenario keys they're FULLY log-derivable (no
// resolution needed) — and their quests have multiple recorded beats worth a bespoke widget.

/** The Bale Engine card's code (for art); Tuwile Masai has no card of his own. */
export const BALE_ENGINE_CARD = '09769a';
/** The Ruinous Chime / Dr. Dewi Irawan card codes (for art). */
export const RUINOUS_CHIME_CARD = '09770a';
export const IRAWAN_CARD = '09764';

export interface BaleEngineQuest {
	/** Tuwile Masai joined the cell → you hold The Bale Engine (won at Nairobi, or at Bermuda after he fled). */
	obtained: boolean;
	/** Tuwile distrusted you at Nairobi (Infernal Machinery) and fled to Bermuda — a second chance, or a loss. */
	fled: boolean;
	/** Where he was won: `nairobi` (trusted outright) | `bermuda` (won back after fleeing) | null (not won). */
	wonAt: 'nairobi' | 'bermuda' | null;
	/** He fled AND was never won back — The Bale Engine is lost to the cell. */
	lost: boolean;
}

/** The Bale Engine quest state for a play, from its logs (the Tuwile Masai / Nairobi→Bermuda arc). */
export function baleEngineQuestFromLogs(logs: ReadonlySet<string>): BaleEngineQuest {
	const has = (id: string) => logs.has(`${NOTES}${id}`);
	const obtained = has('tuwile_masai_is_on_your_side');
	const fled = has('tuwile_masai_fled_to_bermuda');
	return { obtained, fled, wonAt: obtained ? (fled ? 'bermuda' : 'nairobi') : null, lost: fled && !obtained };
}

export interface RuinousChimeQuest {
	/** Dr. Irawan joined the cell at Manokwari (reached in time) → you hold The Ruinous Chime. */
	obtained: boolean;
	/** You met Dr. Irawan in Perth (Paranatural Selection) — the quest began. */
	met: boolean;
	/** She left Perth for New Guinea (Manokwari) — the chase is on. */
	newGuinea: boolean;
	/** She vanished from existence — The Ruinous Chime is lost. */
	vanished: boolean;
}

/** The Ruinous Chime quest state for a play, from its logs (the Dr. Irawan / Perth→Manokwari arc). */
export function ruinousChimeQuestFromLogs(logs: ReadonlySet<string>): RuinousChimeQuest {
	const has = (id: string) => logs.has(`${NOTES}${id}`);
	return {
		obtained: has('dr_irawan_joined_the_cell'),
		met: has('cell_met_dr_irawan'),
		newGuinea: has('dr_irawan_traveled_to_new_guinea'),
		vanished: has('dr_irawan_vanished_from_existence'),
	};
}

// ─── TSK side quests (the optional mini-quest stops) ─────────────────────────
// Four optional detours, all log-derivable from PERSISTENT notes. Two complete by CROSSING OFF a
// note (Special Delivery's "delivering intel", Strange Architecture's "appreciated the architecture"),
// so a delivered/completed run shows that note in `crossedLogs`. Quid Pro Quo records its intel notes
// (which also feed Dead Heat R3 / Dancing Mad). Ruses & Reclamation's only persistent trace is the
// `wrong_leads` count (the theft + recovery are hidden "Remember that…" notes), so that's all it shows.

export interface SideQuestSignals {
	/** Special Delivery — picked up the Lagos/Tokyo intel (recorded, even if later delivered). */
	deliveryPickedUp: boolean;
	/** Special Delivery — delivered it (the note was crossed off; +1 to a chaos token). */
	deliveryDelivered: boolean;
	/** Strange Architecture — noticed the first building (recorded). */
	architectureNoticed: boolean;
	/** Strange Architecture — completed the déjà vu at the second building (crossed off; +2 XP). */
	architectureCompleted: boolean;
	/** Quid Pro Quo — took the Amaranth intel (San Francisco). */
	amaranthIntel: boolean;
	/** Quid Pro Quo — took the Desi intel (Moscow). */
	desiIntel: boolean;
}

// ─── Dead and Gone — the secret-scenario quest (path to Without a Trace) ─────
// The hidden chain that unlocks & enters Without a Trace: meet Agent Quinn in time (Ringing Hollow,
// which unlocks the London revisit), take Aliki's whistle (Whistle on the Wind), go OFF-MISSION at
// Dead and Gone (needs Quinn's trust + the whistle + time ≤ 30), then Romulus and Remus opens the
// Bermuda Triangle. Every beat leaves a persistent note, so the whole funnel is log-derivable.

export interface DeadAndGoneQuest {
	/** Took Aliki's whistle (Whistle on the Wind) — a prerequisite for going off-mission. */
	whistle: boolean;
	/** Refused Aliki's whistle (the branch that forecloses the secret path). */
	refusedWhistle: boolean;
	/** Agent Quinn vanished — met too late (≥20 time), so the London revisit never opened. */
	quinnVanished: boolean;
	/** Went off-mission at Dead and Gone — the pivot that lets Romulus and Remus open the Bermuda Triangle. */
	offMission: boolean;
	/** Entered Without a Trace (its opening whistle choice was recorded). */
	enteredWaT: boolean;
	/** Learned the true nature of the Coterie (the payoff — also the "spared" finale key). */
	trueNature: boolean;
}

/** The Dead and Gone / secret-scenario quest state for a play, from its logs. */
export function deadAndGoneFromLogs(logs: ReadonlySet<string>): DeadAndGoneQuest {
	const has = (id: string) => logs.has(`${NOTES}${id}`);
	return {
		whistle: has('cell_possesses_a_mysterious_whistle'),
		refusedWhistle: has('cell_refused_alikis_offer'),
		quinnVanished: has('agent_quinn_vanished_from_existence'),
		offMission: has('cell_is_off_mission'),
		enteredWaT: has('cell_blew_the_whistle') || has('cell_threw_away_the_whistle'),
		trueNature: has('cell_knows_the_true_nature_of_the_coterie'),
	};
}

/** The TSK side-quest signals for a play, from its recorded + crossed-off logs. */
export function sideQuestsFromLogs(
	recorded: ReadonlySet<string>,
	crossed: ReadonlySet<string> | undefined,
): SideQuestSignals {
	const has = (id: string) => recorded.has(`${NOTES}${id}`);
	const off = (id: string) => crossed?.has(`${NOTES}${id}`) ?? false;
	return {
		deliveryPickedUp: has('cell_is_delivering_foundation_intel'),
		deliveryDelivered: off('cell_is_delivering_foundation_intel'),
		architectureNoticed: has('cell_appreciated_the_architecture'),
		architectureCompleted: off('cell_appreciated_the_architecture'),
		amaranthIntel: has('cell_knows_amaranths_real_name'),
		desiIntel: has('cell_knows_desis_past'),
	};
}

/** Scenarios whose "version" — normally a pre-scenario choice we ask for in the Extra tab —
 *  CAN be inferred from the campaign log, mapping a recorded note to the version's 1-based
 *  ordinal (so the Extra tab can skip asking). Dancing Mad: a deal with Desi ⇒ Version I, an
 *  ambush ⇒ Version II. */
const VERSION_LOG_ORDINAL: Record<string, Record<string, number>> = {
	dancing_mad: { cell_made_a_deal_with_desi: 1, cell_has_been_ambushed: 2 },
};

/** True when a scenario's version is log-inferable (so the Extra tab needn't ask for it). */
export function isVersionLogInferable(scenarioId: string): boolean {
	return scenarioId in VERSION_LOG_ORDINAL;
}

/** The version OPTION id a play recorded for a log-inferable scenario (e.g. Dancing Mad's
 *  `DM.v2`), derived from its log — or null when not inferable / not present. */
export function scenarioVersionFromLogs(scenarioId: string, logs: ReadonlySet<string>): string | null {
	const map = VERSION_LOG_ORDINAL[scenarioId];
	if (!map) return null;
	for (const [logId, ordinal] of Object.entries(map)) {
		if (logs.has(`${NOTES}${logId}`)) return scenarioReference(scenarioId)?.versions[ordinal - 1]?.id ?? null;
	}
	return null;
}

// ─── Time tier ⇄ resolution implications ─────────────────────────────────────
//
// A few TSK scenarios make a recorded time tier (level) and a recorded resolution
// imply each other, so a play that recorded one but forgot the other should still
// credit both. Applied once at CampaignRecord assembly (profile-local.ts) so every
// downstream aggregate — the catch-all resolution coverage AND the per-tier variant
// tallies — sees the same filled-in pair, and the inference never has to be repeated.
//
// Dead Heat: at 25+ time the intro auto-routes to `dead_heat_skipped → resolution_5`,
// so the final time tier (`DH.t.late`, "25+ time") and resolution R5 ("the scenario
// was skipped") are equivalent — and a run on that path tends to record one and not
// the other (once skipped, the player stops tracking targets/time).

const DEAD_HEAT = 'dead_heat';
const DEAD_HEAT_LATE_LEVEL = 'DH.t.late'; // "25+ time – too late, city already destroyed"
const DEAD_HEAT_SKIPPED_RESOLUTION = 'R5'; // "the scenario was skipped"

/**
 * Fill in a missing time tier / resolution where the two imply each other (see above).
 * Conservative: only fills the side the player OMITTED — never overwrites a value they
 * explicitly recorded. Returns the same references when there's nothing to infer.
 * `resolutions` is keyed by scenario id; `tiers` by `"<scenarioId>.<kind>"` (level | version).
 */
export function applyTskTierResolutionInference(
	resolutions: Record<string, string>,
	tiers: Record<string, string>,
): { resolutions: Record<string, string>; tiers: Record<string, string> } {
	const levelKey = `${DEAD_HEAT}.level`;
	// Final time tier recorded, resolution omitted → R5.
	if (tiers[levelKey] === DEAD_HEAT_LATE_LEVEL && resolutions[DEAD_HEAT] === undefined)
		return { resolutions: { ...resolutions, [DEAD_HEAT]: DEAD_HEAT_SKIPPED_RESOLUTION }, tiers };
	// R5 recorded, final time tier omitted → DH.t.late.
	if (resolutions[DEAD_HEAT] === DEAD_HEAT_SKIPPED_RESOLUTION && tiers[levelKey] === undefined)
		return { resolutions, tiers: { ...tiers, [levelKey]: DEAD_HEAT_LATE_LEVEL } };
	return { resolutions, tiers };
}

// ─── Route step rendering (for the RoutingTrack component) ───────────────────

const KOHAKU_SCENARIOS = new Set<string>(Object.values(Scenario));

/** Small arabic→roman for the version badge (TSK never exceeds a handful of versions). */
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const toRoman = (n: number): string => ROMAN[n] ?? String(n);

export interface RouteStepInfo {
	scenarioId: string;
	/** Display name (scenario title), resolved from campaign-data. */
	name: string;
	/** Encounter-set icon, when the scenario maps to a kohaku Scenario (null → fallback). */
	iconSet: EncounterSet | null;
	/** Short tier marker drawn under the icon (e.g. `v.II`, `Lv.3/7`). */
	badge?: string;
	/** Rich hover label: scenario name + the solver's level/version text. */
	tooltip: string;
}

/** Resolve a route step (scenario + recorded tier) into everything RoutingTrack
 *  needs: the scenario name, its encounter-set icon, a short tier badge, and a
 *  rich tooltip drawn from the solver's level/version text. */
export function routeStepInfo(
	family: string | null,
	step: { scenarioId: string; level?: string; version?: string; finaleVersion?: string },
): RouteStepInfo {
	const id = step.scenarioId;
	const name = getCampaignLog(family ?? 'tskc')?.en.scenarioNames?.[id] ?? id;
	let iconSet: EncounterSet | null = null;
	if (KOHAKU_SCENARIOS.has(id)) {
		try {
			iconSet = getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			iconSet = null;
		}
	}
	const ref = scenarioReference(id);
	let badge: string | undefined;
	let tierLabel = '';
	if (step.finaleVersion) {
		// Congress of the Keys — the finale version is the trial's OUTCOME (derived from the
		// campaign log's judgment), not a chosen tier, so it carries its own roman numeral.
		badge = `v.${step.finaleVersion}`;
		tierLabel = `Version ${step.finaleVersion}`;
	} else if (step.version && ref) {
		// Versions are the game's "Version I/II/III" — show the roman numeral by the
		// option's ordinal (v.I, v.II, …), not the raw id suffix (`v2`).
		const i = ref.versions.findIndex((v) => v.id === step.version);
		if (i >= 0) badge = `v.${toRoman(i + 1)}`;
		tierLabel = ref.versions.find((v) => v.id === step.version)?.label ?? '';
	} else if (step.level && ref) {
		const i = ref.levels.findIndex((l) => l.id === step.level);
		if (i >= 0) badge = `Lv.${i + 1}/${ref.levels.length}`;
		tierLabel = ref.levels.find((l) => l.id === step.level)?.label ?? '';
	}
	return { scenarioId: id, name, iconSet, badge, tooltip: tierLabel ? `${name} — ${tierLabel}` : name };
}

// ─── Per-scenario reference info (for the per-scenario widgets) ───────────────

/** The 10 playable TSK story scenarios → tsk-solver FileCode, in campaign-book
 *  (table-of-contents) order. Also the default widget order. */
export const TSK_SCENARIO_FILECODE: Record<string, string> = {
	riddles_and_rain: '5-A',
	dead_heat: '11-B',
	sanguine_shadows: '16-D',
	dealings_in_the_dark: '21-F',
	dancing_mad: '28-I',
	on_thin_ice: '33-K',
	dogs_of_war: '38-N',
	shades_of_suffering: '46-Q',
	without_a_trace: '56-Y',
	congress_of_the_keys: '59-Z',
};

/** The 10 scenario ids in book order. */
export const TSK_SCENARIO_ORDER = Object.keys(TSK_SCENARIO_FILECODE);

// Scarlet Keys are real cards (type `key`); index the front side by name once so a
// scenario can show the art of the Key at stake.
let _keyCardByName: Map<string, string> | null = null;
/** Card code (front side) for a Scarlet Key, looked up by its display name. */
export function keyCardCodeForName(name: string): string | null {
	if (!_keyCardByName) {
		_keyCardByName = new Map();
		for (const c of getAllCards()) {
			if (c.cardType !== CardType.Key) continue;
			const key = norm(c.name);
			// Prefer the 'a' (front) side; don't overwrite it with a 'b' side.
			if (!_keyCardByName.has(key) || c.code.endsWith('a')) _keyCardByName.set(key, c.code);
		}
	}
	return _keyCardByName.get(norm(name)) ?? null;
}

// ─── Per-scenario Red Coterie member art ─────────────────────────────────────

/**
 * The Red Coterie member(s) a scenario revolves around, as REAL cards — usually
 * the antagonist you face, but sometimes an ally (Ece Şahin), so we call them
 * "members", not bosses. The solver models them as character ids
 * (`thorne`, `claretKnight`), not card codes, so this mapping is curated.
 * Dogs of War's cast changes with the scenario version played, so it is keyed by
 * version option id and the player's recorded path selects which to show (the
 * "personalized" cast). Scenarios with no featured member (the finale) are absent.
 */
interface CoterieDef {
	/** Default member card codes — the fixed cast, or the fallback when no version is recorded. */
	codes: string[];
	/** Member card codes per `DOW.version` option id, when the cast varies by the path taken. */
	byVersion?: Record<string, string[]>;
}

const TSK_COTERIE: Record<string, CoterieDef> = {
	riddles_and_rain: { codes: ['09518'] }, // The Red-Gloved Man
	dead_heat: { codes: ['09537'] }, // Amaranth
	sanguine_shadows: { codes: ['09557', '09563'] }, // La Chica Roja · The Sanguine Watcher
	dealings_in_the_dark: { codes: ['09584'] }, // Ece Şahin (an ally)
	dancing_mad: { codes: ['09606a'] }, // Desiderio Delgado Álvarez
	on_thin_ice: { codes: ['09625a'] }, // Thorne
	dogs_of_war: {
		// The cast depends on the version: v1 you defend the Claret Knight while the
		// Beast assaults as the Ravager, v2 the Claret Knight holds the Light, v3 you
		// recover it from the Beast.
		codes: ['09654a'], // The Claret Knight (default / eponymous figure)
		byVersion: {
			'DOW.v1': ['09654a', '09655a'], // Claret Knight (defended) · the Beast (Ravager)
			'DOW.v2': ['09654a'], // the Claret Knight
			'DOW.v3': ['09655b'], // the Beast (Wolf in Sheep's Clothing)
		},
	},
	shades_of_suffering: { codes: ['09679a'] }, // Tzu San Niang
	without_a_trace: { codes: ['09761', '09518'] }, // Aliki Zoni Uperetria · The Red-Gloved Man
};

// Index card name by code once (for a member's display name / alt text).
let _cardNameByCode: Map<string, string> | null = null;
function cardNameByCode(code: string): string {
	if (!_cardNameByCode) {
		_cardNameByCode = new Map();
		for (const c of getAllCards()) if (!_cardNameByCode.has(c.code)) _cardNameByCode.set(c.code, c.name);
	}
	return _cardNameByCode.get(code) ?? '';
}

export interface ScenarioCoterieMember {
	code: string;
	name: string;
	/** True when this member reflects the player's recorded version (not the default cast). */
	fromVersion: boolean;
}

/** The Red Coterie member(s) featured in a scenario, narrowed to the version the
 *  player recorded where the cast varies (Dogs of War). Empty for scenarios with
 *  no featured member. */
export function scenarioCoterie(scenarioId: string, versionId?: string | null): ScenarioCoterieMember[] {
	const def = TSK_COTERIE[scenarioId];
	if (!def) return [];
	const versioned = versionId ? def.byVersion?.[versionId] : undefined;
	const codes = versioned ?? def.codes;
	const fromVersion = !!versioned;
	return codes.map((code) => ({ code, name: cardNameByCode(code), fromVersion }));
}

/** Curated Key-at-stake overrides where the solver's logic file declares none —
 *  e.g. Riddles and Rain's prologue doesn't carry a `keyAtStakeId`, but the Eye of
 *  Ravens is plainly the Key in play. */
const TSK_KEY_OVERRIDE: Record<string, { name: string; code: string }> = {
	riddles_and_rain: { name: 'The Eye of Ravens', code: '09519a' },
};

export interface ScenarioReference {
	scenarioId: string;
	fileCode: string;
	title: string;
	location: string;
	/** One-line planning note from the solver. */
	note: string;
	keyId: string;
	keyName: string;
	/** Card code for the Key at stake's front art, if resolvable. */
	keyCardCode: string | null;
	versions: TierOption[];
	levels: TierOption[];
}

/** Assemble the solver's reference info for a scenario (by kohaku id). */
export function scenarioReference(scenarioId: string): ScenarioReference | null {
	const fileCode = TSK_SCENARIO_FILECODE[scenarioId];
	if (!fileCode) return null;
	const en = getEnFile(fileCode);
	const file = getFile(fileCode);
	const keyId = file?.keyAtStakeId;
	const override = TSK_KEY_OVERRIDE[scenarioId];
	const kName = override?.name ?? (keyId ? keyName(keyId) : '');
	const c = catalog();
	return {
		scenarioId,
		fileCode,
		title: en?.title ?? scenarioId,
		location: en?.location ?? (file?.locationIds?.[0] ? locationName(file.locationIds[0]) : ''),
		note: en?.note ?? '',
		keyId: keyId ?? '',
		keyName: kName,
		keyCardCode: override?.code ?? (kName ? keyCardCodeForName(kName) : null),
		versions: (c.versions[fileCode] ?? []).map((o) => ({ id: o.id, label: o.label })),
		levels: (c.levels[fileCode] ?? []).map((o) => ({ id: o.id, label: o.label })),
	};
}

/**
 * Restrict a scenario's campaign-data resolution ids to those reachable in a
 * given scenario *version*. Only Dogs of War gates resolutions by version in the
 * base campaign; every other scenario — and all time-scaling "levels" (pass
 * `versionId = undefined`) — returns the list unchanged.
 *
 * The solver keys resolutions as `<DEC>.R<n>` (e.g. `DOW.R3`) and version-gates
 * the selectable ones via `reachableInVersions`; campaign-data uses the bare
 * suffix (`R3`). We join by suffix. Resolutions the solver doesn't gate — the
 * cooperate-win variants it folds into another (R1/R5→R8) and `no_resolution` —
 * aren't version-restricted, so they pass through for every version.
 */
export function resolutionsReachableIn(
	scenarioId: string,
	versionId: string | undefined,
	allResolutionIds: string[],
): string[] {
	const fileCode = TSK_SCENARIO_FILECODE[scenarioId];
	if (!fileCode || !versionId) return allResolutionIds;
	const gating = resolutionGating(fileCode); // version option id → solver resolution ids
	if (!Object.keys(gating).length) return allResolutionIds;
	const suffix = (id: string) => id.split('.').pop() ?? id;
	const gatedUniverse = new Set<string>();
	for (const ids of Object.values(gating)) for (const id of ids) gatedUniverse.add(suffix(id));
	const reachableHere = new Set((gating[versionId] ?? []).map(suffix));
	// Keep ungated resolutions on every version; gated ones only where reachable.
	return allResolutionIds.filter((r) => !gatedUniverse.has(r) || reachableHere.has(r));
}

// Time-scaling LEVELS normally don't gate resolutions (only versions do), but a few final tiers FORCE
// a single outcome. Dead Heat's 25+ time tier auto-skips the scenario straight to R5 — so R5 is the
// only resolution there AND, being forced exclusively at that tier, it's removed from the scenario's
// other tiers too (the earlier tier mustn't list R5). See {@link resolutionsReachableInLevel}.
const LEVEL_RESOLUTION_GATE: Record<string, string[]> = {
	'DH.t.late': ['R5'],
};

/** Restrict a scenario's resolution ids to those reachable on a given time tier (LEVEL). Almost all
 *  levels return the list unchanged; the few final tiers that force one outcome (see
 *  {@link LEVEL_RESOLUTION_GATE}) both narrow that tier AND drop the forced outcome from the scenario's
 *  other tiers. Pass `undefined` for no level. */
export function resolutionsReachableInLevel(
	levelId: string | undefined,
	allResolutionIds: string[],
): string[] {
	if (!levelId) return allResolutionIds;
	// The FORCED tier shows only its outcome (Dead Heat's 25+ → R5).
	const gate = LEVEL_RESOLUTION_GATE[levelId];
	if (gate) {
		const allow = new Set(gate);
		return allResolutionIds.filter((r) => allow.has(r));
	}
	// A non-forced tier of the SAME scenario must DROP any resolution another tier forces exclusively
	// (Dead Heat's R5 only happens at the 25+ tier, so it mustn't bleed onto the earlier tier). Level
	// ids are `<DEC>.t.<tier>`; scope the exclusion to this scenario's decade code.
	const dec = levelId.split('.')[0];
	const forcedElsewhere = new Set<string>();
	for (const [lid, ids] of Object.entries(LEVEL_RESOLUTION_GATE)) {
		if (lid.split('.')[0] === dec) for (const r of ids) forcedElsewhere.add(r);
	}
	return allResolutionIds.filter((r) => !forcedElsewhere.has(r));
}

// Time tiers that SKIP the scenario entirely — the play never happens, so there's no
// Succeed/Failed to show for that row (its cells stay blank, not "—"). Dead Heat's 25+
// time tier auto-skips straight to R5.
const LEVEL_NO_OUTCOME = new Set<string>(['DH.t.late']);

/** True when a time tier skips the scenario, so no win/loss outcome applies to it. */
export function levelHasNoOutcome(levelId: string | undefined): boolean {
	return !!levelId && LEVEL_NO_OUTCOME.has(levelId);
}
