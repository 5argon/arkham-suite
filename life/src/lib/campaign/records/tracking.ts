/**
 * The Tracked Difficulty Tiers / Tracked Campaign Groups settings as one record filter, applied
 * once before the meta and logs precompute so every aggregate sees only tracked plays. The cards
 * segment is not filtered: difficulty doesn't change which cards were played.
 */
import type { CampaignRecord } from './campaign-record';
import { campaignGroupOf } from '../utils/campaign-group';
import { ALL_TIERS, type CampaignGroup, type DifficultyTier } from '../profile/profile-settings';

/** The tiers that count: every tier when none is ticked. */
export function trackedTierList(trackedTiers: DifficultyTier[]): DifficultyTier[] {
	return trackedTiers.length ? trackedTiers : [...ALL_TIERS];
}

/** Empty `trackedTiers` tracks every tier. */
export function tierTracked(difficulty: string, trackedTiers: DifficultyTier[]): boolean {
	return trackedTiers.length === 0 || (trackedTiers as readonly string[]).includes(difficulty);
}

/** Ungrouped campaigns (standalones, anything outside the three chapters) always pass. */
export function groupTracked(campaignCode: string, trackedGroups: CampaignGroup[]): boolean {
	const g = campaignGroupOf(campaignCode);
	return g === null || trackedGroups.includes(g);
}

export function filterTrackedRecords(
	records: CampaignRecord[],
	trackedTiers: DifficultyTier[],
	trackedGroups: CampaignGroup[]
): CampaignRecord[] {
	return records.filter(
		(r) =>
			tierTracked(r.recorded.difficulty ?? 'standard', trackedTiers) &&
			groupTracked(r.campaignCode, trackedGroups)
	);
}
