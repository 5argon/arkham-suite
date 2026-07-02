/**
 * tfa.ts — The Forgotten Age bespoke per-campaign tallies. ONE builder, ONE payload
 * blob (`tfa`), mirroring `dwl.ts` / `ptc.ts`. Log-derived where the campaign log
 * carries the fact; ArkhamCards-mirroring Extra inputs fill the genuinely-unlogged gaps.
 *
 *   • vengeance — Yig's Fury (`count`): final per play (max/min) + lifetime, and the
 *     campaign-spanning breakpoints it crosses (most visibly The Depths of Yoth's
 *     starting agenda). The log holds only the FINAL total; since Fury only rises it's
 *     an upper bound, reliable for the late checks.
 *   • runs — one entry per play (final Fury, seeded Depths agenda, final depth, the
 *     finale ending), for the Yig's Fury threshold meter + signature runs.
 *   • supplies — provisions, tied to the PROFILE SUBJECT's investigators (the supply
 *     key is `supplies.<inv>.<id>`), counting how many times the subject took each.
 *   • companions — Ichtaca & Alejandro standing across scenarios.
 *   • harbinger — the recurring Harbinger of Valusia's damage: the log's final
 *     `campaign_notes.harbinger_alive` value plus each tracked appearance (Extra).
 *   • poison — the Poisoned weakness gained per exploration scenario (Extra), the
 *     campaign's signature survival tax, subject-scoped.
 *   • per-scenario — each story scenario's logged decisions/outcomes, with the hidden
 *     log entries (`hote_consult_*`, `listened_to_ichtaca`, `final_depth`) our editor
 *     never surfaces re-sourced from the matching ArkhamCards Extra inputs.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';
import { filterFamilyRecords } from '../records/campaign-family';

const TFA_FAMILY = 'tfa';
const NOTES = 'campaign_notes';
const k = (id: string) => `${NOTES}.${id}`;
const SUPPLIES = 'supplies';

/** The 11 provisions, in supply-sheet order. */
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

/** The four exploration scenarios ArkhamCards asks "did any investigator gain Poisoned?" after. */
export const TFA_POISON_SCENARIOS = [
	'the_untamed_wilds',
	'the_doom_of_eztli',
	'heart_of_the_elders_part_1',
	'heart_of_the_elders_part_2'
];

/** Story-card codes used for bespoke header art. */
export const TFA_ICHTACA_CODE = '04147';
export const TFA_ALEJANDRO_CODE = '04051';
export const TFA_HARBINGER_CODE = '04062';
export const TFA_YIG_CODE = '04296';
export const TFA_RELIC_CODE = '04061';
export const TFA_POISONED_CODE = '04102';

/** The Depths of Yoth starting agenda for a given final Yig's Fury (the verified breakpoints).
 *  0 = the special (Yig seeded) setup; 1..6 = which agenda you begin on. */
export function depthsAgendaFor(fury: number): number {
	if (fury <= 0) return 0;
	if (fury <= 5) return 1;
	if (fury <= 10) return 2;
	if (fury <= 14) return 3;
	if (fury <= 17) return 4;
	if (fury <= 20) return 5;
	return 6;
}

/** The finale each play reached, in resolved order (Turn Back Time's seal outranks the rewind). */
export type TfaEnding =
	| 'sealed_forever'
	| 'mended_tear'
	| 'saved_serpents'
	| 'saved_yithians'
	| 'fabric_unwoven'
	| 'turned_back_time';

/** One recorded TFA play — the spine of the Yig's Fury meter and the signature-run picks. */
export interface TfaRun {
	finishDate: number | null;
	/** Final Yig's Fury for this play (null if not recorded). */
	yigsFury: number | null;
	/** Depths-of-Yoth starting agenda seeded by this play's Fury (null if no Fury). */
	depthsAgenda: number | null;
	/** Final depth reached in The Depths of Yoth (Extra; null if not recorded). */
	finalDepth: number | null;
	/** The finale this play reached (null if the campaign didn't reach an ending). */
	ending: TfaEnding | null;
}

/** A max/min/count triple over recorded values. */
interface Extent {
	max: number | null;
	min: number | null;
	recorded: number;
}

