/**
 * Which family a campaign log belongs to. A Return-to box is its own family (keyed by its own
 * code); `baseFamilyOf` names the original campaign it can be merged into.
 */
import { getCampaignLog, type CampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from './campaign-record';

/** Return-to box ⇄ its original campaign, by campaign-data code. (`originalId` is not usable for
 *  this: Return to the Night of the Zealot's is `'core'`.) */
export const RT_PAIRS: { base: string; rt: string }[] = [
	{ base: 'notz', rt: 'rtnotz' },
	{ base: 'dwl', rt: 'rtdwl' },
	{ base: 'ptc', rt: 'rtptc' },
	{ base: 'tfa', rt: 'rttfa' },
	{ base: 'tcu', rt: 'rttcu' }
];

export function familyOf(log: CampaignLog): string {
	return log.db.code;
}

/** The original campaign a Return-to box merges into; a non-Return-to campaign is its own base. */
export function baseFamilyOf(log: CampaignLog): string {
	return RT_PAIRS.find((p) => p.rt === log.db.code)?.base ?? log.db.code;
}

export function baseFamilyOfCode(code: string): string {
	const log = getCampaignLog(code);
	return log ? baseFamilyOf(log) : code;
}

export function isReturnToCode(code: string): boolean {
	const log = getCampaignLog(code);
	return log ? baseFamilyOf(log) !== log.db.code : false;
}

export function returnToCodeFor(baseFamily: string): string | null {
	return RT_PAIRS.find((p) => p.base === baseFamily)?.rt ?? null;
}

/** A family's plays. With `mergeReturnTo`, a base family also takes its Return-to box's plays. */
export function filterFamilyRecords(
	records: CampaignRecord[],
	family: string,
	mergeReturnTo = true
): CampaignRecord[] {
	return records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		if (!log) return false;
		return mergeReturnTo ? baseFamilyOf(log) === family : familyOf(log) === family;
	});
}

/** Every family a play counts toward: its own, plus its base family when merging a Return-to box. */
export function contributingFamilies(log: CampaignLog, mergeReturnTo: boolean): string[] {
	const own = familyOf(log);
	if (!mergeReturnTo) return [own];
	const base = baseFamilyOf(log);
	return base === own ? [own] : [own, base];
}

export interface FamilyRecords {
	/** The family's own campaign log. */
	log: CampaignLog;
	recs: CampaignRecord[];
	/** Campaign-data codes of the family and of every log its records came from (a merged base
	 *  family also lists its Return-to box). */
	codes: Set<string>;
}

/**
 * Records grouped by every family they count toward (`contributingFamilies`): with
 * `mergeReturnTo`, a Return-to play lands in its own family and its base family. Families keep
 * first-seen order and records keep input order; records of unknown campaigns are dropped.
 */
export function recordsByFamily(
	records: readonly CampaignRecord[],
	mergeReturnTo: boolean
): Map<string, FamilyRecords> {
	const out = new Map<string, FamilyRecords>();
	for (const rec of records) {
		const log = getCampaignLog(rec.campaignCode);
		if (!log) continue;
		for (const family of contributingFamilies(log, mergeReturnTo)) {
			let group = out.get(family);
			if (!group) {
				group = { log: getCampaignLog(family) ?? log, recs: [], codes: new Set([family]) };
				out.set(family, group);
			}
			group.recs.push(rec);
			group.codes.add(log.db.code);
		}
	}
	return out;
}

/** A family's scenarioMeta, followed by its Return-to box's scenarios (deduped by id) when merging. */
export function familyScenarioMeta(
	family: string,
	mergeReturnTo: boolean
): NonNullable<CampaignLog['db']['scenarioMeta']> {
	const meta = [...(getCampaignLog(family)?.db.scenarioMeta ?? [])];
	const rtCode = mergeReturnTo ? returnToCodeFor(family) : null;
	const rtLog = rtCode ? getCampaignLog(rtCode) : null;
	if (rtLog) {
		const seen = new Set(meta.map((m) => m.id));
		for (const m of rtLog.db.scenarioMeta ?? []) if (!seen.has(m.id)) meta.push(m);
	}
	return meta;
}

/** A family's scenario names merged with its Return-to box's (base names win on shared ids). */
export function familyScenarioNames(
	family: string,
	mergeReturnTo: boolean
): Record<string, string> {
	const base = getCampaignLog(family)?.en.scenarioNames ?? {};
	const rtCode = mergeReturnTo ? returnToCodeFor(family) : null;
	const rtLog = rtCode ? getCampaignLog(rtCode) : null;
	return rtLog ? { ...(rtLog.en.scenarioNames ?? {}), ...base } : { ...base };
}

/** The family an official achievement is attributed to. Return-to definitions declare the base
 *  family, but an RT play's achievements belong to the RT family; other logs honor `def.family`. */
export function achievementFamilyOf(log: CampaignLog, defFamily: string | undefined): string {
	return log.db.originalId ? log.db.code : (defFamily ?? log.db.code);
}
