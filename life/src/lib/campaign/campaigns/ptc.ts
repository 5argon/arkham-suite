/**
 * ptc.ts — The Path to Carcosa bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`ptc`), mirroring `dwl.ts` / `eoe.ts`. All log-derived (the richer
 * doubt/conviction running-total reconstruction + the doubt-vs-conviction scenario
 * "versions" stay as documented follow-ups in ptc-widgets-plan.md).
 *
 *   • doubtConviction — the campaign spine: each play's FINAL doubt vs conviction
 *     (the two `count` sections), summarised as which side led + high-water marks.
 *   • stranger        — how close the Stranger got (`chasing_the_stranger` count).
 *   • vips            — VIPs interviewed vs slain-into-the-victory-display, across
 *     EVERY scenario (the `vips_interviewed` / `vips_slain` card sections).
 *   • per-scenario    — the logged decisions/outcomes of each story scenario.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import type { ResolutionTally } from '../outcomes/resolution-coverage';
import { filterFamilyRecords } from '../records/campaign-family';
import { bumpCount, emptyTally, bumpTally } from '../utils/tally';
import { noteKey, noteReader } from '../utils/notes';
import { canonInvestigatorCode } from '../utils/card-filters';

const PTC_FAMILY = 'ptc';
const k = noteKey;

const VIPS_INTERVIEWED = 'vips_interviewed';
const VIPS_SLAIN = 'vips_slain';

/** Scenarios where The Man in the Pallid Mask (the Stranger) can be defeated. Curtain Call (the
 *  tutorial) adds its 1-2 marks automatically via the warn-police resolution — derived, never asked;
 *  the seven `mitpm_defeated` scenarios carry a manual `stranger_defeats` Extra counter. Campaign order. */
export type PtcToken = 'cultist' | 'tablet' | 'elder_thing';
/** Special chaos tokens added for the next scenario, keyed `scenario.<recordedResolution>`,
 *  from the ArkhamCards adjust_chaos_tokens steps. Keys use the RECORDED resolution value
 *  (e.g. The Last King's R2 surfaces as `no_resolution_defeated`). */
const RESOLUTION_TOKENS: Record<string, PtcToken[]> = {
	'the_last_king.no_resolution_defeated': ['cultist', 'tablet', 'elder_thing'],
	'the_last_king.R3': ['cultist', 'tablet', 'elder_thing'],
	'echoes_of_the_past.R1': ['cultist', 'cultist'],
	'echoes_of_the_past.R2': ['elder_thing', 'elder_thing'],
	'echoes_of_the_past.R3': ['tablet', 'tablet'],
	'echoes_of_the_past.R4': ['cultist', 'tablet', 'elder_thing'],
	'the_unspeakable_oath.R2': ['tablet', 'tablet'],
	'the_unspeakable_oath.R3': ['elder_thing', 'elder_thing'],
	'a_phantom_of_truth.no_resolution': ['elder_thing', 'elder_thing'],
	'a_phantom_of_truth.R1': ['cultist', 'cultist'],
	'a_phantom_of_truth.R2': ['tablet', 'tablet'],
	'a_phantom_of_truth.R3': ['elder_thing', 'elder_thing'],
	'the_pallid_mask.no_resolution': ['elder_thing', 'elder_thing'],
	'the_pallid_mask.R1': ['cultist', 'cultist'],
	'the_pallid_mask.R2': ['tablet', 'tablet'],
	'black_stars_rise.R1': ['cultist', 'cultist', 'tablet', 'tablet'],
	'black_stars_rise.R2': ['cultist', 'cultist', 'elder_thing', 'elder_thing']
};
/** Curtain Call's Act 2b version (Extra) also seeds the mid-game mix. */
const ACT2B_TOKENS: Record<string, PtcToken[]> = {
	a_city_aflame: ['cultist', 'cultist'],
	the_path_is_mine: ['tablet', 'tablet'],
	the_shores_of_hali: ['elder_thing', 'elder_thing']
};
/** The 8 PtC story scenarios in play order. Each one (after Curtain Call) is played with the
 *  special-token mix the PREVIOUS scenario sent into the bag — The Last King receives Curtain
 *  Call's Act 2b mix, every later scenario receives the prior scenario's resolution mix. */
const STORY_SCENARIOS = [
	'curtain_call',
	'the_last_king',
	'echoes_of_the_past',
	'the_unspeakable_oath',
	'a_phantom_of_truth',
	'the_pallid_mask',
	'black_stars_rise',
	'dim_carcosa'
];

/** Campaign-ending notes → the scenario each one belongs to (its campaign-data `outcome` entry). The
 *  route ends at this terminal scenario, which is NOT always Dim Carcosa: "Carcosa merged" is a Black
 *  Stars Rise loss; the win and "Hastur has you" are at Dim Carcosa. (PtC has no Oath-ending outcome
 *  — the asylum's "party claimed" continues with a fresh party.) */
const TERMINAL_NOTES: [string, string][] = [
	['carcosa_merged', 'black_stars_rise'],
	['prevented_hasturs_escape', 'dim_carcosa'],
	['hastur_has_you', 'dim_carcosa']
];

/** One step of a play's chaos-token route: the scenario and the special-token mix it was PLAYED
 *  WITH (received from the previous scenario's resolution / Act 2b). */
export interface TokenStep {
	scenario: string;
	mix: PtcToken[];
}

/** The special-token mix in the bag for `STORY_SCENARIOS[i]` — set by the transition INTO it
 *  (the previous scenario's resolution, an interlude choice, or Curtain Call's Act 2b). Each
 *  transition RESETS the special tokens (remove all, then add), so this is the whole mix. */
function receivedMix(i: number, rec: CampaignRecord): PtcToken[] {
	const res = rec.scenarioResolutions ?? {};
	const choices = rec.scenarioChoices ?? {};
	if (i <= 0) return []; // Curtain Call opens on the base bag.
	if (i === 1) {
		// The Last King ← Curtain Call's Act 2b (a_city_aflame=2C, the_path_is_mine=2T, shores=2E).
		const act2b = choices['curtain_call.act_2b'] ?? choices['return_to_curtain_call.act_2b'] ?? '';
		return ACT2B_TOKENS[act2b] ?? [];
	}
	if (i === 2) {
		// Echoes ← the resigned path runs through Interlude I (Reality's Shadow), whose house choice
		// adds the 2-of-a-kind (recorded as intruded→2E / fled→2T / slayed→2C); otherwise the 1+1+1
		// from The Last King's defeated/survived resolution.
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		if (logs.has(k('slayed_the_monsters'))) return ['cultist', 'cultist'];
		if (logs.has(k('fled_dinner_party'))) return ['tablet', 'tablet'];
		if (logs.has(k('intruded_on_secret_meeting'))) return ['elder_thing', 'elder_thing'];
		const lkRes = res['the_last_king'];
		return lkRes ? (RESOLUTION_TOKENS[`the_last_king.${lkRes}`] ?? []) : [];
	}
	const prev = STORY_SCENARIOS[i - 1];
	const prevRes = res[prev];
	return prevRes ? (RESOLUTION_TOKENS[`${prev}.${prevRes}`] ?? []) : [];
}

/** A play's chaos-token route: each story scenario it REACHED, with the mix it was played with.
 *  Ends at the furthest scenario with a recorded resolution (or Dim Carcosa if the finale's outcome
 *  was recorded) — so an abandoned run stops at where it ended, no phantom unreached icons. */
