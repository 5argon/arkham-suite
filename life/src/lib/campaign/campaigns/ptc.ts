/** The Path to Carcosa per-campaign tallies. */
import type { CampaignRecord } from '../records/campaign-record';
import { countNotes, noteKey, readPlay, tallyPlays, type Play } from '../records/play';
import { canonInvestigatorCode } from '../utils/card-filters';
import type { SignatureRuns } from '../utils/signature-runs';
import { bumpTally, ensureTally, recentFirst, type Tally } from '../utils/tally';
import { defineCampaignBuilder } from './define';
import {
	signatureSideRuns,
	sideTotals,
	tallySources,
	type SideBead,
	type SideRun,
	type SourceTally
} from './two-sided';

/** The story scenarios in play order. */
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
const storyIndex = (scenario: string) => STORY_SCENARIOS.indexOf(scenario);

/** The furthest story scenario the play recorded a resolution for; −1 when none. */
function reachedIndex(p: Play): number {
	let reached = -1;
	STORY_SCENARIOS.forEach((s, i) => {
		if (p.resolution(s) !== undefined) reached = i;
	});
	return reached;
}

// ── Doubt / Conviction ──

export type DcSide = 'conviction' | 'doubt';
export const DC_SIDES = ['conviction', 'doubt'] as const;
export type DcBead = SideBead<DcSide>;

/** A play's Doubt/Conviction chain, with the chaos-token route it walked. */
export interface DcRun extends SideRun<DcSide> {
	tokenRoute: TokenStep[];
}

/** The decision points that hand out Doubt or Conviction, in book order. */
export const DC_SOURCE_SCENARIOS = [
	'curtain_call',
	'reality_s_shadow',
	'echoes_of_the_past',
	'lost_soul',
	'a_phantom_of_truth',
	'the_pallid_mask',
	'black_stars_rise'
];

/** Decisions the log records: [source, Conviction note, Doubt note, marks]. */
const LOG_SOURCES: [string, string, string, number][] = [
	['curtain_call', 'tried_to_warn_police', 'chose_not_to_warn_police', 1],
	['reality_s_shadow', 'slayed_the_monsters', 'intruded_on_secret_meeting', 1],
	['echoes_of_the_past', 'took_onyx_clasp', 'left_onyx_clasp', 1],
	['lost_soul', 'heeded_daniels_warning', 'ignored_daniels_warning', 2]
];
/** Decisions the log never records, entered as the Extra `doubt_conviction` choice: [source, marks]. */
const EXTRA_SOURCES: [string, number][] = [
	['a_phantom_of_truth', 1],
	['the_pallid_mask', 2],
	['black_stars_rise', 1]
];

/** Decisions that can pass without a mark (fleeing the party, destroying the clasp, too few
 *  Stranger marks at Phantom, failing early), each passed once the named story scenario resolves.
 *  Lost Soul and Black Stars Rise always hand out a mark. */
const DC_NEUTRAL_PASSED_BY: Record<string, string> = {
	curtain_call: 'the_last_king',
	reality_s_shadow: 'echoes_of_the_past',
	echoes_of_the_past: 'the_unspeakable_oath',
	a_phantom_of_truth: 'the_pallid_mask',
	the_pallid_mask: 'black_stars_rise'
};

function dcBeads(p: Play): DcBead[] {
	const beads: DcBead[] = [];
	for (const [scenario, conviction, doubt, amount] of LOG_SOURCES) {
		const side = p.has(conviction) ? 'conviction' : p.has(doubt) ? 'doubt' : null;
		if (side) beads.push({ scenario, side, amount });
	}
	for (const [scenario, amount] of EXTRA_SOURCES) {
		const side = p.choice(scenario, 'doubt_conviction');
		if (side === 'conviction' || side === 'doubt') beads.push({ scenario, side, amount });
	}
	return beads;
}

