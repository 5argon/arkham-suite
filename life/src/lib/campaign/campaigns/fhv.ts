/**
 * fhv.ts — The Feast of Hemlock Vale bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`fhv`), mirroring `tic.ts`. See `fhv-widgets-plan.md`.
 *
 *   • areas / schedule — the 7 surveyable areas (`areas_surveyed`) + whether the two
 *     canon-night scenarios were played; the full Day/Night slot matrix is Extra-tab
 *     (`<scenario>.played_on`), read here and rendered nonLog:'partial'.
 *   • villagers — 8 dedicated per-character views: relationship score
 *     (`logCounts[<section>]`) + every milestone (`<section>.<id>`, annotated by scenario)
 *     + saved-in-the-finale; Mother Rachel & Simeon carry extra story-relevant notes.
 *   • fate — Fate of the Vale: which of 4 versions (`hidden.fate_of_the_vale_act_3a_v*`),
 *     the ending reached + class, and which villagers were saved.
 *   • curse — the Hemlock curse (`hemlock_curse_count`, per-investigator).
 *   • scenarios — per-scenario fork outcomes (dedicated widgets + folded into the schedule).
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';

const FHV_FAMILY = 'fhv';
const N = 'campaign_notes';
const k = (id: string) => `${N}.${id}`;
const H = 'hidden';

/** Resolve a composite log key (`<section>.<id>`) to its English text from campaign-data,
 *  so the FHV widgets don't duplicate ~50 milestone/note labels in i18n. */
export function fhvText(compositeKey: string): string {
	return getCampaignLog(FHV_FAMILY)?.en.entries[compositeKey]?.text ?? compositeKey;
}

/** Resolve a scenario id (e.g. `the_silent_heath`) to its display name from campaign-data;
 *  falls back to the raw id. Used by the Day/Night schedule matrix. */
export function fhvScenarioName(id: string): string {
	return getCampaignLog(FHV_FAMILY)?.en.scenarioNames?.[id] ?? id;
}

/** The 7 surveyable areas (`areas_surveyed` checklist). */
export const FHV_AREAS = [
	'north_point_mine', 'hemlock_harbor', 'pearl_ridge', 'akwan_shoreline',
	'eastwick_bog', 'western_woods', 'southern_fields',
];

