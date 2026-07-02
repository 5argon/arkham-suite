/**
 * fhv.ts — The Feast of Hemlock Vale bespoke per-campaign tallies. ONE builder, ONE
 * payload blob (`fhv`). FHV is a relationship "life-sim": eight villagers you befriend,
 * each running the same arc — met → shared a dance → stood by you → sacrificed himself →
 * saved in the finale.
 *
 *   • areas / schedule — the 7 surveyable areas (`areas_surveyed`) + whether the two
 *     canon-night scenarios were played; the Day/Night slot matrix is Extra-tab
 *     (`<scenario>.played_on`), rendered nonLog:'partial'.
 *   • villagers — relationship level (`logCounts[<section>]`) + every milestone
 *     (`<section>.<id>`) + the danced/stood/sacrificed arc + saved-in-the-finale.
 *   • dance — The Second Evening: per-resident dance partners + the best single-play
 *     spread (the Dancing Queen four) + Helen + Mother Rachel's doubts.
 *   • hemlockHouse — The Argument (Extra `hemlock_house.the_argument`) + Little Sylvie.
 *   • longestNight — the captives outcome, Mother Rachel's stance (Extra) and the
 *     captives' damage (Extra highscore, 0 = flawless).
 *   • finalEvening — believed/lied to Rachel, the Hemlocks' truce, Bertie & the fireworks payoff.
 *   • bertie — Bertie Musgrave's cross-scenario rescue arc.
 *   • fate — Fate of the Vale: which of 4 versions, the ending, and which villagers were saved.
 *   • curse — the Hemlock curse (`hemlock_curse_count`, per-investigator).
 *   • scenarios — per-scenario fork outcomes, keyed by full `section.id` (the bespoke widgets).
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

/** A villager's display name (the campaign-log relationship-section title, e.g. "Leah Atwood"). */
export function fhvVillagerName(id: string): string {
	return getCampaignLog(FHV_FAMILY)?.en.sections?.[id] ?? id;
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
/** The 8 villagers, in dinner-seat order: relationship section, relationship-level max (3/6/7),
 *  and every milestone (with its scenario). Mother Rachel is first (she anchors the campaign). */
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

/** The 7 residents who can dance / stand by you / sacrifice themselves (Mother Rachel never does). */
export const FHV_DANCERS = ['leah', 'simeon', 'william', 'river', 'gideon', 'judith', 'theo'];

/** Fate of the Vale endings (campaign_notes) → outcome class. */
export const FHV_FATE_ENDINGS: { id: string; cls: 'win' | 'best' | 'loss' }[] = [
	{ id: 'dr_marquez_sacrificed_herself_for_the_vale', cls: 'win' },
	{ id: 'investigators_sacrificed_themselves_for_the_vale', cls: 'best' },
	{ id: 'the_vale_was_saved', cls: 'best' },
	{ id: 'the_vale_burned', cls: 'best' },
	{ id: 'barely_survived', cls: 'win' },
	{ id: 'became_the_true_feast_of_hemlock_vale', cls: 'loss' },
];

/** Per-scenario fork outcomes, keyed by FULL composite key (`section.id`) — the bespoke widgets
 *  read `scenarios[<id>][<key>]`. Grouping/theming is decided per-widget. Hemlock House and the
 *  preludes carry their signature moments in dedicated blobs instead (Argument / dance / fireworks). */
export const FHV_SCENARIOS: { id: string; outcomes: string[] }[] = [
	{ id: 'written_in_rock', outcomes: [
		'simeon.simeon_survived', 'leah.leah_saw_something_in_the_mine',
		'simeon.simeon_disappeared', 'leah.leah_and_simeon_were_reunited',
		'campaign_notes.survived_the_horrors_in_the_rock',
	] },
	{ id: 'the_silent_heath', outcomes: [
		'campaign_notes.laid_the_pearl_family_to_rest',
		'campaign_notes.remains_were_partially_recovered',
		'campaign_notes.madame_pearls_diary_was_recovered',
		'leah.searched_the_pearl_ruins',
	] },
	{ id: 'the_lost_sister', outcomes: [
		'campaign_notes.the_peters_family_was_reunited',
		'campaign_notes.elizabeth_peters_was_saved',
		'theo.theo_reconciled_with_helen',
		'gideon.gideon_found_his_treasure',
	] },
	{ id: 'the_thing_in_the_depths', outcomes: [
		'campaign_notes.thing_in_the_depths_was_defeated',
		'campaign_notes.chelydran_hybrid_lived',
		'campaign_notes.chelydran_hybrid_perished',
		'campaign_notes.chelydran_hybrid_devoured',
		'judith.judith_shared_a_grudge',
	] },
	{ id: 'the_twisted_hollow', outcomes: [
		'campaign_notes.bertie_was_rescued',
		'campaign_notes.bertie_was_lost_in_the_woods',
		'campaign_notes.mother_rachel_showed_the_way',
		'campaign_notes.lost_the_path',
		'campaign_notes.the_bear_was_wounded',
		'judith.judith_saved_your_ass',
		'theo.theo_distracted_the_bear',
		'rachel.mother_rachel_intervened',
	] },
	{ id: 'the_longest_night', outcomes: [
		'campaign_notes.captives_were_saved',
		'campaign_notes.many_captives_were_lost',
		'campaign_notes.all_the_captives_were_lost',
		'campaign_notes.faced_the_night_alone',
		'campaign_notes.dr_marquez_has_a_plan',
	] },
];

/** Scenarios that carry a `<scenario>.played_on` Extra pick — the FLEXIBLE ones whose day/phase
 *  the log never records. The two locked nights (The Twisted Hollow = Day 1 Night, The Longest
 *  Night = Day 2 Night) are derived from the log instead (see `schedule`). Mirrors the curation
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
	/** Plays where this villager shared a dance (The Second Evening). */
	danced: number;
	/** Plays where this villager stood by you (The Longest Night). */
	stood: number;
	/** Plays where this villager sacrificed themself (The Longest Night). */
	sacrificed: number;
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
		/** Extra-tab Day/Night matrix: scenario id → slot → plays. */
		playedOn: Record<string, Record<string, number>>;
	};
	/** villager id → tally. */
	villagers: Record<string, FhvVillagerTally>;
	/** Mother Rachel's cross-scenario story notes (she anchors both canon nights + the Final Evening). */
	rachelExtra: { showedTheWay: number; lostThePath: number; believed: number; liedTo: number };
	/** Simeon's fireworks-plan arc (his plan → the "Burn it all" finale). */
	simeonExtra: { planUnderway: number; fireworks: number };
	/** The Second Evening — the dance. */
	dance: {
		/** villager id → plays they shared a dance. */
		partners: Record<string, number>;
		/** Plays Helen Peters danced (needs the Peters family reunited). */
		helen: number;
		/** Plays Mother Rachel shared her doubts (she never dances). */
		rachelDoubts: number;
		/** Best single-play dance spread (distinct residents) — the Dancing Queen four. */
		best: number;
		/** Plays that reached the dance (any dance recorded). */
		plays: number;
	};
	/** Hemlock House — The Argument (Extra) + Little Sylvie. */
	hemlockHouse: {
		/** Extra `hemlock_house.the_argument` → plays. */
		argument: { william: number; judith: number; neither: number };
		/** Plays that found Little Sylvie (`hidden.found_little_sylvie`). */
		littleSylvie: number;
	};
	/** The Longest Night — captives + Mother Rachel's stance (Extra) + captives damage (Extra). */
	longestNight: {
		facedAlone: number;
		captivesSaved: number;
		captivesManyLost: number;
		captivesAllLost: number;
		drMarquezPlan: number;
		/** Extra `the_longest_night.rachel_stance`. */
		rachel: { confront: number; hide: number };
		/** Extra `the_longest_night.captives_damage`: the LOWEST recorded (0 = flawless), or null. */
		damageBest: number | null;
		/** Plays with a recorded captives-damage value. */
		damagePlays: number;
	};
	/** The Final Evening — belief/lie, the Hemlocks' truce, and the fireworks payoff. */
	finalEvening: {
		believed: number;
		lied: number;
		interrupted: number;
		truce: number;
		gideonTale: number;
		fireworks: number;
	};
	/** Bertie Musgrave's cross-scenario arc. */
	bertie: { rescued: number; lost: number; epiphany: number; perished: number };
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
	/** scenario id → full composite key → plays (per-scenario fork outcomes). */
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
	for (const v of FHV_VILLAGERS) villagers[v.id] = { maxScore: null, milestones: {}, saved: 0, danced: 0, stood: 0, sacrificed: 0 };
	const rachelExtra = { showedTheWay: 0, lostThePath: 0, believed: 0, liedTo: 0 };
	const simeonExtra = { planUnderway: 0, fireworks: 0 };
	const dance = { partners: {} as Record<string, number>, helen: 0, rachelDoubts: 0, best: 0, plays: 0 };
	const hemlockHouse = { argument: { william: 0, judith: 0, neither: 0 }, littleSylvie: 0 };
	const longestNight = {
		facedAlone: 0, captivesSaved: 0, captivesManyLost: 0, captivesAllLost: 0, drMarquezPlan: 0,
		rachel: { confront: 0, hide: 0 }, damageBest: null as number | null, damagePlays: 0,
	};
	const finalEvening = { believed: 0, lied: 0, interrupted: 0, truce: 0, gideonTale: 0, fireworks: 0 };
	const bertie = { rescued: 0, lost: 0, epiphany: 0, perished: 0 };
	const fate = { version: {} as Record<string, number>, endings: {} as Record<string, number>, saved: {} as Record<string, number> };
	const curse = { plays: 0, maxCursed: 0 };
	const scenarios: Record<string, Record<string, number>> = {};
	for (const sc of FHV_SCENARIOS) scenarios[sc.id] = {};

	const thOutcomes = FHV_SCENARIOS.find((s) => s.id === 'the_twisted_hollow')!.outcomes;
	const lnOutcomes = FHV_SCENARIOS.find((s) => s.id === 'the_longest_night')!.outcomes;

	for (const rec of fhvRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const counts = rec.recorded.logCounts ?? {};
		const has = (key: string) => logs.has(key);

		// Areas surveyed.
		for (const a of FHV_AREAS) if (has(`areas_surveyed.${a}`)) areas[a] = (areas[a] ?? 0) + 1;

		// Villagers — relationship level + milestones + the arc + saved-in-finale.
		for (const v of FHV_VILLAGERS) {
			const t = villagers[v.id];
			const score = counts[v.id];
			if (score !== undefined) t.maxScore = t.maxScore === null ? score : Math.max(t.maxScore, score);
			for (const ms of v.milestones) if (has(`${v.id}.${ms.id}`)) t.milestones[ms.id] = (t.milestones[ms.id] ?? 0) + 1;
			if (has(`${v.id}.${v.id}_shared_a_dance`)) t.danced += 1;
			if (has(`${v.id}.${v.id}_stood_by_you`)) t.stood += 1;
			if (has(`${v.id}.${v.id}_sacrificed_himself`)) t.sacrificed += 1;
			if (has(`${H}.fate_of_the_vale_saved_${v.id}`)) {
				t.saved += 1;
				fate.saved[v.id] = (fate.saved[v.id] ?? 0) + 1;
			}
		}

		// Mother Rachel + Simeon extras / The Final Evening forks.
		const believed = has(k('believed'));
		const lied = has(k('lied_to_mother_rachel'));
		if (has(k('mother_rachel_showed_the_way'))) rachelExtra.showedTheWay += 1;
		if (has(k('lost_the_path'))) rachelExtra.lostThePath += 1;
		if (believed) rachelExtra.believed += 1;
		if (lied) rachelExtra.liedTo += 1;
		if (has(`${H}.simeon_plan_is_underway`)) simeonExtra.planUnderway += 1;
		const fireworks = has(k('the_vale_is_full_of_fireworks'));
		if (fireworks) simeonExtra.fireworks += 1;
		if (believed) finalEvening.believed += 1;
		if (lied) finalEvening.lied += 1;
		if (has(k('interrupted_the_feast'))) finalEvening.interrupted += 1;
		if (has(k('the_hemlocks_made_a_truce'))) finalEvening.truce += 1;
		if (has('gideon.gideon_finished_the_tale_of_the_annabelle_lee')) finalEvening.gideonTale += 1;
		if (fireworks) finalEvening.fireworks += 1;

		// Bertie's arc.
		if (has(k('bertie_was_rescued'))) bertie.rescued += 1;
		if (has(k('bertie_was_lost_in_the_woods'))) bertie.lost += 1;
		if (has(k('bertie_had_an_epiphany'))) bertie.epiphany += 1;
		if (has(k('bertie_perished'))) bertie.perished += 1;

		// The Second Evening — the dance (count from the durable per-resident flags).
		let danceSpread = 0;
		for (const d of FHV_DANCERS) {
			if (has(`${d}.${d}_shared_a_dance`)) {
				dance.partners[d] = (dance.partners[d] ?? 0) + 1;
				danceSpread += 1;
			}
		}
		if (has(k('helen_shared_a_dance'))) { dance.helen += 1; danceSpread += 1; }
		if (has('rachel.mother_rachel_shared_her_doubts')) dance.rachelDoubts += 1;
		if (danceSpread > 0) dance.plays += 1;
		dance.best = Math.max(dance.best, danceSpread);

		// Hemlock House — The Argument (Extra) + Little Sylvie.
		const arg = rec.scenarioChoices?.['hemlock_house.the_argument'];
		if (arg === 'william' || arg === 'judith' || arg === 'neither') hemlockHouse.argument[arg] += 1;
		if (has(`${H}.found_little_sylvie`)) hemlockHouse.littleSylvie += 1;

		// Schedule — canon nights played + the Extra Day/Night matrix.
		const playedTH = thOutcomes.some((key) => has(key));
		const playedLN = lnOutcomes.some((key) => has(key));
		if (playedTH) schedule.playedTwistedHollow += 1;
		if (playedLN) schedule.playedLongestNight += 1;
		if (!playedTH && !playedLN) schedule.skippedBothNights += 1;
		for (const sc of FHV_SCHEDULABLE) {
			const slot = rec.scenarioChoices?.[`${sc}.played_on`];
			if (slot) {
				(schedule.playedOn[sc] ??= {})[slot] = (schedule.playedOn[sc][slot] ?? 0) + 1;
			}
		}

		// The Longest Night — captives outcome + Mother Rachel's stance + captives damage (Extra).
		if (has(k('faced_the_night_alone'))) longestNight.facedAlone += 1;
		if (has(k('captives_were_saved'))) longestNight.captivesSaved += 1;
		if (has(k('many_captives_were_lost'))) longestNight.captivesManyLost += 1;
		if (has(k('all_the_captives_were_lost'))) longestNight.captivesAllLost += 1;
		if (has(k('dr_marquez_has_a_plan'))) longestNight.drMarquezPlan += 1;
		const stance = rec.scenarioChoices?.['the_longest_night.rachel_stance'];
		if (stance === 'confront' || stance === 'hide') longestNight.rachel[stance] += 1;
		const dmgRaw = rec.scenarioChoices?.['the_longest_night.captives_damage'];
		if (dmgRaw !== undefined && dmgRaw !== '') {
			const dmg = Number(dmgRaw);
			if (Number.isFinite(dmg)) {
				longestNight.damagePlays += 1;
				longestNight.damageBest = longestNight.damageBest === null ? dmg : Math.min(longestNight.damageBest, dmg);
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

		// Per-scenario fork outcomes (full composite keys).
		for (const sc of FHV_SCENARIOS) {
			for (const key of sc.outcomes) if (has(key)) scenarios[sc.id][key] = (scenarios[sc.id][key] ?? 0) + 1;
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
			dance,
			hemlockHouse,
			longestNight,
			finalEvening,
			bertie,
			fate,
			curse,
			scenarios,
		},
	];
}