/** The side the marks from `sources` lean to; a tie leans to Doubt. */
function leanOf(beads: DcBead[], sources: ReadonlySet<string>): DcSide {
	const t = sideTotals(
		DC_SIDES,
		beads.filter((b) => sources.has(b.scenario))
	);
	return t.conviction > t.doubt ? 'conviction' : 'doubt';
}

// ── Chaos tokens ──

export type PtcToken = 'cultist' | 'tablet' | 'elder_thing';

/** One story scenario of a play with the special-token mix in the bag while playing it. */
export interface TokenStep {
	scenario: string;
	mix: PtcToken[];
}

/** The special tokens a resolution puts in the bag for the next scenario, keyed
 *  `scenario.resolution` (the recorded value: The Last King's R2 is `no_resolution_defeated`). */
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
/** The Last King is played with the mix of Curtain Call's Act 2b (Extra). */
const ACT2B_TOKENS: Record<string, PtcToken[]> = {
	a_city_aflame: ['cultist', 'cultist'],
	the_path_is_mine: ['tablet', 'tablet'],
	the_shores_of_hali: ['elder_thing', 'elder_thing']
};
/** On the resigned path Echoes is played with the mix of the Reality's Shadow choice instead. */
const INTERLUDE_TOKENS: [string, PtcToken[]][] = [
	['slayed_the_monsters', ['cultist', 'cultist']],
	['fled_dinner_party', ['tablet', 'tablet']],
	['intruded_on_secret_meeting', ['elder_thing', 'elder_thing']]
];

/** The mix the transition into `STORY_SCENARIOS[i]` adds. Every transition removes the special
 *  tokens before adding, so this is the whole mix; empty when the transition is unknown. */
function receivedMix(i: number, p: Play): PtcToken[] {
	if (i <= 0) return [];
	if (i === 1) return ACT2B_TOKENS[p.choice('curtain_call', 'act_2b') ?? ''] ?? [];
	if (i === 2) {
		const interlude = INTERLUDE_TOKENS.find(([note]) => p.has(note));
		if (interlude) return interlude[1];
	}
	const prev = STORY_SCENARIOS[i - 1];
	return RESOLUTION_TOKENS[`${prev}.${p.resolution(prev)}`] ?? [];
}

/** The mixes a receiving scenario can be played with, over every path into it. */
function possibleMixes(scenario: string): PtcToken[][] {
	const i = storyIndex(scenario);
	const producer = STORY_SCENARIOS[i - 1];
	const candidates =
		i === 1
			? Object.values(ACT2B_TOKENS)
			: [
					...(i === 2 ? INTERLUDE_TOKENS.map(([, mix]) => mix) : []),
					...Object.entries(RESOLUTION_TOKENS)
						.filter(([key]) => key.startsWith(`${producer}.`))
						.map(([, mix]) => mix)
				];
	return [...new Map(candidates.map((mix) => [mix.join(','), mix])).values()];
}

/** Campaign endings: the scenario each ends the campaign at and its outcome. Carcosa merging with
 *  our world is a Black Stars Rise loss. */
const ENDINGS: { note: string; scenario: string; outcome: 'win' | 'loss' }[] = [
	{ note: 'prevented_hasturs_escape', scenario: 'dim_carcosa', outcome: 'win' },
	{ note: 'carcosa_merged', scenario: 'black_stars_rise', outcome: 'loss' },
	{ note: 'hastur_has_you', scenario: 'dim_carcosa', outcome: 'loss' }
];

/** Each story scenario the play reached with the mix it was played with. A transition that adds
 *  nothing known keeps the previous mix; the route ends at the furthest resolution, or where an
 *  ending note ends the campaign. */
function tokenRoute(p: Play): TokenStep[] {
	const ends = ENDINGS.filter((e) => p.has(e.note)).map((e) => storyIndex(e.scenario));
	const last = ends.length ? Math.max(...ends) : reachedIndex(p);
	const route: TokenStep[] = [];
	let mix: PtcToken[] = [];
	for (let i = 0; i <= last; i++) {
		const fed = receivedMix(i, p);
		if (fed.length) mix = fed;
		route.push({ scenario: STORY_SCENARIOS[i], mix });
	}
	return route;
}