export interface FhvMilestone { id: string; scenario: string }
export interface FhvVillagerDef {
	id: string;
	/** Relationship-LEVEL ceiling (the campaign-data `relationship` section's `max`: 3/6/7) — the
	 *  denominator for "score N / max". NOT the milestone count (a separate, larger number). */
	max: number;
	milestones: FhvMilestone[];
}
/** The 8 villagers: relationship section, relationship-level max (3/6/7), and every milestone (with its scenario). */
export const FHV_VILLAGERS: FhvVillagerDef[] = [
	{ id: 'rachel', max: 3, milestones: [
		{ id: 'mother_rachel_intervened', scenario: 'the_twisted_hollow' },
		{ id: 'mother_rachel_shared_her_doubts', scenario: '10_the_second_evening' },
	] },
	{ id: 'leah', max: 6, milestones: [
		{ id: 'leah_saw_something_in_the_mine', scenario: 'written_in_rock' },
		{ id: 'leah_and_simeon_were_reunited', scenario: 'written_in_rock' },
		{ id: 'searched_the_pearl_ruins', scenario: 'the_silent_heath' },
		{ id: 'leah_shared_her_frustrations', scenario: '07_the_first_evening' },
		{ id: 'leah_is_searching_for_simeon', scenario: '10_the_second_evening' },
		{ id: 'leah_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'leah_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'leah_sacrificed_himself', scenario: 'the_longest_night' },
	] },
	{ id: 'simeon', max: 6, milestones: [
		{ id: 'simeon_survived', scenario: 'written_in_rock' },
		{ id: 'simeon_disappeared', scenario: 'written_in_rock' },
		{ id: 'simeon_hatched_a_plan', scenario: '07_the_first_evening' },
		{ id: 'plan_is_underway', scenario: '09_dawn_of_the_second_day' },
		{ id: 'simeon_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'simeon_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'simeon_sacrificed_himself', scenario: 'the_longest_night' },
	] },
	{ id: 'william', max: 6, milestones: [
		{ id: 'william_shared_his_legacy', scenario: '07_the_first_evening' },
		{ id: 'william_took_heart', scenario: '09_dawn_of_the_second_day' },
		{ id: 'william_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'william_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'william_sacrificed_himself', scenario: 'the_longest_night' },
		{ id: 'william_is_resolved', scenario: '12_dawn_of_the_final_day' },
	] },
	{ id: 'river', max: 6, milestones: [
		{ id: 'scheme_is_in_motion', scenario: '09_dawn_of_the_second_day' },
		{ id: 'river_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'river_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'river_sacrificed_himself', scenario: 'the_longest_night' },
		{ id: 'river_is_reclaiming_their_legacy', scenario: '12_dawn_of_the_final_day' },
	] },
	{ id: 'gideon', max: 6, milestones: [
		{ id: 'gideon_found_his_treasure', scenario: 'the_lost_sister' },
		{ id: 'gideon_told_the_story_of_captain_hemlock', scenario: '07_the_first_evening' },
		{ id: 'gideon_told_the_tale_of_the_annabelle_lee', scenario: '09_dawn_of_the_second_day' },
		{ id: 'gideon_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'gideon_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'gideon_sacrificed_himself', scenario: 'the_longest_night' },
		{ id: 'gideon_finished_the_tale_of_the_annabelle_lee', scenario: '13_the_final_evening' },
	] },
	{ id: 'judith', max: 7, milestones: [
		{ id: 'judith_shared_a_grudge', scenario: 'the_thing_in_the_depths' },
		{ id: 'judith_saved_your_ass', scenario: 'the_twisted_hollow' },
		{ id: 'judith_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'judith_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'judith_sacrificed_himself', scenario: 'the_longest_night' },
		{ id: 'you_backed_judith_up', scenario: '12_dawn_of_the_final_day' },
	] },
	{ id: 'theo', max: 7, milestones: [
		{ id: 'theo_reconciled_with_helen', scenario: 'the_lost_sister' },
		{ id: 'theo_distracted_the_bear', scenario: 'the_twisted_hollow' },
		{ id: 'theo_shared_a_dance', scenario: '10_the_second_evening' },
		{ id: 'theo_rejected_his_family', scenario: '10_the_second_evening' },
		{ id: 'theo_stood_by_you', scenario: 'the_longest_night' },
		{ id: 'theo_sacrificed_himself', scenario: 'the_longest_night' },
		{ id: 'theo_is_having_second_thoughts', scenario: '12_dawn_of_the_final_day' },
	] },
];

/** Fate of the Vale endings (campaign_notes) → outcome class. */
export const FHV_FATE_ENDINGS: { id: string; cls: 'win' | 'best' | 'loss' }[] = [
	{ id: 'dr_marquez_sacrificed_herself_for_the_vale', cls: 'win' },
	{ id: 'investigators_sacrificed_themselves_for_the_vale', cls: 'best' },
	{ id: 'the_vale_was_saved', cls: 'best' },
	{ id: 'the_vale_burned', cls: 'best' },
	{ id: 'barely_survived', cls: 'win' },
	{ id: 'became_the_true_feast_of_hemlock_vale', cls: 'loss' },
];

