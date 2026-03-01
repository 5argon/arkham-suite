/**
 * eoe.ts — Edge of the Earth bespoke per-campaign tallies (everything the EotE
 * profile widgets need EXCEPT the City-of-the-Elder-Things matrix, which is its
 * own structure in `eoe-city.ts`). ONE builder, ONE payload blob (`eoe`), so a
 * future EotE widget can be added by reading another field off this aggregate —
 * no new profile-pipeline plumbing.
 *
 * Everything here is derived from each play's `RecordedCampaignState`, no raw-log
 * access required:
 *   • killed   — the picked `#name#` on `killed_in_plane_crash` (rides in `nameChoices`).
 *   • demons   — note PRESENCE of `<member>_has_confronted_(his|her)_demons`.
 *   • survived — partner status: a member with NO `name_crossed` flag came back
 *                (only counted for plays that recorded the expedition team).
 *   • supplies — a supply note recorded AND not crossed off (a spent supply is
 *                crossed, so it no longer counts as "still recovered").
 *   • camped   — note presence of each `campaign_notes.camp_*` location.
 */
import { getCampaignLog, isCleared, type CampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from './achievement-aggregate';

const EOE_FAMILY = 'eoe';
const ROSTER_SECTION = 'expedition_team';
const FROST_TOKEN = 'frost'; // kohaku chaosTokenCode[ChaosToken.TokenFrost]
const SUPPLIES_SECTION = 'supplies_recovered';
const CAMP_PREFIX = 'camp_';
const CRASH_KEY = 'campaign_notes.killed_in_plane_crash';
const NAME_CROSSED = 'name_crossed';
const MIASMA_PLAN = 'campaign_notes.dr_kensler_has_a_plan';
const MIASMA_ELUDES = 'campaign_notes.truth_of_the_mirage_eludes_you';
const FATAL_MIRAGE = 'fatal_mirage';
const MIA = 'mia';
const MIA_CROSSED = 'mia_crossed';
const ICE_FLED = 'campaign_notes.team_fled_to_the_mountains';
const ICE_ESCAPED = 'campaign_notes.team_barely_escaped_the_ice_shelf';
const ICE_DEFEATED = 'campaign_notes.team_defeated_the_hunting_creatures';

/** A few "confronted their demons" entry tokens differ from the roster member id. */
const DEMON_MEMBER_ALIAS: Record<string, string> = {
	dr_kensler: 'kensler',
	dr_sinha: 'sinha',
	takada: 'hiroko',
	eliyah: 'ashevak'
};

export interface CampaignEoe {
	/** Always 'eoe' (the base family). */
	family: string;
	/** Expedition member ids, in campaign-log (roster) order. */
	roster: string[];
	/** Total EotE plays counted (context for the per-member tallies). */
	plays: number;
	// ── per-MEMBER lifetime tallies (portrait-roster widgets) ──
	/** member id → times killed in the plane crash. */
	killed: Record<string, number>;
	/** member id → times they confronted their demons. */
	demons: Record<string, number>;
	/** member id → times they survived (name not crossed), among plays that recorded the team. */
	survived: Record<string, number>;
	/** member id → times rescued (marked MIA, then crossed off). */
	rescued: Record<string, number>;
	// ── per-ITEM lifetime tallies (image-grid widgets) ──
	/** supply id → times recovered AND not crossed off (still held at the end). */
	supplies: Record<string, number>;
	/** camp location id (incl. the `camp_` prefix) → times camped there. */
	camped: Record<string, number>;
	/** Fatal Mirage memory LOCATION id → times banished. */
	memoriesBanishedLocations: Record<string, number>;
	/** Fatal Mirage memory ENEMY id → times banished. */
	memoriesBanishedEnemies: Record<string, number>;
	/** Highest / lowest Frost-token count in the final chaos bag among WINNING plays
	 *  that recorded a bag (null when no winning play recorded one). */
	frostMax: number | null;
	frostMin: number | null;
	/** "The Miasma": plays ending "Dr. Kensler has a plan" vs "the truth of the
	 *  mirage eludes you" (mutually exclusive at the campaign's end). */
	miasmaPlan: number;
	miasmaEludes: number;
	/** "Fatal Mirage": per EotE campaign, how many times Fatal Mirage was played
	 *  (1–3, from the count of recorded `fatal_mirage` / `_2` / `_3` resolutions).
	 *  Only campaigns that recorded at least one are listed. */
	fatalMiragePlays: number[];
	/** "Ice and Death": plays where Part II / Part III was skipped (manual flag). */
	iceDeathSkipped2: number;
	iceDeathSkipped3: number;
	/** "Ice and Death" note counts (plays where each happened). */
	iceDeathFled: number;
	iceDeathEscaped: number;
	iceDeathDefeated: number;
	/** Max / min recorded Shelter (Ice and Death Part I) across plays; null if none. */
	shelterMax: number | null;
	shelterMin: number | null;
	/** "Fatal Mirage": most / fewest memories banished in a single run (among runs
	 *  that banished any); null if none. */
	memBanishedMost: number | null;
	memBanishedLeast: number | null;
	// ── Headline aggregates ──────────────────────────────────────────────────────
	// Precomputed scalars so `.ahlifepro` consumers read them directly rather than
	// re-deriving in the UI (see the serialization principle in compiled-profile.ts).
	/** Distinct Fatal Mirage memory LOCATIONS ever banished (0–9 lifetime coverage). */
	memoriesBanishedLocationsCount: number;
	/** Distinct Fatal Mirage memory ENEMIES ever banished (0–9 lifetime coverage). */
	memoriesBanishedEnemiesCount: number;
	/** How many EotE campaigns played Fatal Mirage once / twice / thrice. */
	fatalMiragePlayCounts: { once: number; twice: number; thrice: number };
	/** "Memorials of the Lost" belongings ever earned (0–9). Card-derived, so it's
	 *  filled at payload assembly from `cardUsage` ({@link countEoeMementosEarned});
	 *  the log-only build leaves it 0. */
	mementosEarned: number;
}

/** Supply ids in the `supplies_recovered` section, in log order. */
export function eoeSupplyIds(log: CampaignLog): string[] {
	return log.db.entries.filter((e) => e.section === SUPPLIES_SECTION).map((e) => e.id);
}

/** Camp-location ids: the `campaign_notes.camp_*` NOTE entries, in log order. The
 *  hidden `camp_shelter` counter lives in another section, so it's excluded. */
export function eoeCampIds(log: CampaignLog): string[] {
	return log.db.entries
		.filter((e) => e.section === 'campaign_notes' && e.id.startsWith(CAMP_PREFIX))
		.map((e) => e.id);
}

/**
 * The 13 camp locations arranged in their on-sheet ascent tiers (4 rows of
 * 4 / 3 / 3 / 3) for the "Camped" widget's hierarchical layout. Display-only;
 * the tally itself counts every camp id from {@link eoeCampIds}.
 */
export const EOE_CAMP_ROWS: string[][] = [
	['camp_crash_site', 'camp_precarious_ice_sheet', 'camp_treacherous_path', 'camp_frozen_shores'],
	['camp_broad_snowdrifts', 'camp_icy_wastes', 'camp_rocky_crags'],
	['camp_snow_graves', 'camp_frigid_cave', 'camp_icebreaker_landing'],
	['camp_remnants_of_lakes_camp', 'camp_crystalline_cavern', 'camp_barrier_camp']
];

/** Supply id → its "Supplies Recovered" ASSET card code (the widget tile art). */
export const EOE_SUPPLY_CARD: Record<string, string> = {
	green_soapstone: '08614',
	wooden_sledge: '08615',
	dynamite: '08616',
	miasmic_crystal: '08617',
	mineral_specimen: '08618',
	small_radio: '08619',
	spare_parts: '08620'
};

/** Camp location id → its LOCATION card code (the widget tile art). */
export const EOE_CAMP_CARD: Record<string, string> = {
	camp_crash_site: '08502',
	camp_precarious_ice_sheet: '08505',
	camp_treacherous_path: '08504',
	camp_frozen_shores: '08503',
	camp_broad_snowdrifts: '08506',
	camp_icy_wastes: '08507',
	camp_rocky_crags: '08508',
	camp_snow_graves: '08509',
	camp_frigid_cave: '08511',
	camp_icebreaker_landing: '08510',
	camp_remnants_of_lakes_camp: '08513',
	camp_crystalline_cavern: '08514',
	camp_barrier_camp: '08512'
};

/** Camp location id → its Shelter rating (the number on the camp's log line). */
export const EOE_CAMP_SHELTER: Record<string, number> = {
	camp_crash_site: 0,
	camp_treacherous_path: 1,
	camp_precarious_ice_sheet: 2,
	camp_frozen_shores: 2,
	camp_rocky_crags: 3,
	camp_icy_wastes: 4,
	camp_broad_snowdrifts: 4,
	camp_icebreaker_landing: 5,
	camp_snow_graves: 5,
	camp_frigid_cave: 6,
	camp_barrier_camp: 7,
	camp_remnants_of_lakes_camp: 7,
	camp_crystalline_cavern: 8
};

/**
 * Fatal Mirage banishable memory LOCATIONS (the nine "mirage" locations that hold
 * a memory): log id → its location card code. Banishing one is logged under
 * `memories_banished.<id>`. (The other Fatal Mirage locations hold no memory and
 * are never banished, so they aren't listed.)
 */
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

/**
 * Fatal Mirage memory ENEMIES ("Memory of …"): log id → its enemy card code.
 * Banishing a memory enemy is also logged under `memories_banished.<id>`.
 */
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

/**
 * "Memorials of the Lost" — the nine story-asset belongings (one per fallen
 * expedition member) that enter a deck when you recover a companion's effects
 * (encounter set eoec 08730–08738). Whether each is earned is DECK-derived
 * (lifetime card usage), not log-derived, so {@link countEoeMementosEarned}
 * runs at payload assembly (where `cardUsage` is available), not in `buildEoe`.
 */
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

/** Count of the nine "Memorials of the Lost" ever held across the subject's decks (0–9). */
export function countEoeMementosEarned(cardUsage: Record<string, number>): number {
	return EOE_MEMENTO_CODES.filter((code) => (cardUsage[code] ?? 0) > 0).length;
}

/** "Confronted their demons" entries → the roster member each refers to. */
function demonEntries(log: CampaignLog): { key: string; member: string }[] {
	const out: { key: string; member: string }[] = [];
	for (const e of log.db.entries) {
		const m = /^(.+)_has_confronted_(?:his|her)_demons$/.exec(e.id);
		if (!m) continue;
		const token = m[1];
		out.push({ key: `${e.section}.${e.id}`, member: DEMON_MEMBER_ALIAS[token] ?? token });
	}
	return out;
}

/**
 * Build the Edge of the Earth bespoke aggregate. Returns a single-element array
 * (sliced by `family` like the other per-campaign data), or empty when the
 * subject has no EotE plays / the roster can't be resolved.
 */
export function buildEoe(records: CampaignRecord[]): CampaignEoe[] {
	const baseLog = getCampaignLog(EOE_FAMILY);
	if (!baseLog) return [];
	const eoeRecords = records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? (log.db.originalId ?? log.db.code) === EOE_FAMILY : false;
	});
	if (eoeRecords.length === 0) return [];

	const section = baseLog.db.sections.find((s) => s.id === ROSTER_SECTION);
	const roster = (section?.items ?? []).map((it) => it.id);
	if (!roster.length) return [];

	const supplyIds = eoeSupplyIds(baseLog);
	const campIds = eoeCampIds(baseLog);
	const demons = demonEntries(baseLog);

	const killed: Record<string, number> = {};
	const demonsTally: Record<string, number> = {};
	const survived: Record<string, number> = {};
	const rescued: Record<string, number> = {};
	const supplies: Record<string, number> = {};
	const camped: Record<string, number> = {};
	let iceDeathFled = 0;
	let iceDeathEscaped = 0;
	let iceDeathDefeated = 0;
	let shelterMax: number | null = null;
	let shelterMin: number | null = null;
	let memBanishedMost: number | null = null;
	let memBanishedLeast: number | null = null;
	const memoriesBanishedLocations: Record<string, number> = {};
	const memoriesBanishedEnemies: Record<string, number> = {};
	let frostMax: number | null = null;
	let frostMin: number | null = null;
	let miasmaPlan = 0;
	let miasmaEludes = 0;
	const fatalMiragePlays: number[] = [];
	let iceDeathSkipped2 = 0;
	let iceDeathSkipped3 = 0;
	const bump = (m: Record<string, number>, k: string) => (m[k] = (m[k] ?? 0) + 1);

	for (const rec of eoeRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const crossed = rec.recorded.crossedLogs;
		const log = getCampaignLog(rec.campaignCode);
		const won = log ? isCleared(log, rec.recorded) === true : false;

		const member = rec.nameChoices?.[CRASH_KEY];
		if (member) bump(killed, member);

		for (const d of demons) if (logs.has(d.key)) bump(demonsTally, d.member);

		// Survived = name not crossed; Rescued = marked MIA then crossed off — both
		// only meaningful when the play recorded the team.
		const team = rec.recorded.partnerStatuses?.[ROSTER_SECTION];
		if (team)
			for (const id of roster) {
				const st = team[id];
				if (!st?.has(NAME_CROSSED)) bump(survived, id);
				if (st?.has(MIA) && st.has(MIA_CROSSED)) bump(rescued, id);
			}

		for (const id of supplyIds) {
			const key = `${SUPPLIES_SECTION}.${id}`;
			if (logs.has(key) && !crossed?.has(key)) bump(supplies, id);
		}

		// Camped tally + the run's Shelter = the highest camp number reached.
		let runShelter: number | null = null;
		for (const id of campIds)
			if (logs.has(`campaign_notes.${id}`)) {
				bump(camped, id);
				const sh = EOE_CAMP_SHELTER[id];
				if (sh !== undefined) runShelter = runShelter === null ? sh : Math.max(runShelter, sh);
			}
		if (runShelter !== null) {
			shelterMax = shelterMax === null ? runShelter : Math.max(shelterMax, runShelter);
			shelterMin = shelterMin === null ? runShelter : Math.min(shelterMin, runShelter);
		}

		// Memories BANISHED — locations and enemies, both keyed under memories_banished.
		for (const loc of EOE_MEMORY_LOCATIONS)
			if (logs.has(`memories_banished.${loc.id}`)) bump(memoriesBanishedLocations, loc.id);
		for (const en of EOE_MEMORY_ENEMIES)
			if (logs.has(`memories_banished.${en.id}`)) bump(memoriesBanishedEnemies, en.id);

		// Most / fewest banished in a single run (locations + enemies), among runs
		// that banished at least one.
		const banishedThisRun =
			EOE_MEMORY_LOCATIONS.filter((l) => logs.has(`memories_banished.${l.id}`)).length +
			EOE_MEMORY_ENEMIES.filter((e) => logs.has(`memories_banished.${e.id}`)).length;
		if (banishedThisRun > 0) {
			memBanishedMost =
				memBanishedMost === null ? banishedThisRun : Math.max(memBanishedMost, banishedThisRun);
			memBanishedLeast =
				memBanishedLeast === null ? banishedThisRun : Math.min(memBanishedLeast, banishedThisRun);
		}

		// Frost-token range — only WINNING plays that recorded a final chaos bag count.
		const bag = rec.recorded.finalChaosBag;
		if (won && bag && Object.keys(bag).length > 0) {
			const frost = bag[FROST_TOKEN] ?? 0;
			frostMax = frostMax === null ? frost : Math.max(frostMax, frost);
			frostMin = frostMin === null ? frost : Math.min(frostMin, frost);
		}

		// The Miasma — the two mutually-exclusive end notes.
		if (logs.has(MIASMA_PLAN)) miasmaPlan += 1;
		if (logs.has(MIASMA_ELUDES)) miasmaEludes += 1;

		// Fatal Mirage replays = how many of the 3 FM scenarios got a recorded resolution.
		const fm = [FATAL_MIRAGE, 'fatal_mirage_2', 'fatal_mirage_3'].filter(
			(id) => rec.scenarioResolutions?.[id]
		).length;
		if (fm > 0) fatalMiragePlays.push(fm);

		// Ice and Death — manually-flagged skips of Part II / Part III.
		const skipped = rec.scenarioSkipped ?? [];
		if (skipped.includes('ice_and_death_part_2')) iceDeathSkipped2 += 1;
		if (skipped.includes('ice_and_death_part_3')) iceDeathSkipped3 += 1;

		// Ice and Death — notable outcome notes.
		if (logs.has(ICE_FLED)) iceDeathFled += 1;
		if (logs.has(ICE_ESCAPED)) iceDeathEscaped += 1;
		if (logs.has(ICE_DEFEATED)) iceDeathDefeated += 1;
	}

	return [
		{
			family: EOE_FAMILY,
			roster,
			plays: eoeRecords.length,
			killed,
			demons: demonsTally,
			survived,
			rescued,
			supplies,
			camped,
			memoriesBanishedLocations,
			memoriesBanishedEnemies,
			frostMax,
			frostMin,
			miasmaPlan,
			miasmaEludes,
			fatalMiragePlays,
			iceDeathSkipped2,
			iceDeathSkipped3,
			iceDeathFled,
			iceDeathEscaped,
			iceDeathDefeated,
			shelterMax,
			shelterMin,
			memBanishedMost,
			memBanishedLeast,
			memoriesBanishedLocationsCount: Object.keys(memoriesBanishedLocations).length,
			memoriesBanishedEnemiesCount: Object.keys(memoriesBanishedEnemies).length,
			fatalMiragePlayCounts: {
				once: fatalMiragePlays.filter((p) => p === 1).length,
				twice: fatalMiragePlays.filter((p) => p === 2).length,
				thrice: fatalMiragePlays.filter((p) => p === 3).length
			},
			// Card-derived; overridden at assembly via countEoeMementosEarned(cardUsage).
			mementosEarned: 0
		}
	];
}