function dcRun(p: Play): DcRun {
	const beads = dcBeads(p);
	const ending = ENDINGS.find((e) => p.has(e.note));
	return {
		beads,
		totals: sideTotals(DC_SIDES, beads),
		outcomeKey: ending ? noteKey(ending.note) : null,
		outcome: ending?.outcome ?? null,
		tokenRoute: tokenRoute(p)
	};
}

/** One receiving scenario: every mix it can be played with and the finished plays that did. */
export interface TokenScenarioTally {
	scenario: string;
	mixes: { mix: PtcToken[]; plays: Tally }[];
}

/** Dim Carcosa always shows; the other receivers once played with a known mix. */
function tokenMixes(runs: { play: Play; run: DcRun }[]): TokenScenarioTally[] {
	return STORY_SCENARIOS.slice(1).flatMap((scenario) => {
		const played: Record<string, Tally> = {};
		for (const { play, run } of runs) {
			if (!run.outcome) continue;
			const step = run.tokenRoute.find((s) => s.scenario === scenario);
			if (step?.mix.length) bumpTally(ensureTally(played, step.mix.join(',')), play.tier);
		}
		const possible = possibleMixes(scenario).map((mix) => mix.join(','));
		const keys = [...possible, ...Object.keys(played).filter((k) => !possible.includes(k))];
		const mixes = keys.map((key) => ({
			mix: key.split(',') as PtcToken[],
			plays: played[key] ?? { total: 0, byTier: {} }
		}));
		return scenario === 'dim_carcosa' || Object.keys(played).length ? [{ scenario, mixes }] : [];
	});
}

// ── Version axes (see VERSION_AXES) ──

const PRE_PHANTOM_SOURCES = new Set([
	'curtain_call',
	'reality_s_shadow',
	'echoes_of_the_past',
	'lost_soul'
]);
const PRE_PALLID_SOURCES = new Set([...PRE_PHANTOM_SOURCES, 'a_phantom_of_truth']);

/** The Unspeakable Oath's Act 2: v. I when the onyx clasp was taken in Echoes, else v. II. */
export function oathVersionFromRecord(rec: CampaignRecord): 'I' | 'II' | null {
	const p = readPlay(rec);
	if (reachedIndex(p) < storyIndex('the_unspeakable_oath')) return null;
	return p.has('took_onyx_clasp') ? 'I' : 'II';
}

/** A Phantom of Truth's Act 1, set by the lean entering it: v. II on more Conviction than Doubt,
 *  else v. I (which ends at R3). */
export function phantomVersionFromRecord(rec: CampaignRecord): 'I' | 'II' | null {
	const p = readPlay(rec);
	if (reachedIndex(p) < storyIndex('a_phantom_of_truth')) return null;
	return leanOf(dcBeads(p), PRE_PHANTOM_SOURCES) === 'conviction' ? 'II' : 'I';
}

/** How The Pallid Mask's Act 2 advanced: the recorded `doubt_conviction` choice, else the lean
 *  entering its check (which includes Phantom's Extra mark). */
export function pallidVersionFromRecord(rec: CampaignRecord): DcSide | null {
	const p = readPlay(rec);
	if (reachedIndex(p) < storyIndex('the_pallid_mask')) return null;
	const recorded = p.choice('the_pallid_mask', 'doubt_conviction');
	if (recorded === 'conviction' || recorded === 'doubt') return recorded;
	return leanOf(dcBeads(p), PRE_PALLID_SOURCES);
}

/** Echoes of the Past scales its setup with the player count. */
export function echoesPlayerCountFromRecord(rec: CampaignRecord): string | null {
	const n = rec.playerCount;
	return n && n > 0 && readPlay(rec).resolution('echoes_of_the_past') ? String(n) : null;
}

