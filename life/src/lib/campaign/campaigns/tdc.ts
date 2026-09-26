/** The Drowned City: the expedition's direction, the alien glyphs and eldritch artifacts, the side
 *  tasks, each scenario's logged forks, the Sepulchre gate and the flooding of Arkham. */
import { countNotes, type Play } from '../records/play';
import { canonInvestigatorCode } from '../utils/card-filters';
import { defineCampaignBuilder } from './define';

/** The 26 alien glyphs by the scenario whose locations decrypt them, in expedition order; a
 *  scenario's glyphs are the same whichever way the expedition went. */
export const TDC_GLYPHS_BY_SCENARIO: { scenario: string; ids: string[] }[] = [
	{ scenario: 'one_last_job', ids: ['tdc_rune_a'] },
	{ scenario: 'the_western_wall', ids: ['tdc_rune_v', 'tdc_rune_w', 'tdc_rune_z'] },
	{ scenario: 'the_drowned_quarter', ids: ['tdc_rune_x', 'tdc_rune_y'] },
	{
		scenario: 'the_apiary',
		ids: ['tdc_rune_q', 'tdc_rune_r', 'tdc_rune_s', 'tdc_rune_t', 'tdc_rune_u']
	},
	{
		scenario: 'the_grand_vault',
		ids: ['tdc_rune_l', 'tdc_rune_m', 'tdc_rune_n', 'tdc_rune_o', 'tdc_rune_p']
	},
	{
		scenario: 'court_of_the_ancients',
		ids: ['tdc_rune_g', 'tdc_rune_h', 'tdc_rune_i', 'tdc_rune_j', 'tdc_rune_k']
	},
	{
		scenario: 'obsidian_canyons',
		ids: ['tdc_rune_b', 'tdc_rune_c', 'tdc_rune_d', 'tdc_rune_e', 'tdc_rune_f']
	}
];

export const TDC_GLYPH_IDS: string[] = TDC_GLYPHS_BY_SCENARIO.flatMap((g) => g.ids);

/** The six eldritch artifacts (`artifacts_earned`); all six earn `powers_combined`. */
export const TDC_ARTIFACTS: string[] = [
	'barrier_node',
	'grisly_mask',
	'tidal_tablet',
	'shard',
	'obsidian_claw',
	'clah_horror'
];

/** The Horror in Clay is earned during The Doom of Arkham itself, so it has no `hidden.kept_*`. */
const CARRIED_ARTIFACTS = TDC_ARTIFACTS.filter((id) => id !== 'clah_horror');

/** The side tasks offered at An Offer You Can't Refuse: `hidden.picked_<id>` and the task card. */
export const TDC_TASKS: { id: string; code: string }[] = [
	{ id: 'no_place_like_home', code: '11753a' },
	{ id: 'walk_in_faith', code: '11754a' },
	{ id: 'toe_the_line', code: '11755a' },
	{ id: 'good_money', code: '11756a' },
	{ id: 'prove_your_worth', code: '11757a' },
	{ id: 'do_no_harm', code: '11758a' },
	{ id: 'dreams_of_destruction', code: '11759a' },
	{ id: 'plumb_the_depths', code: '11760a' }
];

/** Task progress that earns `obligations`. */
const OBLIGATIONS_PROGRESS = 5;
const TASK_PROGRESS = 'task_progress';

export const TDC_FLOODED: string[] = [
	'downtown',
	'easttown',
	'miskatonic_university',
	'northside',
	'rivertown',
	'southside',
	'st_marys_hospital'
];

/** Each scenario's logged forks as full `section.id` keys, in display groups. */
export const TDC_OUTCOMES: Record<string, string[][]> = {
	one_last_job: [
		[
			'campaign_notes.discovered_an_alien_language',
			'campaign_notes.ruby_won_the_bet',
			'campaign_notes.ruby_lost_the_bet'
		]
	],
	the_western_wall: [
		[
			'campaign_notes.the_creature_was_defeated',
			'campaign_notes.expedition_helped_pilgrim',
			'campaign_notes.expedition_abandoned_pilgrim'
		]
	],
	the_drowned_quarter: [['artifacts_earned.barrier_node', 'campaign_notes.the_power_was_diverted']],
	the_apiary: [
		[
			'campaign_notes.pilgrims_were_saved',
			'campaign_notes.pilgrims_were_devoured',
			'campaign_notes.exterminated_the_alien_parasites',
			'artifacts_earned.grisly_mask'
		]
	],
	the_grand_vault: [
		['campaign_notes.the_inner_sanctum_was_unsealed', 'artifacts_earned.tidal_tablet']
	],
	court_of_the_ancients: [['artifacts_earned.shard']],
	obsidian_canyons: [['artifacts_earned.obsidian_claw', 'hidden.tdc_helped_with_the_ropes']],
	the_doom_of_arkham: [
		['campaign_notes.stood_together', 'campaign_notes.your_allies_have_a_plan'],
		[
			'campaign_notes.cthulhu_was_driven_away',
			'campaign_notes.cthulhu_was_banished',
			'campaign_notes.cthulhu_was_banished_but_arkham_was_destroyed',
			'campaign_notes.cthulhu_annihilated_the_city_of_arkham'
		]
	]
};

/** One side task taken, from the Extra `task_assignment` pickers; newest play first. */
export interface TdcTaskAssignment {
	code: string;
	/** Null when the pick names no investigator. */
	investigator: string | null;
	finishDate: number | null;
}

