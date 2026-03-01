import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import { aggregateOfficialTiered, type CampaignRecord } from './achievement-aggregate';

function rec(campaignCode: string, recorded: RecordedCampaignState): CampaignRecord {
	return { campaignCode, recorded, manual: new Set() };
}

describe('aggregateOfficialTiered', () => {
	it('tracks earn-count and the difficulty tiers an inferred achievement was earned at', () => {
		const map = aggregateOfficialTiered([
			rec('notz', { difficulty: 'standard', recordedLogs: new Set(['campaign_notes.lita_finds_others']) }),
			rec('notz', { difficulty: 'hard', recordedLogs: new Set(['campaign_notes.lita_finds_others']) }),
		]);
		const notz = map.get('notz');
		expect(notz).toBeDefined();
		const earned = notz!.filter((a) => a.earned);
		expect(earned.length).toBeGreaterThan(0); // at least dont_trust_her (infer log lita_finds_others)
		for (const a of earned) {
			expect(a.earnCount).toBe(2);
			expect(a.earnedTiers).toEqual(['hard', 'standard']); // sorted, deduped
		}
	});

	it('a manual tick records its single play tier with count 1', () => {
		const probe = aggregateOfficialTiered([rec('notz', { recordedLogs: new Set() })]);
		const manual = probe.get('notz')!.find((a) => !a.def.infer && !a.def.itemInfer);
		expect(manual).toBeDefined();
		const id = manual!.def.id;

		const map = aggregateOfficialTiered([
			{ campaignCode: 'notz', recorded: { difficulty: 'expert', recordedLogs: new Set() }, manual: new Set([id]) },
		]);
		const a = map.get('notz')!.find((x) => x.def.id === id)!;
		expect(a.earned).toBe(true);
		expect(a.earnCount).toBe(1);
		expect(a.earnedTiers).toEqual(['expert']);
	});
});
