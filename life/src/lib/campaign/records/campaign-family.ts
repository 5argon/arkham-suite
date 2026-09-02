/**
 * campaign-family.ts — the single source of truth for "which family does this
 * campaign log belong to?".
 *
 * Return-to campaigns are FIRST-CLASS: each is its own family (keyed by its
 * own `code`), with its own page, card, clears/wins, and achievements — matching
 * how FFG officially ships them as separate campaigns.
 *
 *   • `familyOf`     → the default identity: a campaign's family IS its code
 *     (Return-to included). Use this everywhere a record is bucketed by campaign.
 *   • `baseFamilyOf` → the BASE family (`originalId ?? code`): use ONLY for the
 *     handful of game rules that genuinely span a base + its Return-to (e.g. the
 *     DWL "Lost in Time and Space" R2 silent win) and for the combined "Original + RT"
 *     merge.
 *
 * NOTE: `originalId` is unreliable as the base's NAME — `rtnotz.originalId` is the
 * orphan string `'core'`, not `'notz'`. Drive base/Return-to PAIRING off
 * `RT_PAIRS` (by code), never by reading `originalId` as a code.
 */
import { getCampaignLog, type CampaignLog } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../achievements/achievement-aggregate';

/** A campaign's family = its own campaign-data code (Return-to is its own family). */
export function familyOf(log: CampaignLog): string {
	return log.db.code;
}

/** The records belonging to a family — the standard opener for a per-campaign payload builder.
 *  With `mergeReturnTo` (the default), a BASE family absorbs its Return-to variant's plays too
 *  (bucketing off {@link baseFamilyOf}); with it OFF, each family is only its own plays
 *  ({@link familyOf}), so a Return-to box is never folded into the base. */
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

/** Every family a record's plays contribute to, honoring the merge setting. Its OWN family always;
 *  plus its BASE family when `mergeReturnTo` is on and it's a Return-to box (so `['rttfa','tfa']`).
 *  Generic per-family aggregates loop over this so a Return-to play lands in both buckets — RT rows
 *  stay distinct (they keep their `return_to_*` scenario ids) while shared-id facts (campaign outcome
 *  coverage) fold into the base. */
export function contributingFamilies(log: CampaignLog, mergeReturnTo: boolean): string[] {
	const own = familyOf(log);
	if (!mergeReturnTo) return [own];
	const base = baseFamilyOf(log);
	return base === own ? [own] : [own, base];
}

/** The Return-to variant CODE for a base family (via {@link RT_PAIRS}), or null if none. */
export function returnToCodeFor(baseFamily: string): string | null {
	return RT_PAIRS.find((p) => p.base === baseFamily)?.rt ?? null;
}

/** A family's scenarioMeta with its Return-to variant's scenarios appended (deduped by id) when
 *  merging — so a base-family aggregate that iterates scenarioMeta (resolution coverage, Succeed/Failed
 *  verdicts) also covers the Return-to scenarios that fold into this family as their own rows. */
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

/** A family's scenario display names, merged with its Return-to variant's (base names win on
 *  shared ids). Pairs with {@link familyScenarioMeta}. */
export function familyScenarioNames(family: string, mergeReturnTo: boolean): Record<string, string> {
	const base = getCampaignLog(family)?.en.scenarioNames ?? {};
	const rtCode = mergeReturnTo ? returnToCodeFor(family) : null;
	const rtLog = rtCode ? getCampaignLog(rtCode) : null;
	return rtLog ? { ...(rtLog.en.scenarioNames ?? {}), ...base } : { ...base };
}

/** The BASE family a log rolls up to (`originalId ?? code`). For base-spanning game
 *  rules + the combined merge only — NOT for normal record bucketing. */
export function baseFamilyOf(log: CampaignLog): string {
	return log.db.originalId ?? log.db.code;
}

/** Like {@link baseFamilyOf} but from a code string (resolves the log first). */
export function baseFamilyOfCode(code: string): string {
	return getCampaignLog(code)?.db.originalId ?? code;
}

/** True if this code is a Return-to campaign (it carries an `originalId`). */
export function isReturnToCode(code: string): boolean {
	return getCampaignLog(code)?.db.originalId != null;
}

/**
 * The base ⇆ Return-to pairing, keyed by CODE (not `originalId`, which lies for
 * NotZ). Drives the "Original + RT" combined view and any RT-aware UI. The
 * base code is the campaign-data code of the original campaign.
 */
export const RT_PAIRS: { base: string; rt: string }[] = [
	{ base: 'notz', rt: 'rtnotz' },
	{ base: 'dwl', rt: 'rtdwl' },
	{ base: 'ptc', rt: 'rtptc' },
	{ base: 'tfa', rt: 'rttfa' },
	{ base: 'tcu', rt: 'rttcu' }
];

/**
 * The family a single official achievement should be attributed to. Return-to
 * achievement definitions carry `def.family` = the BASE family (e.g. `rtdwl`
 * achievements declare `family: 'dwl'`); an RT play's achievements belong to the RT family (its own code). Non-Return-to logs honor
 * `def.family` (it may legitimately attribute to another family) falling back to code.
 */
export function achievementFamilyOf(log: CampaignLog, defFamily: string | undefined): string {
	return log.db.originalId ? log.db.code : (defFamily ?? log.db.code);
}
