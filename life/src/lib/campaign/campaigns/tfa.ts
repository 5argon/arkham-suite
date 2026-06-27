/**
 * tfa.ts — The Forgotten Age bespoke per-campaign tallies. ONE builder, ONE payload
 * blob (`tfa`), mirroring `dwl.ts` / `ptc.ts`. Mostly log-derived; the Harbinger
 * per-scenario trajectory + the Doom of Eztli retry count need Extra-tab counters
 * (the latter is wired here via a `scenarioChoice`, see `tfa-widgets-plan.md`).
 *
 *   • vengeance — Yig's Fury (`count`): final per play (max/min) + lifetime, and the
 *     campaign-spanning breakpoints it crosses (most visibly The Depths of Yoth's
 *     starting agenda). The log holds only the FINAL total; since Fury only rises it's
 *     an upper bound, reliable for the late checks.
 *   • supplies  — provisions, tied to the PROFILE SUBJECT's investigators (the supply
 *     key is `supplies.<inv>.<id>`), counting how many times the subject took each.
 *   • companions— Ichtaca & Alejandro standing across scenarios.
 *   • harbinger — the recurring Harbinger of Valusia's remaining health (`harbinger_alive`).
 *   • per-scenario — each story scenario's logged decisions/outcomes.
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

/** Ichtaca / Alejandro ally story-asset cards (human side) for the companions widget. */
export const TFA_ICHTACA_CODE = '04147';
export const TFA_ALEJANDRO_CODE = '04051';

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

export interface CampaignTfa {
	family: string;
	plays: number;
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
	ichtaca: { trust: number; wary: number; bond: number; inTheDark: number };
	alejandro: { followed: number; remained: number; rescued: number; missing: number; trust: number };
	/** Harbinger of Valusia's remaining health when last recorded (`harbinger_alive`). */
	harbinger: { max: number | null; min: number | null; recorded: number };
	untamedWilds: { clearedPath: number };
	doomOfEztli: { investigatorsRelic: number; alejandroRelic: number; retries: number[] };
	threadsOfFate: {
		relicToAlejandro: number;
		relicToHarlan: number;
		listenedIchtaca: number;
		forgingOwnPath: number;
		rescuedAlejandro: number;
		alejandroMissing: number;
	};
	boundaryBeyond: { pathsKnownMax: number | null; part1Skipped: number; ichtacaConfidence: number };
	heartOfElders: { consultIchtaca: number; consultAlejandro: number; consultJournal: number };
	cityOfArchives: {
		cooperated: number;
		resisted: number;
		memoriesExpunged: number;
		perfected: number;
		successful: number;
		backfired: number;
		backfiredSpectacularly: number;
	};
	depthsOfYoth: { finalDepthMax: number | null; finalDepthMin: number | null };
	shatteredAeons: {
		mendedTear: number;
		savedSerpents: number;
		savedYithians: number;
		fabricUnwoven: number;
		turnedBackTime: number;
	};
	turnBackTime: { sealedForever: number };
}

