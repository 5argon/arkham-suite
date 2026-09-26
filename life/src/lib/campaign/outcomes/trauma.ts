/**
 * Deaths and insanity reached through recorded resolutions: the trauma ArkhamCards applies on each
 * resolution (`resolutionTraumaEffects`) joined with the Extra-tab resolution.
 */
import { getCampaignLog, resolutionTraumaEffects } from '@5argon/arkham-campaign-data';
import type { CardCode } from '@5argon/arkham-kohaku';
import type { CampaignRecord } from '../records/campaign-record';
import { familyOf, contributingFamilies } from '../records/campaign-family';

/** One recorded resolution that kills and/or maddens. */
export interface TraumaEvent {
	/** The play's own family. */
	family: string;
	/** Its own family plus, when merging Return-to, its base family. An event is listed once;
	 *  per-campaign views filter on this. */
	families: string[];
	/** Joins the play's investigators at assembly. */
	campaignId?: string;
	scenario: string;
	resolution: string;
	/** `'maybe'`: behind an in-resolution choice the recorded resolution can't tell apart. */
	killed: 'yes' | 'maybe' | null;
	insane: 'yes' | 'maybe' | null;
	/** Trauma targets as campaign-data names them (`all`, `lead_investigator`, …). */
	targets: string[];
	/** Guaranteed party-wide, so attributable to every investigator in the play. Other targets
	 *  (lead, defeated, not resigned) depend on in-scenario state the log doesn't hold. */
	allKilled: boolean;
	allInsane: boolean;
	/** Absent for a mid-campaign casualty. */
	result?: 'win' | 'lose' | 'mixed';
	/** A win that still killed or maddened. */
	pyrrhic: boolean;
	difficulty: string;
}

export interface InvestigatorTrauma {
	code: CardCode;
	killed: number;
	insane: number;
}

/** Counts of events; `killed` / `insane` count guaranteed trauma only. */
export interface TraumaTally {
	killed: number;
	insane: number;
	killedNotInsane: number;
	insaneNotKilled: number;
	pyrrhic: number;
	/** Guaranteed trauma on a resolution that ends nothing (the campaign went on). */
	casualties: number;
	/** Conditional trauma only. */
	possible: number;
	/** Empty until {@link attributeTraumaInvestigators} fills it at assembly (it needs deck data). */
	perInvestigator: InvestigatorTrauma[];
	events: TraumaEvent[];
}

export function buildTraumaTally(records: CampaignRecord[], mergeReturnTo = true): TraumaTally {
	const events: TraumaEvent[] = [];

	for (const rec of records) {
		const recorded = rec.scenarioResolutions;
		if (!recorded || !Object.keys(recorded).length) continue;
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const family = familyOf(log);
		const families = contributingFamilies(log, mergeReturnTo);
		const difficulty = rec.recorded.difficulty ?? 'standard';
		const byKey = new Map(
			resolutionTraumaEffects(log).map((e) => [`${e.scenario}.${e.resolution}`, e.effect])
		);

		for (const [scenario, resolution] of Object.entries(recorded)) {
			const effect = byKey.get(`${scenario}.${resolution}`);
			if (!effect) continue;

			let killedG = false;
			let killedC = false;
			let insaneG = false;
			let insaneC = false;
			let allKilled = false;
			let allInsane = false;
			const targets = new Set<string>();
			for (const t of effect.trauma) {
				targets.add(t.target);
				if (t.killed) {
					if (t.conditional) killedC = true;
					else {
						killedG = true;
						if (t.target === 'all') allKilled = true;
					}
				}
				if (t.insane) {
					if (t.conditional) insaneC = true;
					else {
						insaneG = true;
						if (t.target === 'all') allInsane = true;
					}
				}
			}

			const killed = killedG ? 'yes' : killedC ? 'maybe' : null;
			const insane = insaneG ? 'yes' : insaneC ? 'maybe' : null;
			events.push({
				family,
				families,
				campaignId: rec.campaignId,
				scenario,
				resolution,
				killed,
				insane,
				targets: [...targets],
				allKilled,
				allInsane,
				result: effect.result,
				pyrrhic: effect.result === 'win' && (killedG || insaneG),
				difficulty
			});
		}
	}

	return {
		killed: events.filter((e) => e.killed === 'yes').length,
		insane: events.filter((e) => e.insane === 'yes').length,
		killedNotInsane: events.filter((e) => e.killed === 'yes' && e.insane !== 'yes').length,
		insaneNotKilled: events.filter((e) => e.insane === 'yes' && e.killed !== 'yes').length,
		pyrrhic: events.filter((e) => e.pyrrhic).length,
		casualties: events.filter((e) => !e.result && (e.killed === 'yes' || e.insane === 'yes'))
			.length,
		possible: events.filter(
			(e) =>
				e.killed !== 'yes' && e.insane !== 'yes' && (e.killed === 'maybe' || e.insane === 'maybe')
		).length,
		perInvestigator: [],
		events
	};
}

/** Guaranteed `all`-target deaths / insanities per investigator of each play, most first. */
export function attributeTraumaInvestigators(
	events: TraumaEvent[],
	// A cards segment cached before `investigatorsByCampaign` existed passes undefined.
	investigatorsByCampaign: Record<string, CardCode[]> = {}
): InvestigatorTrauma[] {
	const perInv = new Map<CardCode, { killed: number; insane: number }>();
	for (const e of events) {
		if (!e.allKilled && !e.allInsane) continue;
		const codes = e.campaignId ? investigatorsByCampaign[e.campaignId] : undefined;
		if (!codes?.length) continue;
		for (const code of codes) {
			const v = perInv.get(code) ?? { killed: 0, insane: 0 };
			if (e.allKilled) v.killed += 1;
			if (e.allInsane) v.insane += 1;
			perInv.set(code, v);
		}
	}
	return [...perInv.entries()]
		.map(([code, v]) => ({ code, killed: v.killed, insane: v.insane }))
		.sort((a, b) => b.killed + b.insane - (a.killed + a.insane) || a.code.localeCompare(b.code));
}
