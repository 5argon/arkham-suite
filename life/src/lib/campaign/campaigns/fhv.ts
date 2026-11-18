/** The Feast of Hemlock Vale: the villagers' relationship arcs, each scenario's logged outcomes,
 *  the Day/Night schedule and how Fate of the Vale ended. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { sectionTitle } from '../records/campaign-log-source';
import { countNotes, readPlay, tallyNotes, tallyPlays, type Play } from '../records/play';
import { bumpCount, bumpTally, ensureTally, extentOf, type Tally } from '../utils/tally';
import { defineCampaignBuilder } from './define';

const log = getCampaignLog('fhv');

/** Prelude entries carry their ArkhamCards file id (`07_the_first_evening`); campaign-data names
 *  the scenario without the number. */
const scenarioOf = (entryScenario: string) => entryScenario.replace(/^\d+_/, '');

export interface FhvVillagerDef {
	id: string;
	/** The highest relationship level. */
	max: number;
	/** Every note in the villager's log section, with the scenario that records it. */
	milestones: { id: string; scenario: string }[];
}

/** The eight villagers in campaign-log order, Mother Rachel first. */
export const FHV_VILLAGERS: FhvVillagerDef[] = (log?.db.sections ?? [])
	.filter((s) => s.type === 'relationship')
	.map((s) => ({
		id: s.id,
		max: s.max ?? 0,
		milestones: (log?.db.entries ?? [])
			.filter((e) => e.section === s.id && e.kind === 'note' && !e.hidden)
			.map((e) => ({ id: e.id, scenario: scenarioOf(e.scenario) }))
	}));

/** The villagers who can dance, stand by you or sacrifice themselves; Mother Rachel never does. */
export const FHV_DANCERS = FHV_VILLAGERS.map((v) => v.id).filter((id) => id !== 'rachel');

export function fhvVillagerName(id: string): string {
	return log ? sectionTitle(log, id) : id;
}

/** The areas on the survey checklist. */
export const FHV_AREAS: string[] =
	log?.db.sections.find((s) => s.id === 'areas_surveyed')?.items?.map((i) => i.id) ?? [];

/** Scenarios whose Day/Night slot is an Extra `played_on` pick; the log never records it. */
const SCHEDULABLE = (log?.db.scenarioMeta ?? [])
	.filter((s) => s.choices?.some((c) => c.id === 'played_on'))
	.map((s) => s.id);

export interface FhvOutcomeGroup {
	/** Names the group; the widget maps it to a heading. */
	heading?: 'hybrid' | 'bear' | 'captives';
	/** Full log keys. */
	keys: string[];
	/** Listed only once one of its outcomes is reached. */
	onlyWhenHit?: boolean;
}

/** Each scenario passport's logged outcomes in groups, and the villagers it pictures. */
export const FHV_PASSPORTS: Record<string, { villagers: string[]; groups: FhvOutcomeGroup[] }> = {
	written_in_rock: {
		villagers: ['simeon', 'leah'],
		groups: [
			{
				keys: [
					'simeon.simeon_survived',
					'leah.leah_and_simeon_were_reunited',
					'leah.leah_saw_something_in_the_mine',
					'simeon.simeon_disappeared',
					'campaign_notes.survived_the_horrors_in_the_rock'
				]
			}
		]
	},
	hemlock_house: {
		villagers: ['william', 'judith'],
		groups: [{ keys: ['hidden.found_little_sylvie'] }]
	},
	the_silent_heath: {
		villagers: ['leah'],
		groups: [
			{
				keys: [
					'campaign_notes.laid_the_pearl_family_to_rest',
					'campaign_notes.remains_were_partially_recovered',
					'campaign_notes.madame_pearls_diary_was_recovered',
					'leah.searched_the_pearl_ruins'
				]
			}
		]
	},
	the_lost_sister: {
		villagers: ['theo', 'gideon'],
		groups: [
			{
				keys: [
					'campaign_notes.the_peters_family_was_reunited',
					'campaign_notes.elizabeth_peters_was_saved',
					'theo.theo_reconciled_with_helen',
					'gideon.gideon_found_his_treasure'
				]
			}
		]
	},
	the_thing_in_the_depths: {
		villagers: ['judith'],
		groups: [
			{
				keys: ['campaign_notes.thing_in_the_depths_was_defeated', 'judith.judith_shared_a_grudge']
			},
			{
				heading: 'hybrid',
				keys: [
					'campaign_notes.chelydran_hybrid_lived',
					'campaign_notes.chelydran_hybrid_perished',
					'campaign_notes.chelydran_hybrid_devoured'
				]
			}
		]
	},
	the_twisted_hollow: {
		villagers: ['rachel'],
		groups: [
			{
				keys: [
					'campaign_notes.bertie_was_rescued',
					'campaign_notes.bertie_was_lost_in_the_woods',
					'campaign_notes.mother_rachel_showed_the_way',
					'campaign_notes.lost_the_path',
					'campaign_notes.the_bear_was_wounded'
				]
			},
			{
				heading: 'bear',
				keys: [
					'judith.judith_saved_your_ass',
					'theo.theo_distracted_the_bear',
					'rachel.mother_rachel_intervened'
				],
				onlyWhenHit: true
			}
		]
	},
	the_longest_night: {
		villagers: [],
		groups: [
			{
				heading: 'captives',
				keys: [
					'campaign_notes.captives_were_saved',
					'campaign_notes.many_captives_were_lost',
					'campaign_notes.all_the_captives_were_lost'
				]
			},
			{ keys: ['campaign_notes.faced_the_night_alone', 'campaign_notes.dr_marquez_has_a_plan'] }
		]
	}
};

