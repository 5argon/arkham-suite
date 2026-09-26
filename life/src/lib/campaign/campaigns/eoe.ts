/** Edge of the Earth: the expedition team's fates, supplies, camps, Fatal Mirage memories and endings. */
import { getCampaignLog, isCleared, type CampaignLog } from '@5argon/arkham-campaign-data';
import { countNotes, type Play } from '../records/play';
import { bumpCount, extentOf, type Extent } from '../utils/tally';
import { defineCampaignBuilder } from './define';

const TEAM_SECTION = 'expedition_team';
const SUPPLIES_SECTION = 'supplies_recovered';
const MEMORIES_SECTION = 'memories_banished';
const CRASH_KEY = 'campaign_notes.killed_in_plane_crash';
const FROST_TOKEN = 'frost';
const FATAL_MIRAGE_RUNS = ['fatal_mirage', 'fatal_mirage_2', 'fatal_mirage_3'];

const NOTE = {
	miasmaPlan: 'dr_kensler_has_a_plan',
	miasmaEludes: 'truth_of_the_mirage_eludes_you',
	iceFled: 'team_fled_to_the_mountains',
	iceEscaped: 'team_barely_escaped_the_ice_shelf',
	iceDefeated: 'team_defeated_the_hunting_creatures'
} as const;

/** "Confronted their demons" entries name a few members differently from the roster. */
const DEMON_MEMBER_ALIAS: Record<string, string> = {
	dr_kensler: 'kensler',
	dr_sinha: 'sinha',
	takada: 'hiroko',
	eliyah: 'ashevak'
};

export interface CampaignEoe {
	family: string;
	plays: number;
	/** Member id → plays they were killed in the plane crash. */
	killed: Record<string, number>;
	/** Member id → plays they confronted their demons. */
	demons: Record<string, number>;
	/** Member id → plays that kept their name uncrossed, among plays that recorded the team. */
	survived: Record<string, number>;
	/** Member id → plays they went missing and were found. */
	rescued: Record<string, number>;
	/** Supply id → plays that ended holding it (recovered and not crossed off as spent). */
	supplies: Record<string, number>;
	/** Camp note id (`camp_…`) → plays that camped there. */
	camped: Record<string, number>;
	/** Fatal Mirage memory id → plays that banished it. */
	memoriesBanishedLocations: Record<string, number>;
	memoriesBanishedEnemies: Record<string, number>;
	/** Distinct memories of each kind ever banished (of nine). */
	memoriesBanishedLocationsCount: number;
	memoriesBanishedEnemiesCount: number;
	/** Memories of both kinds banished in one play, over the plays that banished any. */
	banishedPerRun: Extent;
	/** Extra: campaigns that played Fatal Mirage once / twice / thrice, by its recorded resolutions. */
	fatalMiragePlayCounts: { once: number; twice: number; thrice: number };
	/** Frost tokens in the final chaos bag, over won plays that recorded one. */
	frost: Extent;
	/** A play's Shelter is the highest Shelter among the camps it reached. */
	shelter: Extent;
	/** The two exclusive closing notes. */
	miasma: { plan: number; eludes: number };
	/** `skippedPart2` / `skippedPart3` are Extra skip marks. */
	iceAndDeath: {
		skippedPart2: number;
		skippedPart3: number;
		fled: number;
		escaped: number;
		defeated: number;
	};
}

/** The expedition team in log order; `code` is the member's story card. */
export function eoeTeam(): { id: string; code: string }[] {
	const items = getCampaignLog('eoe')?.db.sections.find((s) => s.id === TEAM_SECTION)?.items ?? [];
	return items.map(({ id, code }) => ({ id, code: code ?? '' }));
}