function buildTokenRoute(rec: CampaignRecord): TokenStep[] {
	const res = rec.scenarioResolutions ?? {};
	let furthest = furthestResolved(res);
	// A campaign-ending note pins the TERMINAL scenario (its campaign-data `outcome` entry) — the route
	// ends where the campaign actually ended, which is NOT always Dim Carcosa: the "Carcosa merged"
	// loss happens at Black Stars Rise. This also covers a finale reached without its resolution
	// dropdown filled (the note proves the scenario was played).
	const logs = rec.recorded.recordedLogs ?? new Set<string>();
	for (const [note, sc] of TERMINAL_NOTES)
		if (logs.has(k(note))) furthest = STORY_SCENARIOS.indexOf(sc);
	if (furthest < 0) return [];
	const route: TokenStep[] = [];
	// Carry the bag forward: a transition that adds no special tokens keeps the previous mix, so the
	// chain (and the coverage table that reads `tokenRoute`) shows what was actually in the bag at that
	// scenario — the persisted tokens — rather than an empty "—". Curtain Call opens on the plain bag.
	let carried: PtcToken[] = [];
	for (let i = 0; i <= furthest; i++) {
		const fed = receivedMix(i, rec);
		if (fed.length) carried = fed;
		route.push({ scenario: STORY_SCENARIOS[i], mix: carried });
	}
	return route;
}

/** The 7 Doubt/Conviction sources in book order (mirrors PtcDcChain). */
const DC_SOURCE_SCENARIOS = [
	'curtain_call',
	'reality_s_shadow',
	'echoes_of_the_past',
	'lost_soul',
	'a_phantom_of_truth',
	'the_pallid_mask',
	'black_stars_rise'
];
/** The sources that can resolve to NEUTRAL (reached the decision but took no mark): fail Curtain
 *  Call, run from the dinner party, defeat the Oathspeaker / fail Echoes, <4 Stranger tallies at
 *  Phantom, fail Pallid before Act 2. Lost Soul and Black Stars Rise always hand out a mark. */
const DC_NEUTRAL_CAPABLE = new Set([
	'curtain_call',
	'reality_s_shadow',
	'echoes_of_the_past',
	'a_phantom_of_truth',
	'the_pallid_mask'
]);
/** A source counts as PASSED (so a no-mark play there is neutral, not merely unreached) once the
 *  play records a resolution at this story scenario or later. */
const SOURCE_PASSED_BY: Record<string, string> = {
	curtain_call: 'the_last_king',
	reality_s_shadow: 'echoes_of_the_past',
	echoes_of_the_past: 'the_unspeakable_oath',
	lost_soul: 'a_phantom_of_truth',
	a_phantom_of_truth: 'the_pallid_mask',
	the_pallid_mask: 'black_stars_rise',
	black_stars_rise: 'dim_carcosa'
};


/** Furthest story-scenario index the play recorded a resolution for (−1 if none). */
function furthestResolved(res: Record<string, string>): number {
	let f = -1;
	for (let i = 0; i < STORY_SCENARIOS.length; i++) if (res[STORY_SCENARIOS[i]] !== undefined) f = i;
	return f;
}

/** The Act 2 (Unspeakable Oath) version a play faced — 'I' if the onyx clasp was taken back in
 *  Echoes, else 'II'; null unless the play reached the Unspeakable Oath (a recorded resolution
 *  there or beyond). The version axis the shared per-version breakdown table buckets by. */
export function oathVersionFromRecord(rec: CampaignRecord): 'I' | 'II' | null {
	const furthest = furthestResolved(rec.scenarioResolutions ?? {});
	if (furthest < STORY_SCENARIOS.indexOf('the_unspeakable_oath')) return null;
	const logs = rec.recorded.recordedLogs ?? new Set<string>();
	return logs.has(k('took_onyx_clasp')) ? 'I' : 'II';
}

/** The Doubt/Conviction sources resolved BEFORE A Phantom of Truth (the four log-derived marks).
 *  Their lean picks Phantom's Act 1 version — more Conviction than Doubt → "The Parisian Conspiracy"
 *  v. I, else v. II. */
const PRE_PHANTOM_SOURCES = new Set([
	'curtain_call',
	'reality_s_shadow',
	'echoes_of_the_past',
	'lost_soul'
]);

/** The Act 1 (A Phantom of Truth) version a play faced — Act 1 (v. I) on a DOUBT (or tied) lean
 *  ENTERING the scenario, Act 1 (v. II) on a Conviction lean; null unless the play reached Phantom.
 *  Mirrors the scenario's `check_doubt_and_conviction` setup branch: doubt ≥ conviction → Act 1 (v. I)
 *  [which also ends at R3, the doubt resolution], conviction > doubt → Act 1 (v. II) [advances to act
 *  2b → R1/R2]. Read from the four log-derived pre-Phantom marks (NOT the in-scenario `doubt_conviction`
 *  vision mark), so it is always defined for a reaching play and log-known. The version axis the shared
 *  per-version breakdown table buckets by. */
export function phantomVersionFromRecord(rec: CampaignRecord): 'I' | 'II' | null {
	const furthest = furthestResolved(rec.scenarioResolutions ?? {});
	if (furthest < STORY_SCENARIOS.indexOf('a_phantom_of_truth')) return null;
	let conviction = 0;
	let doubt = 0;
	for (const b of buildDcRun(rec).beads) {
		if (!PRE_PHANTOM_SOURCES.has(b.scenario)) continue;
		if (b.side === 'conviction') conviction += b.amount;
		else doubt += b.amount;
	}
	// Match the game: more Conviction → Act 1 (v. II); doubt OR a tie → Act 1 (v. I).
	return conviction > doubt ? 'II' : 'I';
}

/** The Doubt/Conviction sources resolved BEFORE The Pallid Mask's Act 2 check — the four pre-Phantom
 *  marks plus A Phantom of Truth's (Extra) vision mark. */
const PRE_PALLID_SOURCES = new Set([...PRE_PHANTOM_SOURCES, 'a_phantom_of_truth']);

/** How The Pallid Mask's Act 2 advanced — '+2 Conviction' or '+2 Doubt', gated in-scenario by the
 *  Conviction-vs-Doubt lean (the hidden tpm_conviction_or_doubt flag, never logged). Prefers the
 *  recorded `doubt_conviction` choice (the player's ground truth); falls back to the lean ENTERING
 *  the check (the marks before Pallid) so a play that didn't record it still buckets. Because that
 *  lean includes Phantom's Extra vision mark, the version isn't log-only-safe. Null unless reached. */
export function pallidVersionFromRecord(rec: CampaignRecord): 'conviction' | 'doubt' | null {
	const furthest = furthestResolved(rec.scenarioResolutions ?? {});
	if (furthest < STORY_SCENARIOS.indexOf('the_pallid_mask')) return null;
	const recorded = rec.scenarioChoices?.['the_pallid_mask.doubt_conviction'];
	if (recorded === 'conviction' || recorded === 'doubt') return recorded;
	let conviction = 0;
	let doubt = 0;
	for (const b of buildDcRun(rec).beads) {
		if (!PRE_PALLID_SOURCES.has(b.scenario)) continue;
		if (b.side === 'conviction') conviction += b.amount;
		else doubt += b.amount;
	}
	return conviction > doubt ? 'conviction' : 'doubt';
}

/** Resolutions that are EXCLUSIVE to one VERSION of a scenario — the version gates which ending you
 *  can reach (mirrors the campaign guide's act/agenda branches). A resolution NOT listed for a
 *  scenario is SHARED: reachable on every version (the losses + no_resolution any version can hit).
 *  Keyed scenarioId → resolutionId → the version value it belongs to (the same values the version axis
 *  uses). A scenario absent here isn't version-gated at all — e.g. The Unspeakable Oath, whose onyx
 *  clasp only swaps the Act 2 enemy and leaves every resolution reachable on both versions. */