export interface CampaignTfa {
	family: string;
	plays: number;
	/** One entry per play, most-recent orderable by `finishDate`. */
	runs: TfaRun[];
	vengeance: {
		max: number | null;
		min: number | null;
		/** Lifetime sum of Yig's Fury across plays. */
		lifetime: number;
		/** Plays that recorded a Yig's Fury value. */
		recorded: number;
		/** Depths-of-Yoth starting agenda (0..6, from each play's final Fury) → plays. */
		depthsAgenda: Record<number, number>;
		/** Plays whose final Fury was 16+ (The Shattered Aeons: Ichtaca refuses your plea). */
		ichtacaRefused: number;
	};
	/** provision id → times the profile subject took it (across their investigator-runs). */
	supplies: Record<string, number>;
	/** Plays where the subject packed nothing (the "Who Needs Any of This Junk?" line). */
	suppliesEmptyRuns: number;
	/** Plays that recorded any supply data for the subject (denominator for the empty count). */
	suppliesRuns: number;
	ichtaca: { trust: number; wary: number; bond: number; inTheDark: number };
	alejandro: { followed: number; remained: number; rescued: number; missing: number; trust: number };
	/** Harbinger of Valusia's damage. `max/min/recorded` = the log's final
	 *  `campaign_notes.harbinger_alive`; `eztli`/`hote2` = each tracked appearance (Extra);
	 *  `neverDamaged` = plays where every recorded Harbinger damage value was 0. */
	harbinger: Extent & {
		eztli: Extent;
		hote2: Extent;
		neverDamaged: number;
	};
	/** The Poisoned weakness (Extra): the campaign's signature survival tax, subject-scoped. */
	poison: {
		/** Total poisonings recorded across the subject's investigators. */
		total: number;
		/** investigator code → times poisoned. */
		byInvestigator: Record<string, number>;
		/** scenario id → poisonings recorded there. */
		byScenario: Record<string, number>;
		/** Plays that recorded at least one poisoning. */
		runsRecorded: number;
	};
	untamedWilds: { clearedPath: number };
	doomOfEztli: { investigatorsRelic: number; alejandroRelic: number; retries: number[] };
	threadsOfFate: {
		relicToAlejandro: number;
		relicToHarlan: number;
		/** Extra `ichtaca_conversation` = 'stop_her' (you listened before she left). */
		listenedIchtaca: number;
		/** Extra `ichtaca_conversation` = 'let_her_leave'. */
		letHerLeave: number;
		forgingOwnPath: number;
		rescuedAlejandro: number;
		alejandroMissing: number;
	};
	boundaryBeyond: { pathsKnownMax: number | null; part1Skipped: number; ichtacaConfidence: number };
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
		/** Subject's investigators who suffered the Yithian aftermath (Extra), total across plays. */
		yithianAftermath: number;
	};
	depthsOfYoth: { finalDepthMax: number | null; finalDepthMin: number | null; recorded: number };
	shatteredAeons: {
		mendedTear: number;
		savedSerpents: number;
		savedYithians: number;
		fabricUnwoven: number;
		turnedBackTime: number;
	};
	turnBackTime: { sealedForever: number };
}

const emptyExtent = (): Extent => ({ max: null, min: null, recorded: 0 });
function bumpExtent(e: Extent, v: number) {
	e.recorded += 1;
	e.max = e.max === null ? v : Math.max(e.max, v);
	e.min = e.min === null ? v : Math.min(e.min, v);
}

/** Comma-joined investigator codes from a `cards` Extra input, scoped to the subject when known. */
function subjectCodes(raw: string | undefined, subject: string[]): string[] {
	if (!raw) return [];
	const codes = raw
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	return subject.length === 0 ? codes : codes.filter((c) => subject.includes(c));
}