/** The Supplies Recovered entries in log order, with their asset card. */
export const EOE_SUPPLIES: { id: string; code: string }[] = [
	{ id: 'green_soapstone', code: '08614' },
	{ id: 'wooden_sledge', code: '08615' },
	{ id: 'dynamite', code: '08616' },
	{ id: 'miasmic_crystal', code: '08617' },
	{ id: 'mineral_specimen', code: '08618' },
	{ id: 'small_radio', code: '08619' },
	{ id: 'spare_parts', code: '08620' }
];

/** The camp notes in their on-sheet ascent tiers, with their location card and printed Shelter. */
export const EOE_CAMP_ROWS: { id: string; code: string; shelter: number }[][] = [
	[
		{ id: 'camp_crash_site', code: '08502', shelter: 0 },
		{ id: 'camp_precarious_ice_sheet', code: '08505', shelter: 2 },
		{ id: 'camp_treacherous_path', code: '08504', shelter: 1 },
		{ id: 'camp_frozen_shores', code: '08503', shelter: 2 }
	],
	[
		{ id: 'camp_broad_snowdrifts', code: '08506', shelter: 4 },
		{ id: 'camp_icy_wastes', code: '08507', shelter: 4 },
		{ id: 'camp_rocky_crags', code: '08508', shelter: 3 }
	],
	[
		{ id: 'camp_snow_graves', code: '08509', shelter: 5 },
		{ id: 'camp_frigid_cave', code: '08511', shelter: 6 },
		{ id: 'camp_icebreaker_landing', code: '08510', shelter: 5 }
	],
	[
		{ id: 'camp_remnants_of_lakes_camp', code: '08513', shelter: 7 },
		{ id: 'camp_crystalline_cavern', code: '08514', shelter: 8 },
		{ id: 'camp_barrier_camp', code: '08512', shelter: 7 }
	]
];
const EOE_CAMPS = EOE_CAMP_ROWS.flat();

/** The nine Fatal Mirage locations that hold a memory, with their location card. */
export const EOE_MEMORY_LOCATIONS: { id: string; code: string }[] = [
	{ id: 'airfield', code: '08566' },
	{ id: 'alaskan_wilds', code: '08567' },
	{ id: 'cluttered_dormitory', code: '08568' },
	{ id: 'dyers_classroom', code: '08569' },
	{ id: 'infirmary', code: '08570' },
	{ id: 'dr_kenslers_office', code: '08571' },
	{ id: 'moai_statues', code: '08572' },
	{ id: 'ottoman_front', code: '08573' },
	{ id: 'the_black_stone', code: '08574' }
];

/** The nine "Memory of …" enemies, with their enemy card. */
export const EOE_MEMORY_ENEMIES: { id: string; code: string }[] = [
	{ id: 'hunt_gone_awry', code: '08575' },
	{ id: 'lost_patient', code: '08576' },
	{ id: 'missing_father', code: '08577' },
	{ id: 'ravaged_country', code: '08578' },
	{ id: 'regretful_voyage', code: '08579' },
	{ id: 'unspeakable_evil', code: '08580' },
	{ id: 'terrible_discovery', code: '08581' },
	{ id: 'alien_translation', code: '08582' },
	{ id: 'unrequited_love', code: '08583' }
];

/** The nine Memorials of the Lost story assets, one per fallen member; earned into decks, not logged. */
export const EOE_MEMENTO_CODES = [
	'08730',
	'08731',
	'08732',
	'08733',
	'08734',
	'08735',
	'08736',
	'08737',
	'08738'
];

function demonEntries(log: CampaignLog): { key: string; member: string }[] {
	return log.db.entries.flatMap((e) => {
		const token = /^(.+)_has_confronted_(?:his|her)_demons$/.exec(e.id)?.[1];
		return token
			? [{ key: `${e.section}.${e.id}`, member: DEMON_MEMBER_ALIAS[token] ?? token }]
			: [];
	});
}

const banished = (p: Play, id: string) => p.has(`${MEMORIES_SECTION}.${id}`);