const RESOLUTION_VERSION_GATING: Record<string, Record<string, string>> = {
	// Which Hastur you defeated decides the win: Tattered King (v. I) → R1, The King in Yellow (v. II)
	// → R2, Lord of Carcosa (v. III) → R3. The losses (R4 Carcosa merged / R5 Hastur has you) +
	// no_resolution are shared (any version can lose).
	dim_carcosa: { R1: 'I', R2: 'II', R3: 'III' },
	// Agenda 3's check_doubt_and_conviction branch: doubt ≥ conviction set up Act 1 (v. I) and ends at
	// R3 (the doubt ending); conviction advanced to act 2b → R1/R2 (v. II). no_resolution shared.
	a_phantom_of_truth: { R3: 'I', R1: 'II', R2: 'II' },
	// How Act 2 advanced (the tpm_conviction_or_doubt flag = the version): conviction → R1, doubt → R2.
	the_pallid_mask: { R1: 'conviction', R2: 'doubt' }
};

/** The resolutions reachable on `version` of `scenarioId`, in `allResolutions` order: the shared ones
 *  (gated to no version) plus this version's own. `reached` is unioned in so a resolution a play
 *  actually recorded never drops out — PtC's derived versions (Phantom's entry lean, the Pallid Act 2
 *  lean) can mis-key an edge-case play, and a lit chip must never vanish. A scenario with no gating
 *  returns the full set unchanged. */
export function reachableResolutions(
	scenarioId: string,
	version: string,
	allResolutions: string[],
	reached: ReadonlySet<string> = new Set()
): string[] {
	const gating = RESOLUTION_VERSION_GATING[scenarioId];
	if (!gating) return allResolutions;
	return allResolutions.filter(
		(r) => gating[r] === undefined || gating[r] === version || reached.has(r)
	);
}

/** Per-source Conviction / Doubt / Neutral counts across plays (by difficulty). */
function buildDcSources(records: CampaignRecord[], runs: DcRun[]): DcSourceTally[] {
	const tallies: DcSourceTally[] = DC_SOURCE_SCENARIOS.map((scenario) => ({
		scenario,
		conviction: {},
		doubt: {},
		neutral: {},
		canNeutral: DC_NEUTRAL_CAPABLE.has(scenario)
	}));
	records.forEach((rec, i) => {
		const run = runs[i];
		if (!run) return;
		const diff = run.difficulty;
		const furthest = furthestResolved(rec.scenarioResolutions ?? {});
		const bySc = new Map(run.beads.map((b) => [b.scenario, b] as const));
		for (const t of tallies) {
			const bead = bySc.get(t.scenario);
			if (bead?.side === 'conviction') bumpCount(t.conviction, diff);
			else if (bead?.side === 'doubt') bumpCount(t.doubt, diff);
			else if (t.canNeutral) {
				// no mark AND this decision can go neutral → count it as neutral once the play passed it.
				const passedBy = SOURCE_PASSED_BY[t.scenario];
				if (passedBy && furthest >= STORY_SCENARIOS.indexOf(passedBy)) bumpCount(t.neutral, diff);
			}
		}
	});
	return tallies;
}

/** The distinct special-token mixes that COULD be in the bag for `scenario`, over every path into it
 *  — the previous scenario's resolutions, plus interlude contributions (Curtain Call's Act 2b → The
 *  Last King; Reality's Shadow → Echoes). NO base bag: every transition resets-and-adds a specific
 *  mix, so a receiver scenario is never on the plain bag — only Curtain Call (the opener) is, and it
 *  isn't a receiver. */
function possibleMixesFor(scenario: string): PtcToken[][] {
	const i = STORY_SCENARIOS.indexOf(scenario);
	if (i <= 0) return [];
	const mixes = new Map<string, PtcToken[]>();
	const add = (v: PtcToken[]) => mixes.set(v.join(','), v);
	if (i === 1) {
		// The Last King ← Curtain Call's Act 2b.
		for (const v of Object.values(ACT2B_TOKENS)) add(v);
	} else if (i === 2) {
		// Echoes ← Reality's Shadow (the 2-of-a-kind) or The Last King's resolution (the 1+1+1).
		add(['cultist', 'cultist']);
		add(['tablet', 'tablet']);
		add(['elder_thing', 'elder_thing']);
		for (const [key, v] of Object.entries(RESOLUTION_TOKENS))
			if (key.startsWith('the_last_king.')) add(v);
	} else {
		const producer = STORY_SCENARIOS[i - 1];
		for (const [key, v] of Object.entries(RESOLUTION_TOKENS))
			if (key.startsWith(`${producer}.`)) add(v);
	}
	return [...mixes.values()];
}

/** Per receiving scenario, the possible token mixes + how many plays used each (by difficulty). */
function buildTokenScenarioMixes(runs: DcRun[]): TokenScenarioTally[] {
	const played = new Map<string, Map<string, Record<string, number>>>();
	for (const run of runs) {
		// Only completed runs (a win or a loss) count — an abandoned run never reached an ending.
		if (run.outcome === 'abandoned') continue;
		for (const step of run.tokenRoute) {
			if (step.scenario === 'curtain_call') continue;
			// An empty mix on a RECEIVER means the predecessor's resolution wasn't recorded — the mix is
			// unknown, not a base bag (every transition adds a specific mix). Don't tally it.
			if (step.mix.length === 0) continue;
			const key = step.mix.join(',');
			let byKey = played.get(step.scenario);
			if (!byKey) played.set(step.scenario, (byKey = new Map()));
			let byDiff = byKey.get(key);
			if (!byDiff) byKey.set(key, (byDiff = {}));
			bumpCount(byDiff, run.difficulty);
		}
	}
	return STORY_SCENARIOS.slice(1).map((scenario) => {
		const playedMixes = played.get(scenario) ?? new Map<string, Record<string, number>>();
		const seen = new Set<string>();
		const mixes = possibleMixesFor(scenario).map((mix) => {
			const key = mix.join(',');
			seen.add(key);
			const byDifficulty = playedMixes.get(key) ?? {};
			return { mix, byDifficulty, total: Object.values(byDifficulty).reduce((s, n) => s + n, 0) };
		});
		// Any actually-played mix not in the canonical "possible" set (defensive against odd data).
		for (const [key, byDifficulty] of playedMixes) {
			if (seen.has(key)) continue;
			const mix = key ? (key.split(',') as PtcToken[]) : [];
			mixes.push({ mix, byDifficulty, total: Object.values(byDifficulty).reduce((s, n) => s + n, 0) });
		}
		return { scenario, mixes };
	});
}

/** Each VIP's "home" scenario — where they reappear as an enemy and can be slain (the per-scenario
 *  `slew_vip` Extra flag). `asset` = their interview/guest card; `enemy` = their slain (monster) side.
 *  Interviewing them back at the dinner party (The Last King) grants a help bonus in this scenario. */
const VIP_HOME: Record<string, { asset: string; enemy: string }> = {
	echoes_of_the_past: { asset: '03079', enemy: '03068b' }, // Sebastien Moreau
	the_unspeakable_oath: { asset: '03076a', enemy: '03065b' }, // Constance Dumaine
	a_phantom_of_truth: { asset: '03077', enemy: '03066b' }, // Jordan Perry
	the_pallid_mask: { asset: '03078', enemy: '03067b' }, // Ishimaru Haruko
	black_stars_rise: { asset: '03080', enemy: '03069b' } // Ashleigh Clarke
};

