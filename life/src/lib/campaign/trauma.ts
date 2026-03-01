/**
 * trauma.ts — lifetime "how often did an ending kill or madden my party?"
 * aggregation. Each campaign-data resolution carries the death/madness trauma the
 * ArkhamCards app auto-applies when it is reached (`scenarioMeta[].resolutionEffects`,
 * surfaced as `resolutionTraumaEffects`). Joining that against the resolution a
 * player recorded per scenario (Extra tab, reserved `__resolution`) lets us tally:
 *   - per ENDING: killed vs insane reached, pyrrhic wins, mid-campaign casualties;
 *   - per INVESTIGATOR: deaths/insanities, but only for `all`-target endings (the
 *     only target derivable from the log — lead/defeated/not_resigned depend on
 *     in-scenario state we don't record, so they count only toward the per-ending
 *     totals).
 *
 * A resolution whose trauma sits behind an in-resolution choice is `conditional`:
 * the recorded `__resolution` can't tell which branch was taken, so it counts as
 * "could kill/madden" (`possible`), never a definite death.
 *
 * The per-ENDING tally is pure log data → it lives in the cached "logs" segment.
 * The per-INVESTIGATOR attribution needs each play's deck investigators (deck
 * data), so it is computed at ASSEMBLY time via {@link attributeTraumaInvestigators}
 * — joining each event's `campaignId` + `all`-target flags against a per-campaign
 * investigator map from the "cards" segment. This keeps the logs segment
 * independent of deck edits (the segment-signature contract).
 */
import { getCampaignLog, resolutionTraumaEffects } from '@5argon/arkham-campaign-data';
import type { CardCode } from '@5argon/arkham-kohaku';
import type { CampaignRecord } from './achievement-aggregate';

/** One recorded ending whose resolution kills and/or drives the party insane. */
export interface TraumaEvent {
	/** Base campaign code (RT folds onto its base); the campaign name re-derives from it. */
	family: string;
	/** The doc campaign id this play belongs to — the join key for per-investigator
	 *  attribution at assembly time. Absent when the record carried none (tests). */
	campaignId?: string;
	scenario: string;
	resolution: string;
	/** `'yes'` = guaranteed by reaching the resolution; `'maybe'` = only via a branch. */
	killed: 'yes' | 'maybe' | null;
	insane: 'yes' | 'maybe' | null;
	/** Whom the trauma targets, verbatim (`all`, `lead_investigator`, …). */
	targets: string[];
	/** Guaranteed party-wide death — attributable to every investigator in the play. */
	allKilled: boolean;
	/** Guaranteed party-wide insanity — attributable to every investigator in the play. */
	allInsane: boolean;
	/** The result this ending set, if any (absent = a mid-campaign casualty). */
	result?: 'win' | 'lose' | 'mixed';
	/** A win ending that still killed/maddened — a pyrrhic victory. */
	pyrrhic: boolean;
	difficulty: string;
}

/** Per-investigator death/insanity counts (attributable for `all`-target endings only). */
export interface InvestigatorTrauma {
	code: CardCode;
	killed: number;
	insane: number;
}

export interface TraumaTally {
	/** Endings reached that guaranteed a death. */
	killed: number;
	/** Endings reached that guaranteed insanity. */
	insane: number;
	/** Of the killed endings, those that did NOT also drive insane. */
	killedNotInsane: number;
	/** Of the insane endings, those that did NOT also kill. */
	insaneNotKilled: number;
	/** Pyrrhic wins (a win ending that still killed/maddened). */
	pyrrhic: number;
	/** Casualty endings — death/madness with no win/lose result (campaign continued). */
	casualties: number;
	/** Endings that could kill/madden via a branch we can't tell apart (conditional only). */
	possible: number;
	/** Per-investigator deaths/insanities, attributable only for `all`-target endings. */
	perInvestigator: InvestigatorTrauma[];
	/** Every contributing event, in record → campaign-data order. */
	events: TraumaEvent[];
}

/**
 * Per-ending trauma tally from recorded resolutions (pure log data). The
 * `perInvestigator` field comes back EMPTY here — fill it at assembly time with
 * {@link attributeTraumaInvestigators}, which needs deck data the logs segment
 * must not depend on.
 */
export function buildTraumaTally(records: CampaignRecord[]): TraumaTally {
	const events: TraumaEvent[] = [];

	for (const rec of records) {
		const recorded = rec.scenarioResolutions;
		if (!recorded || !Object.keys(recorded).length) continue;
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		const family = log.db.originalId ?? log.db.code;
		const difficulty = rec.recorded.difficulty ?? 'standard';
		const byKey = new Map(
			resolutionTraumaEffects(log).map((e) => [`${e.scenario}.${e.resolution}`, e.effect]),
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
				difficulty,
			});
		}
	}

	return {
		killed: events.filter((e) => e.killed === 'yes').length,
		insane: events.filter((e) => e.insane === 'yes').length,
		killedNotInsane: events.filter((e) => e.killed === 'yes' && e.insane !== 'yes').length,
		insaneNotKilled: events.filter((e) => e.insane === 'yes' && e.killed !== 'yes').length,
		pyrrhic: events.filter((e) => e.pyrrhic).length,
		casualties: events.filter((e) => !e.result && (e.killed === 'yes' || e.insane === 'yes')).length,
		possible: events.filter((e) => e.killed !== 'yes' && e.insane !== 'yes' && (e.killed === 'maybe' || e.insane === 'maybe')).length,
		perInvestigator: [],
		events,
	};
}

/**
 * Attribute guaranteed `all`-target deaths/insanities to each play's investigators,
 * joining trauma events (by `campaignId`) against a per-campaign investigator map.
 * Returns the sorted per-investigator counts; events without a `campaignId` or with
 * no mapped investigators contribute nothing.
 */
export function attributeTraumaInvestigators(
	events: TraumaEvent[],
	// Defaults to `{}` so a payload assembled from a pre-`investigatorsByCampaign`
	// cached cards segment (field absent → arg is `undefined`) yields no attribution
	// rather than throwing; the CACHE_VERSION bump rebuilds it correctly.
	investigatorsByCampaign: Record<string, CardCode[]> = {},
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