/** Dim Carcosa's setup doom, from the Chasing-the-Stranger marks on arrival (the final tally
 *  minus the defeats within Dim Carcosa): ≤2 → 3, 3–5 → 2, 6–8 → 1, 9+ → 0. */
export function arrivalDoomFromRecord(rec: CampaignRecord): string | null {
	const p = readPlay(rec);
	if (!p.resolution('dim_carcosa')) return null;
	const marks = Math.max(0, (p.count(STRANGER) ?? 0) - strangerDefeats(p, 'dim_carcosa'));
	return String(marks <= 2 ? 3 : marks <= 5 ? 2 : marks <= 8 ? 1 : 0);
}

/** The resolutions only one version can reach, as resolution → version; the rest are shared. */
const VERSION_RESOLUTIONS: Record<string, Record<string, string>> = {
	/** Which Hastur was defeated decides the win. */
	dim_carcosa: { R1: 'I', R2: 'II', R3: 'III' },
	a_phantom_of_truth: { R3: 'I', R1: 'II', R2: 'II' },
	the_pallid_mask: { R1: 'conviction', R2: 'doubt' }
};

/** The resolutions reachable on `version`, plus any a play of it reached anyway. */
export function reachableResolutions(
	scenarioId: string,
	version: string,
	all: string[],
	reached: ReadonlySet<string>
): string[] {
	const only = VERSION_RESOLUTIONS[scenarioId] ?? {};
	return all.filter((r) => only[r] === undefined || only[r] === version || reached.has(r));
}

// ── Stranger, VIPs, subject-scoped card lists ──

const STRANGER = 'chasing_the_stranger';

/** Curtain Call adds 2 Stranger marks when the police were involved either way, else 1; later
 *  scenarios carry an Extra `stranger_defeats` counter. */
function strangerDefeats(p: Play, scenario: string): number {
	if (scenario === 'curtain_call')
		return p.has('tried_to_warn_police') || p.has('chose_not_to_warn_police') ? 2 : 1;
	const n = Number(p.choice(scenario, 'stranger_defeats') ?? 0);
	return Number.isFinite(n) ? n : 0;
}

/** The five dinner-party guests: the interview card (`vips_interviewed`), the enemy side
 *  (`vips_slain`), and the scenario where they return as an enemy. Interviewing them grants a help
 *  bonus there. */
export const VIP_ROSTER: { asset: string; enemy: string; home: string }[] = [
	{ asset: '03076a', enemy: '03065b', home: 'the_unspeakable_oath' }, // Constance Dumaine
	{ asset: '03077', enemy: '03066b', home: 'a_phantom_of_truth' }, // Jordan Perry
	{ asset: '03078', enemy: '03067b', home: 'the_pallid_mask' }, // Ishimaru Haruko
	{ asset: '03079', enemy: '03068b', home: 'echoes_of_the_past' }, // Sebastien Moreau
	{ asset: '03080', enemy: '03069b', home: 'black_stars_rise' } // Ashleigh Clarke
];
const vipByEnemy = new Map(VIP_ROSTER.map((v) => [v.enemy, v.asset]));

export interface DatedCard {
	code: string;
	finishDate: number | null;
}

/** A random basic weakness drawn, with its bearer (null when not recorded). */
export interface WeaknessDraw extends DatedCard {
	bearer: string | null;
}

/** The viewed subject's investigators at their base printing; none without the subject's decks. */
function subjectOf(p: Play): Set<string> {
	return new Set((p.rec.subjectInvestigators ?? []).map(canonInvestigatorCode));
}

const csv = (v: string | undefined) => (v ?? '').split(',').filter(Boolean);

