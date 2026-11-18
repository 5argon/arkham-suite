/** The Forgotten Age per-scenario tallies; Extra inputs fill in what the log leaves out. */
import { countNotes, tallyNotes, tallyPlays, type Play } from '../records/play';
import type { Extent, Tally } from '../utils/tally';
import { bumpCount, extentOf } from '../utils/tally';
import { defineCampaignBuilder } from './define';

/** The provisions, in supply-sheet order. */
export const TFA_PROVISIONS = [
	'provisions',
	'medicine',
	'rope',
	'blanket',
	'canteen',
	'torches',
	'compass',
	'map',
	'binoculars',
	'chalk',
	'pendant'
];

/** The exploration scenarios with an Extra input for who gained Poisoned. */
const TFA_POISON_SCENARIOS = [
	'the_untamed_wilds',
	'the_doom_of_eztli',
	'heart_of_the_elders_part_1',
	'heart_of_the_elders_part_2'
];

const TURN_BACK_TIME = 'turn_back_time';
const SEALED_FOREVER = 'sealed_relic_of_ages_forever';

/** Yig's Fury breakpoints: 0 is Don't Tread on Me, 16+ makes Ichtaca refuse your plea at Shattered
 *  Aeons, 25+ is Bane of Yig. */
export type TfaFuryBand = 'immunity' | 'rising' | 'refuse' | 'bane';

function furyBand(fury: number): TfaFuryBand {
	if (fury <= 0) return 'immunity';
	if (fury < 16) return 'rising';
	if (fury < 25) return 'refuse';
	return 'bane';
}

/** The Depths of Yoth starting agenda a final Fury seeds; 0 is the special setup with Yig in play. */
function depthsAgendaFor(fury: number): number {
	if (fury <= 0) return 0;
	if (fury <= 5) return 1;
	if (fury <= 10) return 2;
	if (fury <= 14) return 3;
	if (fury <= 17) return 4;
	if (fury <= 20) return 5;
	return 6;
}

export interface TfaFuryRun {
	finishDate: number | null;
	fury: number;
	band: TfaFuryBand;
	/** The Depths of Yoth starting agenda this Fury seeds. */
	depthsAgenda: number;
}

export interface TfaStanding {
	/** Plays that earned their trust or bond (Ichtaca) or trust or rescue (Alejandro). */
	standing: number;
	/** Every note about them, summed. */
	recorded: number;
}

export interface CampaignTfa {
	family: string;
	plays: number;
	/** Yig's Fury. The log keeps only each play's final value; Fury only rises, so it is an upper
	 *  bound for the checks along the way. */
	vengeance: Extent & {
		lifetime: number;
		/** Ascending by agenda. */
		depthsAgenda: { agenda: number; plays: number }[];
		/** Plays ending on 16+ Fury. */
		ichtacaRefused: number;
		/** Oldest first. */
		runs: TfaFuryRun[];
	};
	/** Provision id → times the subject's investigators took it. */
	supplies: Record<string, number>;
	/** Plays that recorded supplies. */
	suppliesRuns: number;
	/** Of those, plays where the subject took nothing. */
	suppliesEmptyRuns: number;
	ichtaca: { trust: number; wary: number; bond: number; inTheDark: number } & TfaStanding;
	alejandro: { followed: number; remained: number; rescued: number; missing: number; trust: number } & TfaStanding;
	harbinger: {
		/** The log's final `harbinger_alive` damage. */
		final: Extent;
		/** Extra: the damage dealt at each appearance. */
		eztli: Extent;
		hote2: Extent;
		/** Plays whose every recorded damage value was 0. */
		neverDamaged: number;
	};
	/** Extra, the subject's investigators only. */
	poison: {
		total: number;
		/** Most poisoned first. */
		byInvestigator: { code: string; count: number }[];
		/** Scenario id → poisonings there. */
		byScenario: Record<string, number>;
	};
	untamedWilds: { clearedPath: number };
	/** `retriesMax` is Extra. */
	doomOfEztli: { investigatorsRelic: number; alejandroRelic: number; retriesMax: number | null };
	/** `listenedIchtaca` / `letHerLeave` are the Extra `ichtaca_conversation`. */
	threadsOfFate: {
		relicToAlejandro: number;
		relicToHarlan: number;
		listenedIchtaca: number;
		letHerLeave: number;
		forgingOwnPath: number;
	};
	/** Knowing 6 paths skips Heart of the Elders, Part 1. */
	boundaryBeyond: { pathsKnownMax: number | null; part1Skipped: number; ichtacaConfidence: number };
	/** Extra: whom you consulted at Heart of the Elders, Part 1. */
	heartOfElders: {
		consultIchtaca: number;
		consultAlejandro: number;
		consultJournal: number;
		consultNothing: number;
	};
	cityOfArchives: {
		cooperated: number;
		resisted: number;
		memoriesExpunged: number;
		perfected: number;
		successful: number;
		backfired: number;
		backfiredSpectacularly: number;
		/** Extra: the subject's investigators who suffered the body-swap aftermath, over all plays. */
		yithianAftermath: number;
	};
	/** Extra. */
	depthsOfYoth: { finalDepth: Extent };
	shatteredAeons: {
		mendedTear: number;
		savedSerpents: number;
		savedYithians: number;
		fabricUnwoven: number;
		turnedBackTime: number;
	};
	/** A lost Turn Back Time logs nothing of its own, so `reached` also counts plays with its XP or
	 *  resolution recorded. */
	turnBackTime: { reached: Tally; sealedForever: Tally };
}