/** The 5 PtC VIP guests, each paired to their enemy (slain) side, in guest-code order.
 *  `asset` = the interview/guest card (what VIPs Interviewed records); `enemy` = the slain
 *  card (what VIPs Slain records). Drives the VIP portrait grid (interview row = asset crops,
 *  slain row = enemy crops). */
export const VIP_ROSTER: { asset: string; enemy: string }[] = [
	{ asset: '03076a', enemy: '03065b' }, // Constance Dumaine
	{ asset: '03077', enemy: '03066b' }, // Jordan Perry
	{ asset: '03078', enemy: '03067b' }, // Ishimaru Haruko
	{ asset: '03079', enemy: '03068b' }, // Sebastien Moreau
	{ asset: '03080', enemy: '03069b' } // Ashleigh Clarke
];

const STRANGER_SCENARIOS = [
	'curtain_call',
	'the_last_king',
	'echoes_of_the_past',
	'the_unspeakable_oath',
	'a_phantom_of_truth',
	'the_pallid_mask',
	'black_stars_rise',
	'dim_carcosa'
];

/** One Doubt/Conviction decision in a single play, in campaign order. */
export interface DcBead {
	/** Scenario the decision belongs to (e.g. `curtain_call`). */
	scenario: string;
	side: 'conviction' | 'doubt';
	/** 1 or 2. */
	amount: number;
	/** true = reconstructed from the log; false = supplied via the Extra tab. */
	derived: boolean;
}

/** One play's full Doubt/Conviction run — the ordered chain plus its tallies. */
export interface DcRun {
	beads: DcBead[];
	conviction: number;
	doubt: number;
	/** This play's chaos-token route — each story scenario reached + the special-token mix it was
	 *  played WITH (the previous scenario's resolution / Act 2b mix). Powers the Chaos Tokens
	 *  widget's route rendering (same per-play runs, a different lens than the bead chain). */
	tokenRoute: TokenStep[];
	/** This play's campaign outcome: a finale win (prevented Hastur's escape), a loss (Carcosa
	 *  merged / Hastur has you), or abandoned (no finale resolution recorded). */
	outcome: 'win' | 'loss' | 'abandoned';
	/** The finale ending LOG KEY this play reached (e.g. `campaign_notes.carcosa_merged`), or null
	 *  when abandoned. Resolved to the SHARED ending text (clear-status `endingText`) for the
	 *  outcome face's hover, so it reads identically to the Campaign Overview. */
	outcomeKey: string | null;
	/** Difficulty this play was recorded at — for the per-difficulty hover breakdowns. */
	difficulty: string;
}

/** One of the 7 Doubt/Conviction sources, tallied across plays: how many earned Conviction,
 *  Doubt, or went neutral (reached the decision but took no mark), each split by difficulty. */
export interface DcSourceTally {
	scenario: string;
	conviction: Record<string, number>;
	doubt: Record<string, number>;
	neutral: Record<string, number>;
	/** Whether this decision point CAN resolve to neutral at all. Lost Soul and Black Stars Rise
	 *  always hand out a mark when reached, so their Neutral column is a dash, not a count. */
	canNeutral: boolean;
}

/** One receiving scenario's chaos-token coverage: every special-token mix the PREVIOUS scenario
 *  could feed it, and how many plays played it with that mix (split by difficulty). 0-count mixes
 *  are kept so the table shows the full set of possibilities. */
export interface TokenScenarioTally {
	scenario: string;
	mixes: { mix: PtcToken[]; byDifficulty: Record<string, number>; total: number }[];
}

/** A count plus its per-difficulty split — feeds the shared CountWithBreakdown hover. */
interface TierCount {
	total: number;
	byTier: Record<string, number>;
}

/** One random-basic-weakness DRAW: the weakness card, the investigator who drew it (paired by index
 *  with the weakness picker — see the `randomized_weakness_investigator` Extra choice; null when the
 *  investigator wasn't recorded — the weakness still shows, just without a bearer thumbnail), and the
 *  finish date (ms-since-epoch) of the play it happened in. ONE entry per draw — the weakness lists
 *  are a chronological newest-first log (not frequency-grouped), so the date both orders and labels them. */
export interface WeaknessDraw {
	weakness: string;
	bearer: string | null;
	finishDate: number | null;
}