/** Per-scenario fork outcomes (dedicated widgets + folded into the schedule). */
export const FHV_SCENARIOS: { id: string; notes: string[] }[] = [
	{ id: 'written_in_rock', notes: ['survived_the_horrors_in_the_rock'] },
	{ id: 'the_silent_heath', notes: ['laid_the_pearl_family_to_rest', 'remains_were_partially_recovered', 'madame_pearls_diary_was_recovered'] },
	{ id: 'the_lost_sister', notes: ['the_peters_family_was_reunited', 'elizabeth_peters_was_saved'] },
	{ id: 'the_thing_in_the_depths', notes: ['chelydran_hybrid_perished', 'chelydran_hybrid_lived', 'chelydran_hybrid_devoured', 'thing_in_the_depths_was_defeated'] },
	{ id: 'the_twisted_hollow', notes: ['mother_rachel_showed_the_way', 'lost_the_path', 'bertie_was_rescued', 'bertie_was_lost_in_the_woods', 'the_bear_was_wounded'] },
	{ id: 'the_longest_night', notes: ['faced_the_night_alone', 'captives_were_saved', 'many_captives_were_lost', 'all_the_captives_were_lost', 'dr_marquez_has_a_plan'] },
];

/** Scenarios that carry a `<scenario>.played_on` Extra pick — the 5 FLEXIBLE ones whose
 *  day/phase the log never records. The two locked nights (The Twisted Hollow = Day 1 Night,
 *  The Longest Night = Day 2 Night) are derived from the log instead (see `schedule`), so they
 *  have no curation choice and are intentionally excluded here. Must mirror the curation
 *  `scenarioChoices` keys in campaign-data `curation/fhv.json`. */
export const FHV_SCHEDULABLE = [
	'written_in_rock', 'hemlock_house', 'the_silent_heath', 'the_lost_sister',
	'the_thing_in_the_depths',
];
/** The 6 Day/Night slots (the `current_day` clock). */
export const FHV_SLOTS = ['day_1_day', 'day_1_night', 'day_2_day', 'day_2_night', 'day_3_day', 'day_3_night'];

export interface FhvVillagerTally {
	/** Highest relationship level reached across plays (null = never recorded). */
	maxScore: number | null;
	/** milestone id → plays that hit it. */
	milestones: Record<string, number>;
	/** Plays where this villager was saved in the finale. */
	saved: number;
}

export interface CampaignFhv {
	family: string;
	plays: number;
	/** area id → plays surveyed. */
	areas: Record<string, number>;
	schedule: {
		playedTwistedHollow: number;
		playedLongestNight: number;
		/** Skipped/defied BOTH canon nights (the "colour outside the lines" play). */
		skippedBothNights: number;
		/** Extra-tab Day/Night matrix: scenario id → slot → plays (empty until the Extra input exists). */
		playedOn: Record<string, Record<string, number>>;
	};
	/** villager id → tally. */
	villagers: Record<string, FhvVillagerTally>;
	/** Mother Rachel's cross-scenario story notes (she anchors both canon nights). */
	rachelExtra: { showedTheWay: number; lostThePath: number; believed: number; liedTo: number };
	/** Simeon's fireworks-plan arc (his plan → the "Burn it all" finale). */
	simeonExtra: { planUnderway: number; fireworks: number };
	fate: {
		/** version id (v1..v4) → plays. */
		version: Record<string, number>;
		/** ending id → plays. */
		endings: Record<string, number>;
		/** villager id → plays saved in the finale. */
		saved: Record<string, number>;
	};
	/** Hemlock curse (per-investigator count). */
	curse: { plays: number; maxCursed: number };
	/** scenario id → fork note id → plays (per-scenario fork outcomes; also folded into the schedule). */
	scenarios: Record<string, Record<string, number>>;
}