function banishedIn(p: Play): number | null {
	const n = [...EOE_MEMORY_LOCATIONS, ...EOE_MEMORY_ENEMIES].filter((m) =>
		banished(p, m.id)
	).length;
	return n || null;
}

function wonFrost(p: Play, log: CampaignLog): number | null {
	const bag = p.rec.recorded.finalChaosBag;
	if (!bag || !Object.keys(bag).length || isCleared(log, p.rec.recorded) !== true) return null;
	return bag[FROST_TOKEN] ?? 0;
}

export const buildEoe = defineCampaignBuilder<CampaignEoe>('eoe', (plays, log) => {
	const team = eoeTeam().map((m) => m.id);
	const demonKeys = demonEntries(log);

	const killed: Record<string, number> = {};
	const demons: Record<string, number> = {};
	const survived: Record<string, number> = {};
	const rescued: Record<string, number> = {};
	const supplies: Record<string, number> = {};
	const camped: Record<string, number> = {};
	const locations: Record<string, number> = {};
	const enemies: Record<string, number> = {};

	for (const p of plays) {
		const victim = p.rec.nameChoices?.[CRASH_KEY];
		if (victim) bumpCount(killed, victim);
		for (const d of demonKeys) if (p.has(d.key)) bumpCount(demons, d.member);

		const statuses = p.rec.recorded.partnerStatuses?.[TEAM_SECTION];
		if (statuses)
			for (const id of team) {
				const st = statuses[id];
				if (!st?.has('name_crossed')) bumpCount(survived, id);
				if (st?.has('mia') && st.has('mia_crossed')) bumpCount(rescued, id);
			}

		const crossed = p.rec.recorded.crossedLogs;
		for (const { id } of EOE_SUPPLIES) {
			const key = `${SUPPLIES_SECTION}.${id}`;
			if (p.has(key) && !crossed?.has(key)) bumpCount(supplies, id);
		}
		for (const { id } of EOE_CAMPS) if (p.has(id)) bumpCount(camped, id);
		for (const { id } of EOE_MEMORY_LOCATIONS) if (banished(p, id)) bumpCount(locations, id);
		for (const { id } of EOE_MEMORY_ENEMIES) if (banished(p, id)) bumpCount(enemies, id);
	}

	const fatalMirageRuns = plays.map(
		(p) => FATAL_MIRAGE_RUNS.filter((id) => p.resolution(id)).length
	);
	const campaignsWithRuns = (n: number) => fatalMirageRuns.filter((runs) => runs === n).length;
	const skipped = (scenario: string) =>
		plays.filter((p) => p.rec.scenarioSkipped?.includes(scenario)).length;

	return {
		killed,
		demons,
		survived,
		rescued,
		supplies,
		camped,
		memoriesBanishedLocations: locations,
		memoriesBanishedEnemies: enemies,
		memoriesBanishedLocationsCount: Object.keys(locations).length,
		memoriesBanishedEnemiesCount: Object.keys(enemies).length,
		banishedPerRun: extentOf(plays.map(banishedIn)),
		fatalMiragePlayCounts: {
			once: campaignsWithRuns(1),
			twice: campaignsWithRuns(2),
			thrice: campaignsWithRuns(3)
		},
		frost: extentOf(plays.map((p) => wonFrost(p, log))),
		shelter: extentOf(
			plays.map((p) => extentOf(EOE_CAMPS.filter((c) => p.has(c.id)).map((c) => c.shelter)).max)
		),
		miasma: countNotes(plays, { plan: NOTE.miasmaPlan, eludes: NOTE.miasmaEludes }),
		iceAndDeath: {
			skippedPart2: skipped('ice_and_death_part_2'),
			skippedPart3: skipped('ice_and_death_part_3'),
			...countNotes(plays, {
				fled: NOTE.iceFled,
				escaped: NOTE.iceEscaped,
				defeated: NOTE.iceDefeated
			})
		}
	};
});
