/**
 * tracking.ts — the "which of my plays count" filter behind the two global settings
 * Tracked Difficulty Tiers + Tracked Campaign Groups. Applied ONCE at the meta/logs
 * precompute segment boundary (see profile-local.ts), so every campaign aggregate —
 * totals AND per-difficulty breakdowns — reflects only the plays the player tracks,
 * without deleting anything. Untracking a tier/group makes those plays vanish from the
 * stats; re-tracking restores them.
 *
 * Difficulty is per-record (`rec.recorded.difficulty`) and group is per-campaign, so both
 * are pure record-level filters — filtering the records list before the aggregate builders
 * is enough; no widget needs to know. (The CARDS segment is intentionally NOT filtered:
 * difficulty doesn't gate which cards you played.)
 */
import type { CampaignRecord } from './achievement-aggregate';
import { campaignGroupOf } from './clear-status';
import type { CampaignGroup, DifficultyTier } from './profile-settings';

/** Whether a play's difficulty counts. Empty `trackedTiers` = track every tier (the same
 *  `trackedTiers.length ? … : all` convention the clear grid uses for its columns). */
export function tierTracked(difficulty: string, trackedTiers: DifficultyTier[]): boolean {
	return trackedTiers.length === 0 || (trackedTiers as readonly string[]).includes(difficulty);
}

/** Whether a campaign's group counts. Ungrouped campaigns (standalones, anything outside the
 *  three chapters) ALWAYS pass — only campaigns that ARE in a non-tracked group are dropped. */
export function groupTracked(campaignCode: string, trackedGroups: CampaignGroup[]): boolean {
	const g = campaignGroupOf(campaignCode);
	return g === null || trackedGroups.includes(g);
}

/** Keep only the records whose difficulty AND campaign group the player tracks. The single
 *  gate every meta/logs aggregate inherits — apply it once to the records list, not per widget. */
export function filterTrackedRecords(
	records: CampaignRecord[],
	trackedTiers: DifficultyTier[],
	trackedGroups: CampaignGroup[],
): CampaignRecord[] {
	return records.filter(
		(r) =>
			tierTracked(r.recorded.difficulty ?? 'standard', trackedTiers) &&
			groupTracked(r.campaignCode, trackedGroups),
	);
}