export function buildFhv(records: CampaignRecord[]): CampaignFhv[] {
	const baseLog = getCampaignLog(FHV_FAMILY);
	if (!baseLog) return [];
	const fhvRecords = filterFamilyRecords(records, FHV_FAMILY);
	if (fhvRecords.length === 0) return [];

	const areas: Record<string, number> = {};
	const schedule = { playedTwistedHollow: 0, playedLongestNight: 0, skippedBothNights: 0, playedOn: {} as Record<string, Record<string, number>> };
	const villagers: Record<string, FhvVillagerTally> = {};
	for (const v of FHV_VILLAGERS) villagers[v.id] = { maxScore: null, milestones: {}, saved: 0 };
	const rachelExtra = { showedTheWay: 0, lostThePath: 0, believed: 0, liedTo: 0 };
	const simeonExtra = { planUnderway: 0, fireworks: 0 };
	const fate = { version: {} as Record<string, number>, endings: {} as Record<string, number>, saved: {} as Record<string, number> };
	const curse = { plays: 0, maxCursed: 0 };
	const scenarios: Record<string, Record<string, number>> = {};
	for (const sc of FHV_SCENARIOS) scenarios[sc.id] = {};

	for (const rec of fhvRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const counts = rec.recorded.logCounts ?? {};
		const has = (key: string) => logs.has(key);

		// Areas surveyed.
		for (const a of FHV_AREAS) if (has(`areas_surveyed.${a}`)) areas[a] = (areas[a] ?? 0) + 1;

		// Villagers — score (logCounts[<section>]) + milestones + saved-in-finale.
		for (const v of FHV_VILLAGERS) {
			const t = villagers[v.id];
			const score = counts[v.id];
			if (score !== undefined) t.maxScore = t.maxScore === null ? score : Math.max(t.maxScore, score);
			for (const ms of v.milestones) if (has(`${v.id}.${ms.id}`)) t.milestones[ms.id] = (t.milestones[ms.id] ?? 0) + 1;
			if (has(`${H}.fate_of_the_vale_saved_${v.id}`)) {
				t.saved += 1;
				fate.saved[v.id] = (fate.saved[v.id] ?? 0) + 1;
			}
		}

		// Mother Rachel + Simeon extras.
		if (has(k('mother_rachel_showed_the_way'))) rachelExtra.showedTheWay += 1;
		if (has(k('lost_the_path'))) rachelExtra.lostThePath += 1;
		if (has(k('believed'))) rachelExtra.believed += 1;
		if (has(k('lied_to_mother_rachel'))) rachelExtra.liedTo += 1;
		if (has(`${H}.simeon_plan_is_underway`)) simeonExtra.planUnderway += 1;
		if (has(k('the_vale_is_full_of_fireworks'))) simeonExtra.fireworks += 1;

		// Schedule — canon nights played + the Extra Day/Night matrix.
		const playedTH = FHV_SCENARIOS.find((s) => s.id === 'the_twisted_hollow')!.notes.some((n) => has(k(n)));
		const playedLN = FHV_SCENARIOS.find((s) => s.id === 'the_longest_night')!.notes.some((n) => has(k(n)));
		if (playedTH) schedule.playedTwistedHollow += 1;
		if (playedLN) schedule.playedLongestNight += 1;
		if (!playedTH && !playedLN) schedule.skippedBothNights += 1;
		for (const sc of FHV_SCHEDULABLE) {
			const slot = rec.scenarioChoices?.[`${sc}.played_on`];
			if (slot) {
				(schedule.playedOn[sc] ??= {})[slot] = (schedule.playedOn[sc][slot] ?? 0) + 1;
			}
		}

		// Fate of the Vale — version + ending + saved villagers.
		for (const ver of ['v1', 'v2', 'v3', 'v4']) {
			if (has(`${H}.fate_of_the_vale_act_3a_${ver}`)) fate.version[ver] = (fate.version[ver] ?? 0) + 1;
		}
		for (const e of FHV_FATE_ENDINGS) if (has(k(e.id))) fate.endings[e.id] = (fate.endings[e.id] ?? 0) + 1;

		// Hemlock curse (per-investigator count section).
		const cursed = counts['hemlock_curse_count'];
		if (cursed !== undefined && cursed > 0) {
			curse.plays += 1;
			curse.maxCursed = Math.max(curse.maxCursed, cursed);
		}

		// Per-scenario fork outcomes.
		for (const sc of FHV_SCENARIOS) {
			for (const note of sc.notes) if (has(k(note))) scenarios[sc.id][note] = (scenarios[sc.id][note] ?? 0) + 1;
		}
	}

	return [
		{
			family: FHV_FAMILY,
			plays: fhvRecords.length,
			areas,
			schedule,
			villagers,
			rachelExtra,
			simeonExtra,
			fate,
			curse,
			scenarios,
		},
	];
}
