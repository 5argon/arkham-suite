import {
	chapterOneCampaigns,
	chapterOneReturnToCampaigns,
	chapterTwoSmallCampaigns,
	type Campaign
} from '@5argon/arkham-kohaku';
import type { CampaignGroup } from '../profile/profile-settings';

const GROUPS: [CampaignGroup, readonly Campaign[]][] = [
	['chapterOne', chapterOneCampaigns],
	['chapterOneReturnTo', chapterOneReturnToCampaigns],
	['chapterTwo', chapterTwoSmallCampaigns]
];

/** Every grouped campaign: Chapter One, its Return-to boxes, then Chapter Two. */
export const GROUPED_CAMPAIGNS: readonly Campaign[] = GROUPS.flatMap(([, campaigns]) => campaigns);

const groupByCampaign = new Map<string, CampaignGroup>(
	GROUPS.flatMap(([group, campaigns]) => campaigns.map((c): [string, CampaignGroup] => [c, group]))
);

/** Null for standalones and anything outside the three chapter groups. */
export function campaignGroupOf(campaignCode: string): CampaignGroup | null {
	return groupByCampaign.get(campaignCode) ?? null;
}