export interface CampaignPtc {
	family: string;
	plays: number;
	// ── the spine ──
	/** Plays whose FINAL conviction > doubt / doubt > conviction / equal (both recorded). */
	doubtConviction: {
		convictionLed: number;
		doubtLed: number;
		tied: number;
		/** High-water marks across plays (null if never recorded). */
		maxConviction: number | null;
		maxDoubt: number | null;
	};
	/** Per-play ordered Doubt/Conviction chains (one per recorded play, newest-relevant order
	 *  preserved by the caller). 4 beads are log-derived, 3 come from the Extra tab. */
	doubtConvictionRuns: DcRun[];
	/** The 7 Doubt/Conviction sources tallied across plays (Conviction / Doubt / Neutral, by
	 *  difficulty) — the per-change breakdown table. Book order. */
	dcSources: DcSourceTally[];
	/** Per receiving scenario, the chaos-token mixes it could be played with and how many plays
	 *  used each (by difficulty) — the Chaos Tokens coverage table. */
	tokenScenarioMixes: TokenScenarioTally[];
	/** chasing_the_stranger final count → plays that ended at exactly that proximity. */
	strangerCounts: Record<number, number>;
	strangerPlays: number;
	/** Per-scenario Chasing-the-Stranger highscore: the most times The Man in the Pallid Mask was
	 *  defeated in a single play of that scenario (Extra-supplied; the log keeps only the campaign-wide
	 *  running total). EVERY Stranger scenario in campaign order — a scenario with no recorded defeat
	 *  shows `max: 0` (the table lists it as a dash) rather than dropping out. */
	strangerByScenario: { scenario: string; name: string; max: number }[];
	/** Special chaos tokens added to the bag across all plays, by the per-scenario
	 *  resolutions (and Curtain Call's Act 2b version). The campaign's signature quirk —
	 *  skulls stay fixed, but cultist/tablet/elder-thing accrete from your choices. */
	tokensProduced: { cultist: number; tablet: number; elder_thing: number };
	// ── VIPs (card code → plays + per-difficulty split for the portrait hover), across all scenarios ──
	vipsInterviewed: Record<string, TierCount>;
	vipsSlain: Record<string, TierCount>;
	/** Per VIP home scenario (echoes / oath / phantom / pallid / black stars rise): the returning
	 *  VIP's card pair + the player's record there. `bonus` = plays that interviewed this VIP at the
	 *  dinner party AND reached this scenario (so the interview's +1 help applied); `slainHere` =
	 *  plays that slew them in exactly this scenario (Extra `slew_vip`). Each carries a per-difficulty
	 *  split for the shared count hover. Keyed by scenario id. */
	vipHelp: Record<string, { asset: string; enemy: string; bonus: TierCount; slainHere: TierCount }>;
	// ── per scenario ──
	curtainCall: {
		warnedPolice: number;
		didNotWarn: number;
		/** Which Act 2b advanced (version id → plays) — the mid-game chaos-token mix.
		 *  Extra-supplied (the log only records the tokens, not which act). */
		act2b: Record<string, number>;
	};
	lastKing: {
		resigned: number;
		defeated: number;
		survived: number;
		/** Reality's Shadow (Interlude I) forks — reached only on the R1/resigned path
		 *  (R2-defeated and R3-survived skip the interlude). Derived from campaign notes. */
		fledParty: number;
		intrudedMeeting: number;
		slayedMonsters: number;
		/** VIP guest code → plays they were slain AT the dinner party (+ per-difficulty split for the
		 *  portrait hover; Extra picker). Attributes a kill to The Last King vs a later home-scenario
		 *  kill or the Reality's Shadow burn. */
		slainVips: Record<string, TierCount>;
		/** The most VIPs slain at the party in a single run (the highest `slain_vips` count), and the
		 *  guest codes from the MOST-RECENT run that hit that high — the "Most slain in a run" row. */
		mostSlainInRun: { count: number; vips: string[] };
	};
	echoes: {
		tookOnyx: number;
		leftOnyx: number;
		destroyedOathspeaker: number;
		followersFoundWay: number;
		/** Per resolved player count → its resolution-derived Succeed / Failed plus the per-resolution
		 *  reach tallies (the lit/dimmed set). Echoes' setup scales with player count, so the per-count
		 *  spread is its own table, rendered through the shared per-version breakdown. */
		byPlayerCount: Record<
			number,
			{ succeed: ResolutionTally | null; failed: ResolutionTally | null; tallies: Record<string, ResolutionTally> }
		>;
	};
	unspeakableOath: {
		escaped: number;
		attacked: number;
		partyClaimed: number;
		/** Interlude II: Lost Soul (the dream after the asylum) — heeded vs ignored Daniel's warning. */
		danielHeeded: number;
		danielIgnored: number;
		/** Daniel's fate (Extra; the Cuckoo's Nest condition is `danielSurvived`). */
		danielSurvived: number;
		danielPossessed: number;
		/** Investigators who went insane in the asylum (Extra picker), scoped to the viewed subject's own
		 *  investigators — never a teammate's. One entry per insanity, stamped with its play's finish date;
		 *  newest first, capped — a dated card list like the random-weakness lists. */
		insaneInvestigators: { code: string; finishDate: number | null }[];
	};
	/** A Phantom of Truth — all four mutually-exclusive Nigel outcomes (best → worst). */
	phantom: {
		foundNigel: number;
		foundNigelsHome: number;
		unableToFind: number;
		didNotEscapeGaze: number;
	};
	pallidMask: {
		enteredCatacombs: number;
		awokeInside: number;
		/** Random basic Madness/Pact weaknesses drawn for reading Act II of The King in Yellow
		 *  (Extra card picker), grouped by (weakness, bearer) with their play count, most first. */
		randomizedWeaknesses: WeaknessDraw[];
	};
	blackStarsRise: {
		pathAbove: number;
		pathBelow: number;
		carcosaMerged: number;
		/** Random basic weaknesses drawn at setup (Extra card picker), grouped by (weakness, bearer)
		 *  with their play count, most first. */
		randomizedWeaknesses: WeaknessDraw[];
	};
	dimCarcosa: {
		preventedEscape: number;
		possessed: number;
		hasturHasYou: number;
		/** Plays where Carcosa merged with our world AT the finale (Dim Carcosa R4). The `carcosa_merged`
		 *  note is shared with Black Stars Rise, so it's attributed here only on an explicit Dim Carcosa
		 *  R4 resolution; the naive (no-resolution) case is counted under Black Stars Rise instead. */
		carcosaMerged: number;
		/** Investigators recorded as possessed at the end — the repeatable `possessed` campaign-note
		 *  `#name#` picks (log-derived), scoped to the viewed subject's own investigators, each stamped
		 *  with its play's finish date. Newest first, capped — the Possessed Investigators list. */
		possessedInvestigators: { code: string; finishDate: number | null }[];
		/** The doom added to agenda 1a at setup, set by the Chasing-the-Stranger tally AT ARRIVAL — the
		 *  final campaign tally minus the marks earned within Dim Carcosa (its `stranger_defeats` Extra).
		 *  Tiers: ≤2 → 3 doom, 3-5 → 2, 6-8 → 1, ≥9 → 0. Keyed by the doom amount (`'3'`/`'2'`/`'1'`/`'0'`)
		 *  → that tier's resolution-derived Succeed / Failed + per-resolution reach (the shared per-version
		 *  breakdown, doom tier as the axis — like Echoes' per-player-count table). Only plays that
		 *  recorded a Dim Carcosa resolution. */
		strangerArrivalDoom: Record<
			string,
			{ succeed: ResolutionTally | null; failed: ResolutionTally | null; tallies: Record<string, ResolutionTally> }
		>;
	};
}


/**
 * One play's ordered Doubt/Conviction chain. The 7 campaign-wide decisions, in book
 * order: four are reconstructed from campaign notes (Curtain Call, Reality's Shadow,
 * Echoes, Lost Soul) and three come from the Extra tab (Phantom, Pallid Mask, Black
 * Stars Rise), which the log never records. A "neither" choice (fled the party, the
 * onyx clasp destroyed, BSR's 1a-not-current) adds no bead.
 */
function buildDcRun(rec: CampaignRecord): DcRun {
	const logs = rec.recorded.recordedLogs ?? new Set<string>();
	const note = noteReader(logs);
	const choices = rec.scenarioChoices ?? {};
	const beads: DcBead[] = [];

	const fromLog = (scenario: string, convNote: string, doubtNote: string, amount: number) => {
		if (note(convNote)) beads.push({ scenario, side: 'conviction', amount, derived: true });
		else if (note(doubtNote)) beads.push({ scenario, side: 'doubt', amount, derived: true });
	};
	const fromExtra = (scenario: string, amount: number) => {
		const v = choices[`${scenario}.doubt_conviction`];
		if (v === 'conviction') beads.push({ scenario, side: 'conviction', amount, derived: false });
		else if (v === 'doubt') beads.push({ scenario, side: 'doubt', amount, derived: false });
		// 'neither' or unset → no bead
	};

	fromLog('curtain_call', 'tried_to_warn_police', 'chose_not_to_warn_police', 1);
	fromLog('reality_s_shadow', 'slayed_the_monsters', 'intruded_on_secret_meeting', 1);
	fromLog('echoes_of_the_past', 'took_onyx_clasp', 'left_onyx_clasp', 1);
	fromLog('lost_soul', 'heeded_daniels_warning', 'ignored_daniels_warning', 2);
	fromExtra('a_phantom_of_truth', 1);
	fromExtra('the_pallid_mask', 2);
	fromExtra('black_stars_rise', 1);

	const sum = (side: 'conviction' | 'doubt') =>
		beads.filter((b) => b.side === side).reduce((s, b) => s + b.amount, 0);
	const conviction = sum('conviction');
	const doubt = sum('doubt');
	// Campaign outcome from the Dim Carcosa finale notes (its one win vs the two losses). The exact
	// ending KEY is carried so the outcome face resolves the same wording as the Campaign Overview.
	const outcomeKey = note('prevented_hasturs_escape')
		? k('prevented_hasturs_escape')
		: note('carcosa_merged')
			? k('carcosa_merged')
			: note('hastur_has_you')
				? k('hastur_has_you')
				: null;
	const outcome: 'win' | 'loss' | 'abandoned' =
		outcomeKey === k('prevented_hasturs_escape') ? 'win' : outcomeKey ? 'loss' : 'abandoned';

	return {
		beads,
		conviction,
		doubt,
		tokenRoute: buildTokenRoute(rec),
		outcome,
		outcomeKey,
		difficulty: rec.recorded.difficulty ?? 'standard'
	};
}