/** Fate of the Vale's Act 3a versions and the endings each act's resolutions record (printed on
 *  the act's back). */
export const FHV_FATE_VERSIONS: { id: string; resolutions: string[]; endings: string[] }[] = [
	{
		id: 'v1',
		resolutions: ['R1', 'R2'],
		endings: [
			'dr_marquez_sacrificed_herself_for_the_vale',
			'investigators_sacrificed_themselves_for_the_vale'
		]
	},
	{ id: 'v2', resolutions: ['R3'], endings: ['the_vale_was_saved'] },
	{ id: 'v3', resolutions: ['R4'], endings: ['the_vale_burned'] },
	{ id: 'v4', resolutions: ['R5'], endings: ['barely_survived'] }
];
const FATE_ENDINGS = [
	...FHV_FATE_VERSIONS.flatMap((v) => v.endings),
	'became_the_true_feast_of_hemlock_vale'
];

/** The Act 3a version a play faced, from its ending. A loss records no ending, so only the hidden
 *  act note places it. */
export function fateVersionFromRecord(rec: CampaignRecord): string | null {
	const p = readPlay(rec);
	const byEnding = FHV_FATE_VERSIONS.find((v) => v.endings.some((e) => p.has(e)));
	const byAct = FHV_FATE_VERSIONS.find((v) => p.has(`hidden.fate_of_the_vale_act_3a_${v.id}`));
	return (byEnding ?? byAct)?.id ?? null;
}

export interface FhvVillagerTally {
	/** Highest relationship level reached; null when never recorded. */
	maxScore: number | null;
	/** Milestone id → plays. */
	milestones: Record<string, number>;
	danced: Tally;
	stood: Tally;
	sacrificed: Tally;
	/** Saved in the finale (the hidden `fate_of_the_vale_saved_<id>` note). */
	saved: Tally;
}

export interface CampaignFhv {
	family: string;
	plays: number;
	/** Area id → plays that surveyed it. */
	areas: Record<string, Tally>;
	schedule: {
		playedTwistedHollow: Tally;
		playedLongestNight: Tally;
		/** Plays that recorded neither night scenario's outcomes. */
		skippedBothNights: Tally;
		/** Extra `played_on`: scenario → slot → plays. */
		playedOn: Record<string, Record<string, number>>;
	};
	villagers: Record<string, FhvVillagerTally>;
	/** Distinct villagers befriended (relationship 2+), at their highest level, and ever stood by
	 *  you, sacrificed or saved. */
	valeSummary: {
		befriended: number;
		maxed: number;
		stood: number;
		sacrificed: number;
		saved: number;
	};
	/** The Second Evening. */
	dance: {
		helen: Tally;
		rachelDoubts: Tally;
		/** Most partners in one play, Helen included. */
		best: number;
		/** Plays with any dance recorded. */
		plays: Tally;
	};
	/** Extra `hemlock_house.the_argument`. */
	argument: { william: Tally; judith: Tally; neither: Tally };
	longestNight: {
		/** Extra `the_longest_night.rachel_stance`. */
		rachel: { confront: Tally; hide: Tally };
		/** Extra `the_longest_night.captives_damage`: the lowest recorded (0 = a flawless defence);
		 *  null when never recorded. */
		damageBest: number | null;
	};
	finalEvening: {
		believed: number;
		lied: number;
		interrupted: number;
		truce: number;
		gideonTale: number;
		fireworks: number;
	};
	bertie: { epiphany: number; perished: number };
	/** Plays with the hidden `simeon_plan_is_underway` note (Written in Rock). */
	simeonPlanUnderway: number;
	/** Fate of the Vale's endings in version order, the loss last. */
	fateEndings: { id: string; plays: Tally }[];
	/** The Hemlock curse on the subject's investigators. */
	curse: {
		plays: Tally;
		/** Most of the subject's investigators cursed in one play. */
		maxCursed: number;
	};
	/** Scenario → full log key → plays, for the outcomes its passport lists. */
	scenarios: Record<string, Record<string, number>>;
}

const CURSE = 'hemlock_curse_count';

/** The subject's investigators who finished their meal; the curse counter is per investigator. */
function cursedInvestigators(p: Play): number {
	return (p.rec.subjectInvestigators ?? []).filter((code) => (p.count(`${CURSE}.${code}`) ?? 0) > 0)
		.length;
}

function danceSpread(p: Play): number {
	const residents = FHV_DANCERS.filter((d) => p.has(`${d}.${d}_shared_a_dance`)).length;
	return residents + (p.has('helen_shared_a_dance') ? 1 : 0);
}

