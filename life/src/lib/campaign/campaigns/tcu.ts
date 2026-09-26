/** The Circle Undone per-campaign tallies. Everything is read from the campaign log. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { EndingKind } from '../outcomes/clear-status';
import type { CampaignRecord } from '../records/campaign-record';
import { countNotes, noteKey, readPlay, tallyPlays, type Play } from '../records/play';
import type { SignatureRuns } from '../utils/signature-runs';
import { bumpTally, ensureTally, extentOf, type Tally } from '../utils/tally';
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
	'the_witching_hour',
	'at_deaths_doorstep',
	'the_secret_name',
	'the_wages_of_sin',
	'for_the_greater_good',
	'union_and_disillusion',
	'in_the_clutches_of_chaos',
	'before_the_black_throne'
];

function reachedIndex(p: Play): number {
	let reached = -1;
	STORY_SCENARIOS.forEach((s, i) => {
		if (p.resolution(s) !== undefined) reached = i;
	});
	return reached;
}

/** The four who vanish at the estate (their cards, also their log sections) and their trail note. */
const MISSING_PERSONS: { code: string; trail: string }[] = [
	{ code: '05046', trail: 'on_gavriellas_trail' },
	{ code: '05047', trail: 'on_jeromes_trail' },
	{ code: '05048', trail: 'on_valentinos_trail' },
	{ code: '05049', trail: 'on_pennys_trail' }
];
/** How a missing person can be lost at the estate, in book order. */
const TCU_FATES = [
	'taken_by_the_watcher',
	'claimed_by_specters',
	'disappeared_into_the_mist',
	'pulled_into_the_spectral_realm'
];

/** Before the Black Throne's endings. Azathoth slumbering counts as the clean ending only without
 *  the Pipers or the Black Book, which are endings of their own. */
const FINALE_ENDINGS: { id: keyof CampaignTcu['endings']; note: string; kind: EndingKind }[] = [
	{ id: 'slumbersClean', note: 'azathoth_slumbers', kind: 'best' },
	{ id: 'signedBlackBook', note: 'signed_the_black_book', kind: 'best' },
	{ id: 'joinedPipers', note: 'lead_investigator_joins_pipers', kind: 'win' },
	{ id: 'azathothDevoured', note: 'azathoth_devoured_the_universe', kind: 'loss' }
];

function reachedEnding(p: Play, note: string): boolean {
	if (note !== 'azathoth_slumbers') return p.has(note);
	return p.has(note) && !p.has('lead_investigator_joins_pipers') && !p.has('signed_the_black_book');
}

// ── Lodge / Coven ──

export type AllegianceSide = 'lodge' | 'coven';
const ALLEGIANCE_SIDES = ['lodge', 'coven'] as const;

export interface AllegianceBead extends SideBead<AllegianceSide> {
	/** The Price of Progress: a Lodge member secretly deceiving it. */
	deceiving?: boolean;
}
export type AllegianceRun = SideRun<AllegianceSide, AllegianceBead>;

/** The allegiance decision points in book order. */
export const TCU_ALLEGIANCE_SOURCES = [
	'the_price_of_progress',
	'the_secret_name',
	'the_inner_circle',
	'union_and_disillusion',
	'in_the_clutches_of_chaos'
];
/** [source, Lodge note, Coven note, weight]; siding at Union and Disillusion weighs double. */
const PAIRED_SOURCES: [string, string, string, number][] = [
	['the_price_of_progress', 'members_of_the_lodge', 'enemies_of_the_lodge', 1],
	['the_secret_name', 'told_lodge_about_coven', 'hid_knowledge_of_coven', 1],
	['the_inner_circle', 'inducted_into_the_inner_circle', 'kept_mementos_hidden', 1],
	['union_and_disillusion', 'sided_with_the_lodge', 'sided_with_the_coven', 2]
];
/** In the Clutches of Chaos leans by the net of Anette's and Sanford's fates, and is neutral when
 *  they cancel out or the investigators continued alone. */
const CLUTCHES_LODGE = [
	'arrested_anette',
	'asked_sanford_for_assistance',
	'assumed_control_of_the_silver_twilight_lodge'
];
const CLUTCHES_COVEN = [
	'asked_anette_for_assistance',
	'anette_taught_you_the_spells_of_old',
	'arrested_sanford'
];

function allegianceBeads(p: Play): AllegianceBead[] {
	const beads: AllegianceBead[] = [];
	for (const [scenario, lodge, coven, amount] of PAIRED_SOURCES) {
		if (p.has(lodge)) {
			const deceiving =
				scenario === 'the_price_of_progress' ? { deceiving: p.has('deceiving_the_lodge') } : {};
			beads.push({ scenario, side: 'lodge', amount, ...deceiving });
		} else if (p.has(coven)) beads.push({ scenario, side: 'coven', amount });
	}
	const net = CLUTCHES_LODGE.filter(p.has).length - CLUTCHES_COVEN.filter(p.has).length;
	if (net)
		beads.push({
			scenario: 'in_the_clutches_of_chaos',
			side: net > 0 ? 'lodge' : 'coven',
			amount: 1
		});
	return beads;
}