/** An Extra counter's value, if recorded. */
function counter(p: Play, scenario: string, id: string): number | undefined {
	const raw = p.choice(scenario, id);
	const n = Number(raw);
	return raw !== undefined && Number.isFinite(n) ? n : undefined;
}

/** A `cards` Extra input's investigator codes, limited to the subject's when there is one. */
function subjectCodes(p: Play, scenario: string, id: string): string[] {
	const codes = (p.choice(scenario, id) ?? '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	const subject = p.rec.subjectInvestigators ?? [];
	return subject.length === 0 ? codes : codes.filter((c) => subject.includes(c));
}

/** The provisions the subject's investigators took; supply items are `<investigator>.<provision>`. */
function subjectSupplies(p: Play): string[] {
	const subject = p.rec.subjectInvestigators ?? [];
	return [...p.items('supplies')].flatMap((item) => {
		const dot = item.indexOf('.');
		if (dot < 0) return [];
		const inv = item.slice(0, dot);
		return subject.length === 0 || subject.includes(inv) ? [item.slice(dot + 1)] : [];
	});
}

const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);

export const buildTfa = defineCampaignBuilder<CampaignTfa>('tfa', (plays) => {
	const runs: TfaFuryRun[] = plays
		.flatMap((p) => {
			const fury = p.count('yigs_fury');
			if (fury === undefined) return [];
			const finishDate = p.rec.finishDate ?? null;
			return [{ finishDate, fury, band: furyBand(fury), depthsAgenda: depthsAgendaFor(fury) }];
		})
		.sort((a, b) => (a.finishDate ?? 0) - (b.finishDate ?? 0));
	const agendaPlays: Record<string, number> = {};
	for (const r of runs) bumpCount(agendaPlays, String(r.depthsAgenda));

	const supplies: Record<string, number> = {};
	let suppliesRuns = 0;
	let suppliesEmptyRuns = 0;
	for (const p of plays) {
		if (!p.items('supplies').size) continue;
		suppliesRuns += 1;
		const took = subjectSupplies(p);
		for (const id of took) bumpCount(supplies, id);
		if (!took.length) suppliesEmptyRuns += 1;
	}

	const ichtaca = countNotes(plays, {
		trust: 'earned_ichtacas_trust',
		wary: 'ichtaca_is_wary',
		bond: 'forged_bond_with_ichtaca',
		inTheDark: 'ichtaca_in_the_dark'
	});
	const alejandro = countNotes(plays, {
		followed: 'alejandro_followed_to_ruins',
		remained: 'alejandro_remained_at_camp',
		rescued: 'rescued_alejandro',
		missing: 'alejandro_is_missing',
		trust: 'earned_alejandros_trust'
	});

	const damage = plays.map((p) => ({
		final: p.count('harbinger_alive'),
		eztli: counter(p, 'the_doom_of_eztli', 'harbinger_damage'),
		hote2: counter(p, 'heart_of_the_elders_part_2', 'harbinger_damage')
	}));

	const poisonBy: Record<string, number> = {};
	const byScenario: Record<string, number> = {};
	for (const p of plays)
		for (const scenario of TFA_POISON_SCENARIOS)
			for (const code of subjectCodes(p, scenario, 'poisoned')) {
				bumpCount(poisonBy, code);
				bumpCount(byScenario, scenario);
			}

	const paths = plays.map((p) => p.count('paths_known'));
	const consulted = (who: string) =>
		plays.filter((p) => p.choice('heart_of_the_elders_part_1', 'consult') === who).length;
	const conversation = (value: string) =>
		plays.filter((p) => p.choice('threads_of_fate', 'ichtaca_conversation') === value).length;

	return {
		vengeance: {
			...extentOf(runs.map((r) => r.fury)),
			lifetime: runs.reduce((n, r) => n + r.fury, 0),
			depthsAgenda: Object.entries(agendaPlays)
				.map(([agenda, n]) => ({ agenda: Number(agenda), plays: n }))
				.sort((a, b) => a.agenda - b.agenda),
			ichtacaRefused: runs.filter((r) => r.band === 'refuse' || r.band === 'bane').length,
			runs
		},
		supplies,
		suppliesRuns,
		suppliesEmptyRuns,
		ichtaca: { ...ichtaca, standing: ichtaca.trust + ichtaca.bond, recorded: sum(ichtaca) },
		alejandro: { ...alejandro, standing: alejandro.trust + alejandro.rescued, recorded: sum(alejandro) },
		harbinger: {
			final: extentOf(damage.map((d) => d.final)),
			eztli: extentOf(damage.map((d) => d.eztli)),
			hote2: extentOf(damage.map((d) => d.hote2)),
			neverDamaged: damage.filter((d) => {
				const values = [d.final, d.eztli, d.hote2].filter((v) => v !== undefined);
				return values.length > 0 && values.every((v) => v === 0);
			}).length
		},
		poison: {
			total: sum(poisonBy),
			byInvestigator: Object.entries(poisonBy)
				.map(([code, count]) => ({ code, count }))
				.sort((a, b) => b.count - a.count),
			byScenario
		},
		untamedWilds: countNotes(plays, { clearedPath: 'cleared_path_to_temple' }),
		doomOfEztli: {
			...countNotes(plays, {
				investigatorsRelic: 'investigators_recovered_relic',
				alejandroRelic: 'alejandro_recovered_relic'
			}),
			retriesMax: extentOf(plays.map((p) => counter(p, 'the_doom_of_eztli', 'retries'))).max
		},
		threadsOfFate: {
			...countNotes(plays, {
				relicToAlejandro: 'gave_relic_to_alejandro',
				relicToHarlan: 'gave_relic_to_harlan',
				forgingOwnPath: 'forging_own_path'
			}),
			listenedIchtaca: conversation('stop_her'),
			letHerLeave: conversation('let_her_leave')
		},
		boundaryBeyond: {
			pathsKnownMax: extentOf(paths).max,
			part1Skipped: paths.filter((n) => n !== undefined && n >= 6).length,
			...countNotes(plays, { ichtacaConfidence: 'ichtaca_has_confidence' })
		},
		heartOfElders: {
			consultIchtaca: consulted('ichtaca'),
			consultAlejandro: consulted('alejandro'),
			consultJournal: consulted('journal'),
			consultNothing: consulted('nothing')
		},
		cityOfArchives: {
			...countNotes(plays, {
				cooperated: 'cooperated_with_yithians',
				resisted: 'resisted_captivity',
				memoriesExpunged: 'had_memories_expunged',
				perfected: 'process_was_perfected',
				successful: 'process_was_successful',
				backfired: 'process_backfired',
				backfiredSpectacularly: 'process_backfired_spectacularly'
			}),
			yithianAftermath: plays.reduce(
				(n, p) => n + subjectCodes(p, 'the_city_of_archives', 'yithian_aftermath').length,
				0
			)
		},
		depthsOfYoth: {
			finalDepth: extentOf(plays.map((p) => counter(p, 'the_depths_of_yoth', 'final_depth')))
		},
		shatteredAeons: countNotes(plays, {
			mendedTear: 'mended_tear_in_time',
			savedSerpents: 'investigators_saved_serpents',
			savedYithians: 'investigators_saved_yithians',
			fabricUnwoven: 'fabric_of_time_unwoven',
			turnedBackTime: 'turned_back_time'
		}),
		turnBackTime: {
			reached: tallyPlays(
				plays,
				(p) =>
					TURN_BACK_TIME in (p.rec.scenarioXp ?? {}) ||
					p.resolution(TURN_BACK_TIME) !== undefined ||
					p.has(SEALED_FOREVER)
			),
			...tallyNotes(plays, { sealedForever: SEALED_FOREVER })
		}
	};
});