function captivesDamage(p: Play): number | null {
	const v = p.choice('the_longest_night', 'captives_damage');
	const n = v ? Number(v) : NaN;
	return Number.isFinite(n) ? n : null;
}

export const buildFhv = defineCampaignBuilder<CampaignFhv>('fhv', (plays) => {
	const areas: Record<string, Tally> = {};
	for (const p of plays)
		for (const a of FHV_AREAS)
			if (p.has(`areas_surveyed.${a}`)) bumpTally(ensureTally(areas, a), p.tier);

	const villagers: Record<string, FhvVillagerTally> = {};
	for (const v of FHV_VILLAGERS) {
		const milestones: Record<string, number> = {};
		for (const p of plays)
			for (const ms of v.milestones) if (p.has(`${v.id}.${ms.id}`)) bumpCount(milestones, ms.id);
		villagers[v.id] = {
			maxScore: extentOf(plays.map((p) => p.count(v.id))).max,
			milestones,
			...tallyNotes(plays, {
				danced: `${v.id}.${v.id}_shared_a_dance`,
				stood: `${v.id}.${v.id}_stood_by_you`,
				sacrificed: `${v.id}.${v.id}_sacrificed_himself`,
				saved: `hidden.fate_of_the_vale_saved_${v.id}`
			})
		};
	}
	const residents = FHV_VILLAGERS.map((v) => ({ max: v.max, t: villagers[v.id] }));
	const residentsWith = (pred: (r: (typeof residents)[number]) => boolean) =>
		residents.filter(pred).length;

	const scenarios: Record<string, Record<string, number>> = {};
	for (const [id, { groups }] of Object.entries(FHV_PASSPORTS)) {
		const counts: Record<string, number> = (scenarios[id] = {});
		for (const key of groups.flatMap((g) => g.keys)) {
			const n = plays.filter((p) => p.has(key)).length;
			if (n) counts[key] = n;
		}
	}
	const reached = (scenario: string) => (p: Play) =>
		FHV_PASSPORTS[scenario].groups.some((g) => g.keys.some((key) => p.has(key)));
	const hollow = reached('the_twisted_hollow');
	const night = reached('the_longest_night');

	const playedOn: Record<string, Record<string, number>> = {};
	for (const p of plays)
		for (const sc of SCHEDULABLE) {
			const slot = p.choice(sc, 'played_on');
			if (slot) bumpCount((playedOn[sc] ??= {}), slot);
		}

	const choice = (scenario: string, id: string, value: string) =>
		tallyPlays(plays, (p) => p.choice(scenario, id) === value);

	return {
		areas,
		schedule: {
			playedTwistedHollow: tallyPlays(plays, hollow),
			playedLongestNight: tallyPlays(plays, night),
			skippedBothNights: tallyPlays(plays, (p) => !hollow(p) && !night(p)),
			playedOn
		},
		villagers,
		valeSummary: {
			befriended: residentsWith(({ t }) => (t.maxScore ?? 0) >= 2),
			maxed: residentsWith(({ t, max }) => (t.maxScore ?? 0) >= max),
			stood: residentsWith(({ t }) => t.stood.total > 0),
			sacrificed: residentsWith(({ t }) => t.sacrificed.total > 0),
			saved: residentsWith(({ t }) => t.saved.total > 0)
		},
		dance: {
			...tallyNotes(plays, {
				helen: 'helen_shared_a_dance',
				rachelDoubts: 'rachel.mother_rachel_shared_her_doubts'
			}),
			best: Math.max(0, ...plays.map(danceSpread)),
			plays: tallyPlays(plays, (p) => danceSpread(p) > 0)
		},
		argument: {
			william: choice('hemlock_house', 'the_argument', 'william'),
			judith: choice('hemlock_house', 'the_argument', 'judith'),
			neither: choice('hemlock_house', 'the_argument', 'neither')
		},
		longestNight: {
			rachel: {
				confront: choice('the_longest_night', 'rachel_stance', 'confront'),
				hide: choice('the_longest_night', 'rachel_stance', 'hide')
			},
			damageBest: extentOf(plays.map(captivesDamage)).min
		},
		finalEvening: countNotes(plays, {
			believed: 'believed',
			lied: 'lied_to_mother_rachel',
			interrupted: 'interrupted_the_feast',
			truce: 'the_hemlocks_made_a_truce',
			gideonTale: 'gideon.gideon_finished_the_tale_of_the_annabelle_lee',
			fireworks: 'the_vale_is_full_of_fireworks'
		}),
		bertie: countNotes(plays, { epiphany: 'bertie_had_an_epiphany', perished: 'bertie_perished' }),
		simeonPlanUnderway: plays.filter((p) => p.has('hidden.simeon_plan_is_underway')).length,
		fateEndings: FATE_ENDINGS.map((id) => ({ id, plays: tallyPlays(plays, (p) => p.has(id)) })),
		curse: {
			plays: tallyPlays(plays, (p) => cursedInvestigators(p) > 0),
			maxCursed: Math.max(0, ...plays.map(cursedInvestigators))
		},
		scenarios
	};
});