function allegianceRun(p: Play): AllegianceRun {
	const beads = allegianceBeads(p);
	const ending = FINALE_ENDINGS.find((e) => reachedEnding(p, e.note));
	return {
		beads,
		totals: sideTotals(ALLEGIANCE_SIDES, beads),
		outcomeKey: ending ? noteKey(ending.note) : null,
		outcome: ending?.kind ?? null
	};
}

// ── Version axes (see VERSION_AXES) ──

/** Union and Disillusion's Beyond-the-Mist Cosmos (Act 3), chosen from the log: v. I sided with the
 *  Lodge; with the coven, v. II when deceiving the Lodge and inducted, v. III on two of {deceiving,
 *  hid the coven, kept mementos hidden}, else v. IV. */
export function unionCosmosVersionFromRecord(
	rec: CampaignRecord
): 'I' | 'II' | 'III' | 'IV' | null {
	const p = readPlay(rec);
	if (p.has('sided_with_the_lodge')) return 'I';
	if (!p.has('sided_with_the_coven')) return null;
	if (p.has('deceiving_the_lodge') && p.has('inducted_into_the_inner_circle')) return 'II';
	const deceptions = [
		'deceiving_the_lodge',
		'hid_knowledge_of_coven',
		'kept_mementos_hidden'
	].filter(p.has).length;
	return deceptions >= 2 ? 'III' : 'IV';
}

/** The Twist of Fate tally that sets Before the Black Throne's starting doom. */
export function pathWindsFromRecord(rec: CampaignRecord): string | null {
	const p = readPlay(rec);
	const n = p.count('path_winds_before_you');
	return n !== undefined && p.resolution('before_the_black_throne') ? String(n) : null;
}

// ── The blob ──

export interface TcuMissingPerson {
	code: string;
	/** Plays that picked up their trail at At Death's Doorstep. */
	trail: number;
	/** How they were lost at the estate, reached fates only, in book order. */
	fates: { fate: string; plays: number }[];
	/** Their standing when the veil parted at Union and Disillusion. */
	union: { alive: number; dead: number };
	any: boolean;
}

export interface TcuMemento {
	id: string;
	found: Tally;
	/** Only in Return to The Circle Undone. */
	returnTo: boolean;
}

export interface CampaignTcu {
	family: string;
	plays: number;
	/** Over plays with at least one lean. */
	allegianceRuns: SignatureRuns<AllegianceRun>;
	allegianceSources: SourceTally<AllegianceSide>[];
	/** The Price of Progress. */
	allegiance: {
		deceivingLodge: number;
		rescuedJosef: number;
		josefAlive: number;
		josefLostToMist: number;
	};
	missingPersons: TcuMissingPerson[];
	/** The base mementos, then the Return-to ones found at least once. */
	mementos: TcuMemento[];
	/** Distinct mementos found. */
	mementosCount: number;
	witchingHour: {
		acceptedFate: number;
		rejectedFate: number;
		spellBroken: number;
		spellCast: number;
	};
	/** `neverSeenAgain`: the party was lost and a fresh one carries on. */
	atDeathsDoorstep: { escaped: number; learnedNothing: number; neverSeenAgain: number };
	/** Most pieces of evidence left behind in one play (the prologue count). */
	evidenceMax: number | null;
	secretName: { toldLodge: number; hidCoven: number };
	wagesOfSin: {
		/** Heretics released in one play, ascending. */
		hereticsReleased: { released: number; plays: Tally }[];
		hereticsReleasedMax: number | null;
		survivedWatcher: number;
	};
	forTheGreaterGood: { openedPuzzleBox: number; guardianEmerged: number; guardianDefeated: number };
	innerCircle: { inducted: number; keptHidden: number };
	union: {
		sidedLodge: number;
		sidedCoven: number;
		lodgeTrueWork: number;
		sanfordPossesses: number;
		anettePossessed: number;
		/** The four missing persons' standing, summed across plays. */
		survivors: { alive: number; dead: number };
	};
	clutchesOfChaos: {
		askedAnette: number;
		arrestedAnette: number;
		anetteTaughtSpells: number;
		askedSanford: number;
		arrestedSanford: number;
		assumedControl: number;
		continuedAlone: number;
	};
	endings: {
		azathothDevoured: number;
		joinedPipers: number;
		signedBlackBook: number;
		slumbersClean: number;
	};
}

function mementoIds(code: string): string[] {
	return (getCampaignLog(code)?.db.entries ?? [])
		.filter((e) => e.section === 'mementos')
		.map((e) => e.id);
}