export function buildTfa(records: CampaignRecord[]): CampaignTfa[] {
	const baseLog = getCampaignLog(TFA_FAMILY);
	if (!baseLog) return [];
	const tfaRecords = filterFamilyRecords(records, TFA_FAMILY);
	if (tfaRecords.length === 0) return [];

	const vengeance = {
		max: null as number | null,
		min: null as number | null,
		lifetime: 0,
		recorded: 0,
		depthsAgenda: {} as Record<number, number>,
		ichtacaRefused: 0
	};
	const supplies: Record<string, number> = {};
	const ichtaca = { trust: 0, wary: 0, bond: 0, inTheDark: 0 };
	const alejandro = { followed: 0, remained: 0, rescued: 0, missing: 0, trust: 0 };
	const harbinger = { max: null as number | null, min: null as number | null, recorded: 0 };
	const untamedWilds = { clearedPath: 0 };
	const doomOfEztli = { investigatorsRelic: 0, alejandroRelic: 0, retries: [] as number[] };
	const threadsOfFate = {
		relicToAlejandro: 0,
		relicToHarlan: 0,
		listenedIchtaca: 0,
		forgingOwnPath: 0,
		rescuedAlejandro: 0,
		alejandroMissing: 0
	};
	const boundaryBeyond = { pathsKnownMax: null as number | null, part1Skipped: 0, ichtacaConfidence: 0 };
	const heartOfElders = { consultIchtaca: 0, consultAlejandro: 0, consultJournal: 0 };
	const cityOfArchives = {
		cooperated: 0,
		resisted: 0,
		memoriesExpunged: 0,
		perfected: 0,
		successful: 0,
		backfired: 0,
		backfiredSpectacularly: 0
	};
	const depthsOfYoth = { finalDepthMax: null as number | null, finalDepthMin: null as number | null };
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

		// Yig's Fury — final count + breakpoints (the count is the lifetime-summable value).
		const fury = counts['yigs_fury'];
		if (fury !== undefined) {
			vengeance.recorded += 1;
			vengeance.lifetime += fury;
			vengeance.max = vengeance.max === null ? fury : Math.max(vengeance.max, fury);
			vengeance.min = vengeance.min === null ? fury : Math.min(vengeance.min, fury);
			const agenda = depthsAgendaFor(fury);
			vengeance.depthsAgenda[agenda] = (vengeance.depthsAgenda[agenda] ?? 0) + 1;
			if (fury >= 16) vengeance.ichtacaRefused += 1;
		}

		// Provisions — tied to the profile subject's investigators (key = supplies.<inv>.<id>).
		const supplySet = rec.recorded.recordedSectionItems?.[SUPPLIES];
		const subjectInvs = rec.subjectInvestigators ?? [];
		if (supplySet) {
			for (const item of supplySet) {
				const dot = item.indexOf('.');
				if (dot < 0) continue;
				const inv = item.slice(0, dot);
				const provision = item.slice(dot + 1);
				// Subject-only when we know the subject's investigators; else count all.
				if (subjectInvs.length === 0 || subjectInvs.includes(inv))
					supplies[provision] = (supplies[provision] ?? 0) + 1;
			}
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

		// Harbinger of Valusia — remaining health.
		const hp = counts['harbinger_alive'];
		if (hp !== undefined) {
			harbinger.recorded += 1;
			harbinger.max = harbinger.max === null ? hp : Math.max(harbinger.max, hp);
			harbinger.min = harbinger.min === null ? hp : Math.min(harbinger.min, hp);
		}

		// The Untamed Wilds.
		if (has(k('cleared_path_to_temple'))) untamedWilds.clearedPath += 1;

		// The Doom of Eztli — relic + retries (Extra-tab counter).
		if (has(k('investigators_recovered_relic'))) doomOfEztli.investigatorsRelic += 1;
		if (has(k('alejandro_recovered_relic'))) doomOfEztli.alejandroRelic += 1;
		const retry = Number(rec.scenarioChoices?.['the_doom_of_eztli.retries']);
		if (Number.isFinite(retry) && retry > 0) doomOfEztli.retries.push(retry);

		// Threads of Fate — the big branch.
		if (has(k('gave_relic_to_alejandro'))) threadsOfFate.relicToAlejandro += 1;
		if (has(k('gave_relic_to_harlan'))) threadsOfFate.relicToHarlan += 1;
		if (has(k('listened_to_ichtaca'))) threadsOfFate.listenedIchtaca += 1;
		if (has(k('forging_own_path'))) threadsOfFate.forgingOwnPath += 1;
		if (has(k('rescued_alejandro'))) threadsOfFate.rescuedAlejandro += 1;
		if (has(k('alejandro_is_missing'))) threadsOfFate.alejandroMissing += 1;

		// The Boundary Beyond — paths known (6 skips Heart of the Elders Part 1).
		const paths = counts['paths_known'];
		if (paths !== undefined) {
			boundaryBeyond.pathsKnownMax =
				boundaryBeyond.pathsKnownMax === null ? paths : Math.max(boundaryBeyond.pathsKnownMax, paths);
			if (paths >= 6) boundaryBeyond.part1Skipped += 1;
		}
		if (has(k('ichtaca_has_confidence'))) boundaryBeyond.ichtacaConfidence += 1;

		// Heart of the Elders — whom you consulted.
		if (has(k('hote_consult_ichtaca'))) heartOfElders.consultIchtaca += 1;
		if (has(k('hote_consult_alejandro'))) heartOfElders.consultAlejandro += 1;
		if (has(k('hote_consult_journal'))) heartOfElders.consultJournal += 1;

		// The City of Archives — the Yithian process.
		if (has(k('cooperated_with_yithians'))) cityOfArchives.cooperated += 1;
		if (has(k('resisted_captivity'))) cityOfArchives.resisted += 1;
		if (has(k('had_memories_expunged'))) cityOfArchives.memoriesExpunged += 1;
		if (has(k('process_was_perfected'))) cityOfArchives.perfected += 1;
		if (has(k('process_was_successful'))) cityOfArchives.successful += 1;
		if (has(k('process_backfired'))) cityOfArchives.backfired += 1;
		if (has(k('process_backfired_spectacularly'))) cityOfArchives.backfiredSpectacularly += 1;

		// The Depths of Yoth — how deep.
		const depth = counts['final_depth'];
		if (depth !== undefined) {
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
	}

	return [
		{
			family: TFA_FAMILY,
			plays: tfaRecords.length,
			vengeance,
			supplies,
			ichtaca,
			alejandro,
			harbinger,
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
