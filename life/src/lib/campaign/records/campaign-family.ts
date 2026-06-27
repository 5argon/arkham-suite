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
 *     DWL "Lost in Time and Space" R2 silent win) and for the (future) combined
 *     "Original + RT" merge.
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

/** The records belonging to a BASE family (the base + its Return-to variant) — the standard opener
 *  for a per-campaign payload builder. Drives bucketing off {@link baseFamilyOf}, never an inlined
 *  `originalId ?? code`, so a builder can't drift from the family rule. */
export function filterFamilyRecords(records: CampaignRecord[], family: string): CampaignRecord[] {
	return records.filter((r) => {
		const log = getCampaignLog(r.campaignCode);
		return log ? baseFamilyOf(log) === family : false;
	});
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
 * NotZ). Drives the future "Original + RT" combined view and any RT-aware UI. The
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
 * achievements declare `family: 'dwl'`); with Return-to now separate, an RT play's
 * achievements belong to the RT family (its own code). Non-Return-to logs honor
 * `def.family` (it may legitimately attribute to another family) falling back to code.
 */
export function achievementFamilyOf(log: CampaignLog, defFamily: string | undefined): string {
	return log.db.originalId ? log.db.code : (defFamily ?? log.db.code);
}
