import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { buildTtn } from './ttn';

const k = (id: string) => (id.includes('.') ? id : `campaign_notes.${id}`);

function rec(
	campaignCode: string,
	difficulty: string,
	logs: string[],
	extra: Partial<CampaignRecord> = {}
): CampaignRecord {
	const recorded: RecordedCampaignState = {
		difficulty,
		recordedLogs: new Set(logs.map(k)),
		crossedLogs: new Set(),
		recordedSectionItems: {}
	};
	return { campaignCode, recorded, manual: new Set(), ...extra };
}

describe('buildTtn', () => {
	const plays = [
		{
			key: 'side.ttn',
			rec: rec('side', 'standard', ['saved_lina_husserl'], {
				scenarioChoices: { 'ttn.ask_control_aziza': 'yes' }
			})
		},
		{
			key: 'side.ttn',
			rec: rec('side', 'hard', [
				'hidden.traces_to_nowhere_albrecht_is_the_culprit',
				'the_culprit_is_still_at_large'
			])
		},
		{ key: 'side.the_midwinter_gala', rec: rec('side', 'standard', ['saved_lina_husserl']) },
		// Played inside a campaign: only its resolution.
		{ key: 'side.ttn', rec: rec('side', 'expert', [], { scenarioResolutions: { ttn: 'R3' } }) }
	];
	const b = buildTtn(plays)!;

	it("counts only this page's plays", () => {
		expect(b.plays).toBe(3);
	});

	it('unmasks a culprit by their resolution or the interlude', () => {
		expect(b.culprits.lina.total).toBe(1);
		expect(b.culprits.eugene.total).toBe(0);
		expect(b.culprits.albrecht.byTier).toEqual({ hard: 1, expert: 1 });
		expect(b.endings.stoppedAlbrecht.byTier).toEqual({ expert: 1 });
		expect(b.endings.stillAtLarge.total).toBe(1);
		expect(b.azizaRescued.total).toBe(1);
	});
});