/** The subject's own investigators among `codes`, dated by the play. */
function subjectCards(p: Play, codes: Iterable<string>): DatedCard[] {
	const subject = subjectOf(p);
	return [...codes]
		.map(canonInvestigatorCode)
		.filter((code) => subject.has(code))
		.map((code) => ({ code, finishDate: p.rec.finishDate ?? null }));
}

/** The Extra weakness picker paired by index with its bearer picker; a teammate's draw is left out,
 *  an unattributed one kept. */
function weaknessDraws(p: Play, scenario: string): WeaknessDraw[] {
	const subject = subjectOf(p);
	const bearers = csv(p.choice(scenario, 'randomized_weakness_investigator'));
	return csv(p.choice(scenario, 'randomized_weakness')).flatMap((code, i) => {
		const bearer = bearers[i] ? canonInvestigatorCode(bearers[i]) : null;
		return bearer && !subject.has(bearer)
			? []
			: [{ code, bearer, finishDate: p.rec.finishDate ?? null }];
	});
}

const RECENT_CAP = 7;

export interface CampaignPtc {
	family: string;
	plays: number;
	/** Over plays with at least one Doubt/Conviction mark. */
	dcRuns: SignatureRuns<DcRun>;
	dcSources: SourceTally<DcSide>[];
	/** The same picks over finished plays, drawn as token routes. */
	tokenRuns: SignatureRuns<DcRun>;
	tokenMixes: TokenScenarioTally[];
	/** Final Chasing-the-Stranger marks, ascending. */
	stranger: { marks: number; plays: Tally }[];
	/** Every story scenario's most Stranger defeats in one play (Extra, except Curtain Call). */
	strangerHighscores: { scenario: string; max: number; byTier: Record<string, number> }[];
	/** Keyed by the guest (interview) card. */
	vipsInterviewed: Record<string, Tally>;
	vipsSlain: Record<string, Tally>;
	/** Per VIP home scenario: plays that reached it having interviewed them, and plays that slew
	 *  them there (Extra `slew_vip`). */
	vipHelp: Record<string, { asset: string; enemy: string; bonus: Tally; slainHere: Tally }>;
	curtainCall: {
		warnedPolice: number;
		didNotWarn: number;
		/** Extra: the Act 2b that advanced; the Return-to versions only once one was played. */
		act2b: { id: string; plays: Tally }[];
	};
	lastKing: {
		/** Extra resolutions. */
		resigned: number;
		defeated: number;
		survived: number;
		/** Reality's Shadow, played only after resigning. */
		fledParty: number;
		intrudedMeeting: number;
		slayedMonsters: number;
		/** Extra: guests slain at the party, keyed by guest card. */
		slainVips: Record<string, Tally>;
		/** The most guests slain in one play; ties go to the latest play. */
		mostSlainInRun: { count: number; vips: string[] };
	};
	echoes: {
		tookOnyx: number;
		leftOnyx: number;
		destroyedOathspeaker: number;
		followersFoundWay: number;
	};
	unspeakableOath: {
		escaped: number;
		attacked: number;
		partyClaimed: number;
		/** Lost Soul. */
		danielHeeded: number;
		danielIgnored: number;
		/** Extra. */
		danielSurvived: number;
		danielPossessed: number;
		/** Extra: the subject's investigators driven insane, newest first. */
		insaneInvestigators: DatedCard[];
	};
	phantom: {
		foundNigel: number;
		foundNigelsHome: number;
		unableToFind: number;
		didNotEscapeGaze: number;
	};
	pallidMask: {
		enteredCatacombs: number;
		awokeInside: number;
		/** Extra: drawn for reading Act II, newest first. */
		randomizedWeaknesses: WeaknessDraw[];
	};
	blackStarsRise: {
		pathAbove: number;
		pathBelow: number;
		/** `carcosa_merged` is shared with Dim Carcosa's R4; counted here on R3, or when neither
		 *  scenario's resolution was recorded. */
		carcosaMerged: number;
		/** Extra: drawn at setup, newest first. */
		randomizedWeaknesses: WeaknessDraw[];
	};
	dimCarcosa: {
		preventedEscape: number;
		/** Investigators ended possessed; not an ending, it comes with a win. */
		possessed: number;
		hasturHasYou: number;
		/** Extra: the R4 resolution. */
		carcosaMerged: number;
		/** The subject's investigators picked on the `possessed` note, newest first. */
		possessedInvestigators: DatedCard[];
	};
}

