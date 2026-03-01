import { describe, expect, it } from 'vitest';
import { chapterOneCampaigns, chapterTwoSmallCampaigns } from '@5argon/arkham-kohaku';
import type { CampaignRecord } from './achievement-aggregate';
import { campaignGroupOf } from './clear-status';
import { filterTrackedRecords, groupTracked, tierTracked } from './tracking';

// Real campaign codes from kohaku so the group lookup is exercised end-to-end.
const ch1 = chapterOneCampaigns[0] as string;
const ch2 = chapterTwoSmallCampaigns[0] as string;
const ungrouped = 'standalone_not_a_chapter';

const rec = (campaignCode: string, difficulty: string): CampaignRecord =>
	({ campaignCode, recorded: { difficulty } }) as unknown as CampaignRecord;

describe('tierTracked', () => {
	it('empty trackedTiers tracks every tier', () => {
		expect(tierTracked('expert', [])).toBe(true);
		expect(tierTracked('easy', [])).toBe(true);
	});
	it('non-empty trackedTiers is membership', () => {
		expect(tierTracked('hard', ['standard', 'hard'])).toBe(true);
		expect(tierTracked('expert', ['standard', 'hard'])).toBe(false);
	});
});

describe('groupTracked', () => {
	it('ungrouped campaigns (standalones) always pass', () => {
		expect(campaignGroupOf(ungrouped)).toBeNull();
		expect(groupTracked(ungrouped, [])).toBe(true);
		expect(groupTracked(ungrouped, ['chapterTwo'])).toBe(true);
	});
	it('grouped campaigns pass only when their group is tracked', () => {
		const g2 = campaignGroupOf(ch2);
		expect(g2).not.toBeNull();
		expect(groupTracked(ch2, [g2!])).toBe(true);
		expect(groupTracked(ch2, ['chapterOne', 'chapterOneReturnTo'])).toBe(false);
	});
});

describe('filterTrackedRecords', () => {
	it('drops untracked-tier and non-tracked-group records, keeps ungrouped', () => {
		const records = [
			rec(ch2, 'standard'), // tracked tier + tracked group → kept
			rec(ch2, 'expert'), // untracked tier → dropped
			rec(ch1, 'standard'), // untracked group → dropped
			rec(ungrouped, 'standard') // ungrouped → kept regardless of group
		];
		const kept = filterTrackedRecords(records, ['standard', 'hard'], ['chapterTwo']);
		const codes = kept.map((r) => r.campaignCode);
		expect(kept.filter((r) => r.campaignCode === ch2)).toHaveLength(1);
		expect(codes).not.toContain(ch1);
		expect(codes).toContain(ungrouped);
	});

	it('empty trackedTiers + all groups keeps everything', () => {
		const records = [rec(ch2, 'expert'), rec(ch1, 'easy')];
		const kept = filterTrackedRecords(records, [], [
			'chapterOne',
			'chapterOneReturnTo',
			'chapterTwo'
		]);
		expect(kept).toHaveLength(2);
	});
});