export function buildPtc(records: CampaignRecord[]): CampaignPtc[] {
	const baseLog = getCampaignLog(PTC_FAMILY);
	if (!baseLog) return [];
	const ptcRecords = filterFamilyRecords(records, PTC_FAMILY);
	if (ptcRecords.length === 0) return [];
	// Echoes' per-player-count Succeed / Failed split keys off the scenario's resolution verdicts.
	const echoesOutcomes = (baseLog.db.scenarioMeta?.find((m) => m.id === 'echoes_of_the_past')
		?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>;
	// Dim Carcosa's resolution → win/loss verdicts feed the doom-tier table's Succeed / Failed split.
	const dimCarcosaOutcomes = (baseLog.db.scenarioMeta?.find((m) => m.id === 'dim_carcosa')
		?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>;

	const dc = { convictionLed: 0, doubtLed: 0, tied: 0, maxConviction: null as number | null, maxDoubt: null as number | null };
	const doubtConvictionRuns = ptcRecords.map(buildDcRun);
	const dcSources = buildDcSources(ptcRecords, doubtConvictionRuns);
	const tokenScenarioMixes = buildTokenScenarioMixes(doubtConvictionRuns);
	const strangerCounts: Record<number, number> = {};
	let strangerPlays = 0;
	const strangerMax: Record<string, number> = {};
	const tokensProduced = { cultist: 0, tablet: 0, elder_thing: 0 };
	const vipsInterviewed: Record<string, TierCount> = {};
	const vipsSlain: Record<string, TierCount> = {};
	// Bump a (code → TierCount) map for every code in a set, by difficulty — powers the VIP portrait hover.
	const bumpVipTier = (
		map: Record<string, TierCount>,
		codes: ReadonlySet<string> | undefined,
		tier: string
	) => {
		for (const code of codes ?? []) {
			const tc = (map[code] ??= { total: 0, byTier: {} });
			tc.total += 1;
			bumpCount(tc.byTier, tier);
		}
	};
	const vipHelp: Record<
		string,
		{ asset: string; enemy: string; bonus: TierCount; slainHere: TierCount }
	> = {};
	for (const [sc, { asset, enemy }] of Object.entries(VIP_HOME))
		vipHelp[sc] = {
			asset,
			enemy,
			bonus: { total: 0, byTier: {} },
			slainHere: { total: 0, byTier: {} }
		};
	const curtainCall = { warnedPolice: 0, didNotWarn: 0, act2b: {} as Record<string, number> };
	const lastKing = { resigned: 0, defeated: 0, survived: 0, fledParty: 0, intrudedMeeting: 0, slayedMonsters: 0, slainVips: {} as Record<string, TierCount>, mostSlainInRun: { count: 0, vips: [] as string[] } };
	// Finish date of the run currently holding `mostSlainInRun` — ties on count go to the most recent.
	let mostSlainDate = -Infinity;
	const echoes = {
		tookOnyx: 0,
		leftOnyx: 0,
		destroyedOathspeaker: 0,
		followersFoundWay: 0,
		byPlayerCount: {} as Record<
			number,
			{ succeed: ResolutionTally | null; failed: ResolutionTally | null; tallies: Record<string, ResolutionTally> }
		>
	};
	const unspeakableOath = { escaped: 0, attacked: 0, partyClaimed: 0, danielHeeded: 0, danielIgnored: 0, danielSurvived: 0, danielPossessed: 0, insaneInvestigators: [] as { code: string; finishDate: number | null }[] };
	// Insanity accumulator: one entry per insanity, subject-scoped + dated; sorted newest-first and
	// capped after the loop — a dated card list like the random-weakness lists.
	const insaneAcc: { code: string; finishDate: number | null }[] = [];
	// Random-weakness accumulators: key `<weakness>|<bearer>` → tally. Filled per play by zipping the
	// weakness picker with the investigator picker (paired by index), finalized after the loop.
	const pallidWeak: WeaknessDraw[] = [];
	const bsrWeak: WeaknessDraw[] = [];
	// Possessed investigators (Dim Carcosa): one entry per possessed pick, subject-scoped + dated,
	// finalized (newest first, capped) after the loop — mirrors the random-weakness lists.
	const possessedAcc: { code: string; finishDate: number | null }[] = [];
	const addWeaknessDraws = (
		out: WeaknessDraw[],
		weaknessCsv: string,
		bearerCsv: string,
		subjInv: ReadonlySet<string>,
		finishDate: number | null
	) => {
		const subjCanon = new Set([...subjInv].map(canonInvestigatorCode));
		const bearers = bearerCsv.split(',').filter(Boolean);
		weaknessCsv
			.split(',')
			.filter(Boolean)
			.forEach((weakness, i) => {
				// Canonicalize the bearer to its base printing (a parallel / promo investigator → base
				// code) so it matches the roster regardless of which version was recorded. Then scope to the
				// viewed subject: drop a weakness attributed to a teammate's investigator (a single-player
				// profile shows only its own; a play group merges every member's). Unattributed draws (no
				// bearer — legacy data) are kept, since they can't be scoped. ONE entry per draw, stamped
				// with the play's finish date — the list is chronological (newest first), not grouped.
				const bearer = bearers[i] ? canonInvestigatorCode(bearers[i]) : null;
				if (bearer && !subjCanon.has(bearer)) return;
				out.push({ weakness, bearer, finishDate });
			});
	};
	const phantom = { foundNigel: 0, foundNigelsHome: 0, unableToFind: 0, didNotEscapeGaze: 0 };
	const pallidMask = {
		enteredCatacombs: 0,
		awokeInside: 0,
		randomizedWeaknesses: [] as WeaknessDraw[]
	};
	const blackStarsRise = {
		pathAbove: 0,
		pathBelow: 0,
		carcosaMerged: 0,
		randomizedWeaknesses: [] as WeaknessDraw[]
	};
	const dimCarcosa = {
		preventedEscape: 0,
		possessed: 0,
		hasturHasYou: 0,
		carcosaMerged: 0,
		possessedInvestigators: [] as { code: string; finishDate: number | null }[],
		strangerArrivalDoom: {} as Record<
			string,
			{ succeed: ResolutionTally | null; failed: ResolutionTally | null; tallies: Record<string, ResolutionTally> }
		>
	};

	for (const rec of ptcRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);
		const counts = rec.recorded.logCounts ?? {};

		// Doubt vs Conviction — final totals (count sections). Only count a play that
		// recorded at least one (so untouched plays don't skew "tied").
		const conv = counts['conviction'];
		const doubt = counts['doubt'];
		if (conv !== undefined || doubt !== undefined) {
			const c = conv ?? 0;
			const d = doubt ?? 0;
			if (c > d) dc.convictionLed += 1;
			else if (d > c) dc.doubtLed += 1;
			else dc.tied += 1;
			dc.maxConviction = dc.maxConviction === null ? c : Math.max(dc.maxConviction, c);
			dc.maxDoubt = dc.maxDoubt === null ? d : Math.max(dc.maxDoubt, d);
		}

		// The Stranger's pursuit.
		const stranger = counts['chasing_the_stranger'];
		if (stranger !== undefined) {
			strangerCounts[stranger] = (strangerCounts[stranger] ?? 0) + 1;
			strangerPlays += 1;
		}

		// Per-scenario Stranger-defeat highscore: keep the best single play. Curtain Call (the tutorial)
		// adds its marks automatically — 2 if you went to the police either way (R1 warned / R2 chose not
		// to), else 1 — so it's derived from the warn-police notes, never asked. The rest read the manual
		// Extra counter.
		for (const sc of STRANGER_SCENARIOS) {
			let n: number;
			if (sc === 'curtain_call') {
				n = has(k('tried_to_warn_police')) || has(k('chose_not_to_warn_police')) ? 2 : 1;
			} else {
				const raw = rec.scenarioChoices?.[`${sc}.stranger_defeats`];
				n = raw ? Number(raw) : 0;
			}
			if (Number.isFinite(n) && n > 0) {
				strangerMax[sc] = Math.max(strangerMax[sc] ?? 0, n);
			}
		}

		// Special chaos tokens produced for the next scenario (per recorded resolution + Act 2b).
		for (const [sc, res] of Object.entries(rec.scenarioResolutions ?? {})) {
			for (const t of RESOLUTION_TOKENS[`${sc}.${res}`] ?? []) tokensProduced[t] += 1;
		}
		for (const t of ACT2B_TOKENS[rec.scenarioChoices?.['curtain_call.act_2b'] ?? ''] ?? [])
			tokensProduced[t] += 1;

		// VIPs interviewed / slain — across every scenario (card sections), with a per-difficulty split.
		const vipDiff = rec.recorded.difficulty ?? 'standard';
		const interviewedThisPlay = rec.recorded.recordedSectionItems?.[VIPS_INTERVIEWED];
		bumpVipTier(vipsInterviewed, interviewedThisPlay, vipDiff);
		bumpVipTier(vipsSlain, rec.recorded.recordedSectionItems?.[VIPS_SLAIN], vipDiff);
		// VIP help bonus + per-scenario slaying, keyed by the VIP's home scenario. Interviewing them
		// at the dinner party (The Last King) confers a +1 in that home scenario, so count plays that
		// interviewed the VIP AND reached the scenario; plus plays that slew them in exactly that one.
		const reachedIdx = furthestResolved(rec.scenarioResolutions ?? {});
		for (const [sc, vh] of Object.entries(vipHelp)) {
			if (interviewedThisPlay?.has(vh.asset) && reachedIdx >= STORY_SCENARIOS.indexOf(sc)) {
				vh.bonus.total += 1;
				bumpCount(vh.bonus.byTier, vipDiff);
			}
			if (rec.scenarioChoices?.[`${sc}.slew_vip`] === 'slain') {
				vh.slainHere.total += 1;
				bumpCount(vh.slainHere.byTier, vipDiff);
			}
		}

		// Curtain Call.
		if (has(k('tried_to_warn_police'))) curtainCall.warnedPolice += 1;
		if (has(k('chose_not_to_warn_police'))) curtainCall.didNotWarn += 1;
		// Act 2b version (Extra) — base curtain_call or RT's return_to_curtain_call.
		const act2b =
			rec.scenarioChoices?.['curtain_call.act_2b'] ??
			rec.scenarioChoices?.['return_to_curtain_call.act_2b'];
		if (act2b) curtainCall.act2b[act2b] = (curtainCall.act2b[act2b] ?? 0) + 1;

		// The Last King — resolution-only (no campaign note); from the Extra tab.
		const lkRes = rec.scenarioResolutions?.['the_last_king'];
		if (lkRes === 'no_resolution_resigned') lastKing.resigned += 1;
		else if (lkRes === 'no_resolution_defeated') lastKing.defeated += 1;
		else if (lkRes === 'R3') lastKing.survived += 1;

		// Reality's Shadow (Interlude I) — only the resigned/R1 path plays it; the fork
		// you took there is a campaign note (the burn-the-house slaughter rides "slayed").
		if (has(k('fled_dinner_party'))) lastKing.fledParty += 1;
		if (has(k('intruded_on_secret_meeting'))) lastKing.intrudedMeeting += 1;
		if (has(k('slayed_the_monsters'))) lastKing.slayedMonsters += 1;
		// VIPs slain AT the dinner party (Extra picker; comma-joined guest codes) — attributes a
		// kill to The Last King rather than a later home scenario or the Reality's Shadow burn.
		const slainThisRun = (rec.scenarioChoices?.['the_last_king.slain_vips'] ?? '')
			.split(',')
			.filter(Boolean);
		for (const code of slainThisRun) {
			const tc = (lastKing.slainVips[code] ??= { total: 0, byTier: {} });
			tc.total += 1;
			bumpCount(tc.byTier, vipDiff);
		}
		// "Most slain in a run": the highest single-run slain count; a tie goes to the most recent run.
		const slainWhen = rec.finishDate ?? -Infinity;
		if (
			slainThisRun.length > 0 &&
			(slainThisRun.length > lastKing.mostSlainInRun.count ||
				(slainThisRun.length === lastKing.mostSlainInRun.count && slainWhen >= mostSlainDate))
		) {
			lastKing.mostSlainInRun = { count: slainThisRun.length, vips: slainThisRun };
			mostSlainDate = slainWhen;
		}

		// Echoes of the Past.
		if (has(k('took_onyx_clasp'))) echoes.tookOnyx += 1;
		if (has(k('left_onyx_clasp'))) echoes.leftOnyx += 1;
		if (has(k('destroyed_the_oathspeaker'))) echoes.destroyedOathspeaker += 1;
		if (has(k('followers_of_sign_found_way'))) echoes.followersFoundWay += 1;
		// Per-player-count table: Echoes' setup scales with player count, so bucket each play by its
		// resolved count, tally the resolution it reached, and split Succeed / Failed off the verdict
		// (no_resolution is a loss, so it lands in Failed). No row for counts never played.
		{
			const pc = rec.playerCount;
			const res = rec.scenarioResolutions?.['echoes_of_the_past'];
			if (pc != null && pc > 0 && res) {
				const tier = rec.recorded.difficulty ?? 'standard';
				const bucket = (echoes.byPlayerCount[pc] ??= { succeed: null, failed: null, tallies: {} });
				bumpTally((bucket.tallies[res] ??= emptyTally()), tier);
				const verdict = echoesOutcomes[res];
				if (verdict === 'win') bumpTally((bucket.succeed ??= emptyTally()), tier);
				else if (verdict === 'loss') bumpTally((bucket.failed ??= emptyTally()), tier);
			}
		}

		// The Unspeakable Oath — the whole party can be claimed (a fresh party continues).
		if (has(k('escaped_the_asylum'))) unspeakableOath.escaped += 1;
		if (has(k('attacked_as_you_escaped_arkham'))) unspeakableOath.attacked += 1;
		if (has(k('king_claimed_victims'))) unspeakableOath.partyClaimed += 1;
		// Interlude II: Lost Soul — the dream after the asylum (heed vs ignore Daniel's warning).
		if (has(k('heeded_daniels_warning'))) unspeakableOath.danielHeeded += 1;
		if (has(k('ignored_daniels_warning'))) unspeakableOath.danielIgnored += 1;
		// Daniel's fate (Extra) — `survived` is the Cuckoo's Nest condition.
		const danielFate = rec.scenarioChoices?.['the_unspeakable_oath.daniel_fate'];
		if (danielFate === 'survived') unspeakableOath.danielSurvived += 1;
		else if (danielFate === 'possessed') unspeakableOath.danielPossessed += 1;
		// Who went insane in the asylum (Extra picker; comma-joined investigator codes). Keep ONLY
		// the viewed subject's own investigators (intersect with this play's subjectInvestigators),
		// so a single-player profile never surfaces a teammate's insanity. Track recency for ordering.
		{
			const subjInv = new Set((rec.subjectInvestigators ?? []).map(canonInvestigatorCode));
			const when = rec.finishDate ?? null;
			for (const raw of (rec.scenarioChoices?.['the_unspeakable_oath.insane_investigators'] ?? '')
				.split(',')
				.filter(Boolean)) {
				const code = canonInvestigatorCode(raw);
				if (subjInv.has(code)) insaneAcc.push({ code, finishDate: when });
			}
		}

		// A Phantom of Truth — four mutually-exclusive Nigel outcomes.
		if (has(k('found_nigel_engram'))) phantom.foundNigel += 1;
		if (has(k('found_nigels_home'))) phantom.foundNigelsHome += 1;
		if (has(k('unable_to_find_nigel'))) phantom.unableToFind += 1;
		if (has(k('did_not_escape_gaze'))) phantom.didNotEscapeGaze += 1;

		// The Pallid Mask.
		if (has(k('entered_catacombs'))) pallidMask.enteredCatacombs += 1;
		if (has(k('awoke_inside_catacombs'))) pallidMask.awokeInside += 1;
		// Random basic Madness/Pact weaknesses drawn for reading Act II, attributed to the investigator
		// who drew each (Extra pickers, paired by index).
		addWeaknessDraws(
			pallidWeak,
			rec.scenarioChoices?.['the_pallid_mask.randomized_weakness'] ?? '',
			rec.scenarioChoices?.['the_pallid_mask.randomized_weakness_investigator'] ?? '',
			new Set(rec.subjectInvestigators ?? []),
			rec.finishDate ?? null
		);

		// Black Stars Rise — the path taken (a loss opens neither).
		if (has(k('opened_path_above'))) blackStarsRise.pathAbove += 1;
		if (has(k('opened_path_below'))) blackStarsRise.pathBelow += 1;
		// "carcosa_merged" is a SHARED note — Black Stars Rise R3 (its loss) OR Dim Carcosa R4 (the
		// finale's merge). Discriminate by the explicit Extra resolutions: only BSR R3 counts here. With
		// NEITHER scenario resolved, naively attribute the bare note to BSR (its TERMINAL_NOTES home).
		const bsrRes = rec.scenarioResolutions?.['black_stars_rise'];
		const dimResForMerge = rec.scenarioResolutions?.['dim_carcosa'];
		if (
			bsrRes === 'R3' ||
			(bsrRes === undefined && dimResForMerge === undefined && has(k('carcosa_merged')))
		) {
			blackStarsRise.carcosaMerged += 1;
		}
		// The randomized basic weaknesses added at setup, attributed to who drew each (Extra pickers,
		// paired by index).
		addWeaknessDraws(
			bsrWeak,
			rec.scenarioChoices?.['black_stars_rise.randomized_weakness'] ?? '',
			rec.scenarioChoices?.['black_stars_rise.randomized_weakness_investigator'] ?? '',
			new Set(rec.subjectInvestigators ?? []),
			rec.finishDate ?? null
		);

		// Dim Carcosa — the one win (prevented escape) + the losses. `possessed` is NOT a
		// win/loss; it just flags that investigators ended possessed (triggers the Epilogue),
		// and co-occurs with the win resolutions — a neutral state count, not an ending.
		if (has(k('prevented_hasturs_escape'))) dimCarcosa.preventedEscape += 1;
		if (has(k('possessed'))) dimCarcosa.possessed += 1;
		if (has(k('hastur_has_you'))) dimCarcosa.hasturHasYou += 1;
		// "Carcosa merged" attributed to the finale: only Dim Carcosa's explicit R4 (the shared note's
		// naive no-resolution case is counted under Black Stars Rise, never double-counted here).
		if (rec.scenarioResolutions?.['dim_carcosa'] === 'R4') dimCarcosa.carcosaMerged += 1;
		// WHO was possessed at the end — the repeatable `possessed` campaign-note #name# picks (log),
		// scoped to the viewed subject's own investigators (canonicalized), stamped with the play's date.
		{
			const subjInv = new Set((rec.subjectInvestigators ?? []).map(canonInvestigatorCode));
			const when = rec.finishDate ?? null;
			for (const raw of rec.possessedInvestigators ?? []) {
				const code = canonInvestigatorCode(raw);
				if (subjInv.has(code)) possessedAcc.push({ code, finishDate: when });
			}
		}
		// Chasing-the-Stranger tally AT ARRIVAL (final campaign count minus the marks earned within Dim
		// Carcosa) sets the doom on agenda 1a at setup: ≤2 → 3, 3-5 → 2, 6-8 → 1, ≥9 → 0. Only plays
		// that recorded a Dim Carcosa resolution, tallying that resolution's Succeed / Failed
		// (campaign-data verdicts) + the per-resolution reach — the shared per-version breakdown with
		// the doom tier as the axis (mirrors Echoes' per-player-count table).
		const dimRes = rec.scenarioResolutions?.['dim_carcosa'];
		if (dimRes) {
			const finalTally = counts['chasing_the_stranger'] ?? 0;
			const dcMarks = Number(rec.scenarioChoices?.['dim_carcosa.stranger_defeats'] ?? 0);
			const atArrival = Math.max(0, finalTally - (Number.isFinite(dcMarks) ? dcMarks : 0));
			const doom = atArrival <= 2 ? 3 : atArrival <= 5 ? 2 : atArrival <= 8 ? 1 : 0;
			const tier = rec.recorded.difficulty ?? 'standard';
			const bucket = (dimCarcosa.strangerArrivalDoom[String(doom)] ??= {
				succeed: null,
				failed: null,
				tallies: {}
			});
			bumpTally((bucket.tallies[dimRes] ??= emptyTally()), tier);
			const verdict = dimCarcosaOutcomes[dimRes];
			if (verdict === 'win') bumpTally((bucket.succeed ??= emptyTally()), tier);
			else if (verdict === 'loss') bumpTally((bucket.failed ??= emptyTally()), tier);
		}
	}

	// Insanity (Unspeakable Oath): newest insanity first (the play's finish date), cap 7 — like the
	// weakness lists. Already scoped to the viewed player's own investigators inside the loop.
	unspeakableOath.insaneInvestigators = insaneAcc
		.sort((a, b) => (b.finishDate ?? -Infinity) - (a.finishDate ?? -Infinity))
		.slice(0, 7);

	// Random weaknesses: newest draw first (the play's finish date; undated draws sort last), cap 7.
	const finalizeWeaknesses = (draws: WeaknessDraw[]): WeaknessDraw[] =>
		[...draws].sort((a, b) => (b.finishDate ?? -Infinity) - (a.finishDate ?? -Infinity)).slice(0, 7);
	pallidMask.randomizedWeaknesses = finalizeWeaknesses(pallidWeak);
	blackStarsRise.randomizedWeaknesses = finalizeWeaknesses(bsrWeak);
	// Possessed investigators: newest possession first (the play's finish date), cap 7 — like the weakness lists.
	dimCarcosa.possessedInvestigators = possessedAcc
		.sort((a, b) => (b.finishDate ?? -Infinity) - (a.finishDate ?? -Infinity))
		.slice(0, 7);

	return [
		{
			family: PTC_FAMILY,
			plays: ptcRecords.length,
			doubtConviction: dc,
			doubtConvictionRuns,
			dcSources,
			tokenScenarioMixes,
			strangerCounts,
			strangerPlays,
			strangerByScenario: STRANGER_SCENARIOS.map((sc) => ({
				scenario: sc,
				name: baseLog.en.scenarioNames?.[sc] ?? sc,
				max: strangerMax[sc] ?? 0
			})),
			tokensProduced,
			vipsInterviewed,
			vipsSlain,
			vipHelp,
			curtainCall,
			lastKing,
			echoes,
			unspeakableOath,
			phantom,
			pallidMask,
			blackStarsRise,
			dimCarcosa
		}
	];
}