const BASE_ACT2B = ['a_city_aflame', 'the_path_is_mine', 'the_shores_of_hali'];
const RT_ACT2B = ['alaran_mists', 'under_the_city', 'here_is_my_reply'];

export const buildPtc = defineCampaignBuilder<CampaignPtc>('ptc', (plays) => {
	const runs = plays.map((play) => {
		const run = dcRun(play);
		return { play, run, beads: run.beads };
	});
	const allRuns = runs.map((r) => r.run);

	const strangerTallies: Record<string, Tally> = {};
	for (const p of plays) {
		const marks = p.count(STRANGER);
		if (marks !== undefined) bumpTally(ensureTally(strangerTallies, String(marks)), p.tier);
	}

	const vipsInterviewed: Record<string, Tally> = {};
	const vipsSlain: Record<string, Tally> = {};
	const slainVips: Record<string, Tally> = {};
	let mostSlainInRun = { count: 0, vips: [] as string[] };
	let mostSlainDate = -Infinity;
	for (const p of plays) {
		for (const code of p.items('vips_interviewed'))
			bumpTally(ensureTally(vipsInterviewed, code), p.tier);
		for (const code of p.items('vips_slain'))
			bumpTally(ensureTally(vipsSlain, vipByEnemy.get(code) ?? code), p.tier);
		const slain = csv(p.choice('the_last_king', 'slain_vips'));
		for (const code of slain) bumpTally(ensureTally(slainVips, code), p.tier);
		const when = p.rec.finishDate ?? -Infinity;
		if (
			slain.length > mostSlainInRun.count ||
			(slain.length && slain.length === mostSlainInRun.count && when >= mostSlainDate)
		) {
			mostSlainInRun = { count: slain.length, vips: slain };
			mostSlainDate = when;
		}
	}

	const act2b = (id: string) => tallyPlays(plays, (p) => p.choice('curtain_call', 'act_2b') === id);
	const lastKing = (resolution: string) =>
		plays.filter((p) => p.resolution('the_last_king') === resolution).length;
	const danielFate = (fate: string) =>
		plays.filter((p) => p.choice('the_unspeakable_oath', 'daniel_fate') === fate).length;
	const weaknesses = (scenario: string) =>
		recentFirst(
			plays.flatMap((p) => weaknessDraws(p, scenario)),
			RECENT_CAP
		);

	return {
		dcRuns: signatureSideRuns(
			allRuns.filter((r) => r.beads.length),
			DC_SIDES
		),
		dcSources: tallySources(
			DC_SIDES,
			DC_SOURCE_SCENARIOS,
			runs,
			Object.fromEntries(
				Object.entries(DC_NEUTRAL_PASSED_BY).map(([source, by]) => [
					source,
					(p: Play) => reachedIndex(p) >= storyIndex(by)
				])
			)
		),
		tokenRuns: signatureSideRuns(
			allRuns.filter((r) => r.tokenRoute.length && r.outcome),
			DC_SIDES
		),
		tokenMixes: tokenMixes(runs),
		stranger: Object.entries(strangerTallies)
			.map(([marks, t]) => ({ marks: Number(marks), plays: t }))
			.sort((a, b) => a.marks - b.marks),
		strangerHighscores: STORY_SCENARIOS.map((scenario) => {
			const byTier: Record<string, number> = {};
			for (const p of plays) {
				const n = strangerDefeats(p, scenario);
				if (n > 0) byTier[p.tier] = Math.max(byTier[p.tier] ?? 0, n);
			}
			return { scenario, max: Math.max(0, ...Object.values(byTier)), byTier };
		}),
		vipsInterviewed,
		vipsSlain,
		vipHelp: Object.fromEntries(
			VIP_ROSTER.map(({ asset, enemy, home }) => [
				home,
				{
					asset,
					enemy,
					bonus: tallyPlays(
						plays,
						(p) => p.items('vips_interviewed').has(asset) && reachedIndex(p) >= storyIndex(home)
					),
					slainHere: tallyPlays(plays, (p) => p.choice(home, 'slew_vip') === 'slain')
				}
			])
		),
		curtainCall: {
			...countNotes(plays, {
				warnedPolice: 'tried_to_warn_police',
				didNotWarn: 'chose_not_to_warn_police'
			}),
			act2b: [...BASE_ACT2B, ...(RT_ACT2B.some((id) => act2b(id).total) ? RT_ACT2B : [])].map(
				(id) => ({ id, plays: act2b(id) })
			)
		},
		lastKing: {
			resigned: lastKing('no_resolution_resigned'),
			defeated: lastKing('no_resolution_defeated'),
			survived: lastKing('R3'),
			...countNotes(plays, {
				fledParty: 'fled_dinner_party',
				intrudedMeeting: 'intruded_on_secret_meeting',
				slayedMonsters: 'slayed_the_monsters'
			}),
			slainVips,
			mostSlainInRun
		},
		echoes: countNotes(plays, {
			tookOnyx: 'took_onyx_clasp',
			leftOnyx: 'left_onyx_clasp',
			destroyedOathspeaker: 'destroyed_the_oathspeaker',
			followersFoundWay: 'followers_of_sign_found_way'
		}),
		unspeakableOath: {
			...countNotes(plays, {
				escaped: 'escaped_the_asylum',
				attacked: 'attacked_as_you_escaped_arkham',
				partyClaimed: 'king_claimed_victims',
				danielHeeded: 'heeded_daniels_warning',
				danielIgnored: 'ignored_daniels_warning'
			}),
			danielSurvived: danielFate('survived'),
			danielPossessed: danielFate('possessed'),
			insaneInvestigators: recentFirst(
				plays.flatMap((p) =>
					subjectCards(p, csv(p.choice('the_unspeakable_oath', 'insane_investigators')))
				),
				RECENT_CAP
			)
		},
		phantom: countNotes(plays, {
			foundNigel: 'found_nigel_engram',
			foundNigelsHome: 'found_nigels_home',
			unableToFind: 'unable_to_find_nigel',
			didNotEscapeGaze: 'did_not_escape_gaze'
		}),
		pallidMask: {
			...countNotes(plays, {
				enteredCatacombs: 'entered_catacombs',
				awokeInside: 'awoke_inside_catacombs'
			}),
			randomizedWeaknesses: weaknesses('the_pallid_mask')
		},
		blackStarsRise: {
			...countNotes(plays, { pathAbove: 'opened_path_above', pathBelow: 'opened_path_below' }),
			carcosaMerged: plays.filter((p) => {
				const bsr = p.resolution('black_stars_rise');
				return (
					bsr === 'R3' ||
					(bsr === undefined &&
						p.resolution('dim_carcosa') === undefined &&
						p.has('carcosa_merged'))
				);
			}).length,
			randomizedWeaknesses: weaknesses('black_stars_rise')
		},
		dimCarcosa: {
			...countNotes(plays, {
				preventedEscape: 'prevented_hasturs_escape',
				possessed: 'possessed',
				hasturHasYou: 'hastur_has_you'
			}),
			carcosaMerged: plays.filter((p) => p.resolution('dim_carcosa') === 'R4').length,
			possessedInvestigators: recentFirst(
				plays.flatMap((p) => subjectCards(p, p.rec.possessedInvestigators ?? [])),
				RECENT_CAP
			)
		}
	};
});