export const buildTcu = defineCampaignBuilder<CampaignTcu>('tcu', (plays) => {
	const runs = plays.map((play) => {
		const run = allegianceRun(play);
		return { play, run, beads: run.beads };
	});

	const missingPersons = MISSING_PERSONS.map(({ code, trail }): TcuMissingPerson => {
		const fates = TCU_FATES.map((fate) => ({
			fate,
			plays: plays.filter((p) => p.items(code).has(fate)).length
		})).filter((f) => f.plays);
		const union = {
			alive: plays.filter((p) => p.items(code).has('alive')).length,
			dead: plays.filter((p) => p.items(code).has('dead')).length
		};
		const trailed = plays.filter((p) => p.has(trail)).length;
		return {
			code,
			trail: trailed,
			fates,
			union,
			any: !!(trailed || fates.length || union.alive || union.dead)
		};
	});

	const base = mementoIds('tcu');
	const mementos = [...base, ...mementoIds('rttcu').filter((id) => !base.includes(id))]
		.map((id) => ({
			id,
			found: tallyPlays(plays, (p) => p.has(`mementos.${id}`)),
			returnTo: !base.includes(id)
		}))
		.filter((m) => !m.returnTo || m.found.total);

	const heretics: Record<string, Tally> = {};
	for (const p of plays) {
		const n = p.count('heretics_released');
		if (n !== undefined) bumpTally(ensureTally(heretics, String(n)), p.tier);
	}

	const endings = Object.fromEntries(
		FINALE_ENDINGS.map((e) => [e.id, plays.filter((p) => reachedEnding(p, e.note)).length])
	) as CampaignTcu['endings'];

	return {
		allegianceRuns: signatureSideRuns(
			runs.map((r) => r.run).filter((r) => r.beads.length),
			ALLEGIANCE_SIDES
		),
		allegianceSources: tallySources(ALLEGIANCE_SIDES, TCU_ALLEGIANCE_SOURCES, runs, {
			in_the_clutches_of_chaos: (p) =>
				reachedIndex(p) >= STORY_SCENARIOS.indexOf('in_the_clutches_of_chaos')
		}),
		allegiance: countNotes(plays, {
			deceivingLodge: 'deceiving_the_lodge',
			rescuedJosef: 'rescued_josef',
			josefAlive: 'josef_is_alive',
			josefLostToMist: 'josef_disappeared_into_the_mist'
		}),
		missingPersons,
		mementos,
		mementosCount: mementos.filter((m) => m.found.total).length,
		witchingHour: countNotes(plays, {
			acceptedFate: 'accepted_fate',
			rejectedFate: 'rejected_fate',
			spellBroken: 'witches_spell_broken',
			spellCast: 'witches_spell_cast'
		}),
		atDeathsDoorstep: countNotes(plays, {
			escaped: 'investigators_escaped_the_spectral_realm',
			learnedNothing: 'learned_nothing_of_the_lodges_schemes',
			neverSeenAgain: 'never_seen_again'
		}),
		evidenceMax: extentOf(plays.map((p) => p.count('pieces_of_evidence'))).max,
		secretName: countNotes(plays, {
			toldLodge: 'told_lodge_about_coven',
			hidCoven: 'hid_knowledge_of_coven'
		}),
		wagesOfSin: {
			hereticsReleased: Object.entries(heretics)
				.map(([n, t]) => ({ released: Number(n), plays: t }))
				.sort((a, b) => a.released - b.released),
			hereticsReleasedMax: extentOf(plays.map((p) => p.count('heretics_released'))).max,
			survivedWatcher: plays.filter((p) => p.has('survived_the_watchers_embrace')).length
		},
		forTheGreaterGood: countNotes(plays, {
			openedPuzzleBox: 'discovered_how_to_open_the_puzzle_box',
			guardianEmerged: 'guardian_of_the_trap_emerged',
			guardianDefeated: 'guardian_of_the_trap_defeated'
		}),
		innerCircle: countNotes(plays, {
			inducted: 'inducted_into_the_inner_circle',
			keptHidden: 'kept_mementos_hidden'
		}),
		union: {
			...countNotes(plays, {
				sidedLodge: 'sided_with_the_lodge',
				sidedCoven: 'sided_with_the_coven',
				lodgeTrueWork: 'true_work_of_silver_twilight_lodge_has_begun',
				sanfordPossesses: 'carl_sanford_possesses_the_secrets_of_the_universe',
				anettePossessed: 'anette_mason_is_possessed_by_evil'
			}),
			survivors: {
				alive: missingPersons.reduce((n, m) => n + m.union.alive, 0),
				dead: missingPersons.reduce((n, m) => n + m.union.dead, 0)
			}
		},
		clutchesOfChaos: countNotes(plays, {
			askedAnette: 'asked_anette_for_assistance',
			arrestedAnette: 'arrested_anette',
			anetteTaughtSpells: 'anette_taught_you_the_spells_of_old',
			askedSanford: 'asked_sanford_for_assistance',
			arrestedSanford: 'arrested_sanford',
			assumedControl: 'assumed_control_of_the_silver_twilight_lodge',
			continuedAlone: 'continued_alone'
		}),
		endings
	};
});