export function buildTfa(records: CampaignRecord[]): CampaignTfa[] {
	const baseLog = getCampaignLog(TFA_FAMILY);
	if (!baseLog) return [];
	const tfaRecords = filterFamilyRecords(records, TFA_FAMILY);
	if (tfaRecords.length === 0) return [];

	const runs: TfaRun[] = [];
	const vengeance = {
		max: null as number | null,
		min: null as number | null,
		lifetime: 0,
		recorded: 0,
		depthsAgenda: {} as Record<number, number>,
		ichtacaRefused: 0
	};
	const supplies: Record<string, number> = {};
	let suppliesEmptyRuns = 0;
	let suppliesRuns = 0;
	const ichtaca = { trust: 0, wary: 0, bond: 0, inTheDark: 0 };
	const alejandro = { followed: 0, remained: 0, rescued: 0, missing: 0, trust: 0 };
	const harbinger = {
		...emptyExtent(),
		eztli: emptyExtent(),
		hote2: emptyExtent(),
		neverDamaged: 0
	};
	const poison = {
		total: 0,
		byInvestigator: {} as Record<string, number>,
		byScenario: {} as Record<string, number>,
		runsRecorded: 0
	};
	const untamedWilds = { clearedPath: 0 };
	const doomOfEztli = { investigatorsRelic: 0, alejandroRelic: 0, retries: [] as number[] };
	const threadsOfFate = {
		relicToAlejandro: 0,
		relicToHarlan: 0,
		listenedIchtaca: 0,
		letHerLeave: 0,
		forgingOwnPath: 0,
		rescuedAlejandro: 0,
		alejandroMissing: 0
	};
	const boundaryBeyond = { pathsKnownMax: null as number | null, part1Skipped: 0, ichtacaConfidence: 0 };
	const heartOfElders = { consultIchtaca: 0, consultAlejandro: 0, consultJournal: 0, consultNothing: 0 };
	const cityOfArchives = {
		cooperated: 0,
		resisted: 0,
		memoriesExpunged: 0,
		perfected: 0,
		successful: 0,
		backfired: 0,
		backfiredSpectacularly: 0,
		yithianAftermath: 0
	};
	const depthsOfYoth = {
		finalDepthMax: null as number | null,
		finalDepthMin: null as number | null,
		recorded: 0
	};
	const shatteredAeons = {
		mendedTear: 0,
		savedSerpents: 0,
		savedYithians: 0,
		fabricUnwoven: 0,
		turnedBackTime: 0
	};
	const turnBackTime = { sealedForever: 0 };

	for (const rec of tfaRecords) {
		const logs = rec.recorded.recordedLogs ?? new Set<string>();
		const has = (key: string) => logs.has(key);
		const counts = rec.recorded.logCounts ?? {};
		const choice = (key: string) => rec.scenarioChoices?.[key];
		const subjectInvs = rec.subjectInvestigators ?? [];

		// Yig's Fury — final count (a `count` section, keyed bare) + breakpoints.
		const fury = counts['yigs_fury'];
		let depthsAgenda: number | null = null;
		if (fury !== undefined) {
			vengeance.recorded += 1;
			vengeance.lifetime += fury;
			vengeance.max = vengeance.max === null ? fury : Math.max(vengeance.max, fury);
			vengeance.min = vengeance.min === null ? fury : Math.min(vengeance.min, fury);
			depthsAgenda = depthsAgendaFor(fury);
			vengeance.depthsAgenda[depthsAgenda] = (vengeance.depthsAgenda[depthsAgenda] ?? 0) + 1;
			if (fury >= 16) vengeance.ichtacaRefused += 1;
		}

		// Provisions — tied to the profile subject's investigators (key = supplies.<inv>.<id>).
		const supplySet = rec.recorded.recordedSectionItems?.[SUPPLIES];
		let runSupplies = 0;
		if (supplySet) {
			suppliesRuns += 1;
			for (const item of supplySet) {
				const dot = item.indexOf('.');
				if (dot < 0) continue;
				const inv = item.slice(0, dot);
				const provision = item.slice(dot + 1);
				if (subjectInvs.length === 0 || subjectInvs.includes(inv)) {
					supplies[provision] = (supplies[provision] ?? 0) + 1;
					runSupplies += 1;
				}
			}
			if (runSupplies === 0) suppliesEmptyRuns += 1;
		}

		// Companions.
		if (has(k('earned_ichtacas_trust'))) ichtaca.trust += 1;
		if (has(k('ichtaca_is_wary'))) ichtaca.wary += 1;
		if (has(k('forged_bond_with_ichtaca'))) ichtaca.bond += 1;
		if (has(k('ichtaca_in_the_dark'))) ichtaca.inTheDark += 1;
		if (has(k('alejandro_followed_to_ruins'))) alejandro.followed += 1;
		if (has(k('alejandro_remained_at_camp'))) alejandro.remained += 1;
		if (has(k('rescued_alejandro'))) alejandro.rescued += 1;
		if (has(k('alejandro_is_missing'))) alejandro.missing += 1;
		if (has(k('earned_alejandros_trust'))) alejandro.trust += 1;

		// Harbinger of Valusia — the log's final damage (a count entry in `campaign_notes`,
		// keyed by its composite key) + each tracked appearance (Extra counters).
		const hpFinal = counts[k('harbinger_alive')];
		if (hpFinal !== undefined) bumpExtent(harbinger, hpFinal);
		const hpEztli = Number(choice('the_doom_of_eztli.harbinger_damage'));
		const hasEztliDmg = choice('the_doom_of_eztli.harbinger_damage') !== undefined && Number.isFinite(hpEztli);
		if (hasEztliDmg) bumpExtent(harbinger.eztli, hpEztli);
		const hpHote2 = Number(choice('heart_of_the_elders_part_2.harbinger_damage'));
		const hasHote2Dmg =
			choice('heart_of_the_elders_part_2.harbinger_damage') !== undefined && Number.isFinite(hpHote2);
		if (hasHote2Dmg) bumpExtent(harbinger.hote2, hpHote2);
		// "We have an understanding" — a play that recorded Harbinger damage, all of it zero.
		const dmgValues = [
			hpFinal,
			hasEztliDmg ? hpEztli : undefined,
			hasHote2Dmg ? hpHote2 : undefined
		].filter((v): v is number => v !== undefined);
		if (dmgValues.length > 0 && dmgValues.every((v) => v === 0)) harbinger.neverDamaged += 1;

		// Poisoned weakness (Extra) — subject-scoped, per exploration scenario.
		let runPoisoned = 0;
		for (const scenario of TFA_POISON_SCENARIOS) {
			const codes = subjectCodes(choice(`${scenario}.poisoned`), subjectInvs);
			for (const code of codes) {
				poison.total += 1;
				poison.byInvestigator[code] = (poison.byInvestigator[code] ?? 0) + 1;
				poison.byScenario[scenario] = (poison.byScenario[scenario] ?? 0) + 1;
				runPoisoned += 1;
			}
		}
		if (runPoisoned > 0) poison.runsRecorded += 1;

		// The Untamed Wilds.
		if (has(k('cleared_path_to_temple'))) untamedWilds.clearedPath += 1;

		// The Doom of Eztli — relic + retries (Extra counter).
		if (has(k('investigators_recovered_relic'))) doomOfEztli.investigatorsRelic += 1;
		if (has(k('alejandro_recovered_relic'))) doomOfEztli.alejandroRelic += 1;
		const retry = Number(choice('the_doom_of_eztli.retries'));
		if (Number.isFinite(retry) && retry > 0) doomOfEztli.retries.push(retry);

		// Threads of Fate — the big branch. The Ichtaca conversation lives in the hidden log,
		// so it is re-sourced from the matching Extra input.
		if (has(k('gave_relic_to_alejandro'))) threadsOfFate.relicToAlejandro += 1;
		if (has(k('gave_relic_to_harlan'))) threadsOfFate.relicToHarlan += 1;
		const conversation = choice('threads_of_fate.ichtaca_conversation');
		if (conversation === 'stop_her') threadsOfFate.listenedIchtaca += 1;
		if (conversation === 'let_her_leave') threadsOfFate.letHerLeave += 1;
		if (has(k('forging_own_path'))) threadsOfFate.forgingOwnPath += 1;
		if (has(k('rescued_alejandro'))) threadsOfFate.rescuedAlejandro += 1;
		if (has(k('alejandro_is_missing'))) threadsOfFate.alejandroMissing += 1;

		// The Boundary Beyond — paths known (a count entry in `campaign_notes`; 6 skips HotE Part 1).
		const paths = counts[k('paths_known')];
		if (paths !== undefined) {
			boundaryBeyond.pathsKnownMax =
				boundaryBeyond.pathsKnownMax === null ? paths : Math.max(boundaryBeyond.pathsKnownMax, paths);
			if (paths >= 6) boundaryBeyond.part1Skipped += 1;
		}
		if (has(k('ichtaca_has_confidence'))) boundaryBeyond.ichtacaConfidence += 1;

		// Heart of the Elders — whom you consulted (hidden log → Extra radio).
		const consult = choice('heart_of_the_elders_part_1.consult');
		if (consult === 'ichtaca') heartOfElders.consultIchtaca += 1;
		else if (consult === 'alejandro') heartOfElders.consultAlejandro += 1;
		else if (consult === 'journal') heartOfElders.consultJournal += 1;
		else if (consult === 'nothing') heartOfElders.consultNothing += 1;

		// The City of Archives — the Yithian process + the body-swap aftermath (Extra).
		if (has(k('cooperated_with_yithians'))) cityOfArchives.cooperated += 1;
		if (has(k('resisted_captivity'))) cityOfArchives.resisted += 1;
		if (has(k('had_memories_expunged'))) cityOfArchives.memoriesExpunged += 1;
		if (has(k('process_was_perfected'))) cityOfArchives.perfected += 1;
		if (has(k('process_was_successful'))) cityOfArchives.successful += 1;
		if (has(k('process_backfired'))) cityOfArchives.backfired += 1;
		if (has(k('process_backfired_spectacularly'))) cityOfArchives.backfiredSpectacularly += 1;
		cityOfArchives.yithianAftermath += subjectCodes(
			choice('the_city_of_archives.yithian_aftermath'),
			subjectInvs
		).length;

		// The Depths of Yoth — how deep (hidden log → Extra counter).
		const depthRaw = choice('the_depths_of_yoth.final_depth');
		const depth = Number(depthRaw);
		let finalDepth: number | null = null;
		if (depthRaw !== undefined && Number.isFinite(depth)) {
			finalDepth = depth;
			depthsOfYoth.recorded += 1;
			depthsOfYoth.finalDepthMax =
				depthsOfYoth.finalDepthMax === null ? depth : Math.max(depthsOfYoth.finalDepthMax, depth);
			depthsOfYoth.finalDepthMin =
				depthsOfYoth.finalDepthMin === null ? depth : Math.min(depthsOfYoth.finalDepthMin, depth);
		}

		// Shattered Aeons + Turn Back Time — the finale & true ending.
		if (has(k('mended_tear_in_time'))) shatteredAeons.mendedTear += 1;
		if (has(k('investigators_saved_serpents'))) shatteredAeons.savedSerpents += 1;
		if (has(k('investigators_saved_yithians'))) shatteredAeons.savedYithians += 1;
		if (has(k('fabric_of_time_unwoven'))) shatteredAeons.fabricUnwoven += 1;
		if (has(k('turned_back_time'))) shatteredAeons.turnedBackTime += 1;
		if (has(k('sealed_relic_of_ages_forever'))) turnBackTime.sealedForever += 1;

		// The finale this play reached — the seal outranks the rewind that unlocks it.
		let ending: TfaEnding | null = null;
		if (has(k('sealed_relic_of_ages_forever'))) ending = 'sealed_forever';
		else if (has(k('mended_tear_in_time'))) ending = 'mended_tear';
		else if (has(k('investigators_saved_serpents'))) ending = 'saved_serpents';
		else if (has(k('investigators_saved_yithians'))) ending = 'saved_yithians';
		else if (has(k('fabric_of_time_unwoven'))) ending = 'fabric_unwoven';
		else if (has(k('turned_back_time'))) ending = 'turned_back_time';

		runs.push({
			finishDate: rec.finishDate ?? null,
			yigsFury: fury ?? null,
			depthsAgenda,
			finalDepth,
			ending
		});
	}

	return [
		{
			family: TFA_FAMILY,
			plays: tfaRecords.length,
			runs,
			vengeance,
			supplies,
			suppliesEmptyRuns,
			suppliesRuns,
			ichtaca,
			alejandro,
			harbinger,
			poison,
			untamedWilds,
			doomOfEztli,
			threadsOfFate,
			boundaryBeyond,
			heartOfElders,
			cityOfArchives,
			depthsOfYoth,
			shatteredAeons,
			turnBackTime
		}
	];
}