export interface CampaignTdc {
	family: string;
	plays: number;
	fold: { west: number; east: number };
	glyphs: {
		/** Glyph id → plays that decrypted it. */
		collected: Record<string, number>;
		/** Distinct glyphs ever decrypted. */
		everCollected: number;
		/** Scenario → distinct glyphs of its own ever decrypted. */
		byScenario: Record<string, number>;
		allTwentySix: number;
	};
	artifacts: {
		/** Artifact id → plays. */
		earned: Record<string, number>;
		/** Artifact id → plays that carried it into the finale. */
		kept: Record<string, number>;
		everEarned: number;
		allSix: number;
	};
	/** Progress is the subject's own investigators' `task_progress` counters. */
	tasks: {
		/** Highest progress one investigator reached. */
		best: number;
		/** Every counted investigator's progress, summed over plays. */
		total: number;
		/** Plays where one of them reached the `obligations` progress. */
		obligations: number;
		/** Task id → plays it was picked. */
		picked: Record<string, number>;
		assignments: TdcTaskAssignment[];
	};
	sepulchre: { halted: number; didNotConfront: number; innerSanctum: number };
	/** Scenario → outcome key (from {@link TDC_OUTCOMES}) → plays. */
	scenarios: Record<string, Record<string, number>>;
	/** Neighborhood → plays it flooded. */
	flooded: Record<string, number>;
}

/** Id → plays where `hit`, for the ids hit at least once. */
function tallyIds(
	plays: readonly Play[],
	ids: readonly string[],
	hit: (p: Play, id: string) => boolean
): Record<string, number> {
	const out: Record<string, number> = {};
	for (const id of ids) {
		const n = plays.filter((p) => hit(p, id)).length;
		if (n) out[id] = n;
	}
	return out;
}

/** The subject's `task_progress` counters in one play. The counter is per investigator
 *  (`task_progress.<code>`, or `.all` when the play had no roster); a play without the subject's
 *  investigators can't be scoped, so all of its counters count. */
function subjectTaskProgress(p: Play): number[] {
	const subject = new Set((p.rec.subjectInvestigators ?? []).map(canonInvestigatorCode));
	const prefix = `${TASK_PROGRESS}.`;
	return Object.entries(p.rec.recorded.logCounts ?? {})
		.filter(([key]) => key.startsWith(prefix))
		.filter(([key]) => {
			const code = key.slice(prefix.length);
			return !subject.size || code === 'all' || subject.has(canonInvestigatorCode(code));
		})
		.map(([, n]) => n);
}

/** The subject's picks; an investigator-less pick stays (it can't be scoped), a teammate's goes.
 *  The task and investigator lists pair by position, so neither is filtered before pairing. */
function subjectAssignments(p: Play): TdcTaskAssignment[] {
	const subject = new Set((p.rec.subjectInvestigators ?? []).map(canonInvestigatorCode));
	const codes = (p.choice('one_last_job', 'task_assignment') ?? '').split(',');
	const investigators = (p.choice('one_last_job', 'task_assignment_investigator') ?? '').split(',');
	return codes.flatMap((code, i) => {
		if (!code) return [];
		const investigator = investigators[i] ? canonInvestigatorCode(investigators[i]) : null;
		if (investigator && !subject.has(investigator)) return [];
		return [{ code, investigator, finishDate: p.rec.finishDate ?? null }];
	});
}

export const buildTdc = defineCampaignBuilder<CampaignTdc>('tdc', (plays) => {
	const glyphsOf = (p: Play) => p.items('glyphs');
	const collected = tallyIds(plays, TDC_GLYPH_IDS, (p, id) => glyphsOf(p).has(id));
	const earned = tallyIds(plays, TDC_ARTIFACTS, (p, id) => p.has(`artifacts_earned.${id}`));
	const progress = plays.map(subjectTaskProgress);

	return {
		fold: countNotes(plays, { west: 'expedition_headed_west', east: 'expedition_headed_east' }),
		glyphs: {
			collected,
			everCollected: Object.keys(collected).length,
			byScenario: Object.fromEntries(
				TDC_GLYPHS_BY_SCENARIO.map((g) => [g.scenario, g.ids.filter((id) => collected[id]).length])
			),
			allTwentySix: plays.filter((p) => TDC_GLYPH_IDS.every((id) => glyphsOf(p).has(id))).length
		},
		artifacts: {
			earned,
			kept: tallyIds(plays, CARRIED_ARTIFACTS, (p, id) => p.has(`hidden.kept_${id}`)),
			everEarned: Object.keys(earned).length,
			allSix: plays.filter((p) => TDC_ARTIFACTS.every((id) => p.has(`artifacts_earned.${id}`)))
				.length
		},
		tasks: {
			best: Math.max(0, ...progress.flat()),
			total: progress.flat().reduce((sum, n) => sum + n, 0),
			obligations: progress.filter((ns) => ns.some((n) => n >= OBLIGATIONS_PROGRESS)).length,
			picked: tallyIds(
				plays,
				TDC_TASKS.map((t) => t.id),
				(p, id) => p.has(`hidden.picked_${id}`)
			),
			assignments: plays
				.flatMap(subjectAssignments)
				.sort((a, b) => (b.finishDate ?? 0) - (a.finishDate ?? 0))
		},
		sepulchre: countNotes(plays, {
			halted: 'halted_cthulhus_awakening',
			didNotConfront: 'did_not_confront_the_nightmare',
			innerSanctum: 'the_inner_sanctum_was_unsealed'
		}),
		scenarios: Object.fromEntries(
			Object.entries(TDC_OUTCOMES).map(([scenario, groups]) => [
				scenario,
				tallyIds(plays, groups.flat(), (p, key) => p.has(key))
			])
		),
		flooded: tallyIds(plays, TDC_FLOODED, (p, id) => p.has(`flooded_neighborhoods.${id}`))
	};
});
