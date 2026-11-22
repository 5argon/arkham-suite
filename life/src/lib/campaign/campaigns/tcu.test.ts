import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { buildTcu } from './tcu';

function rec(logs: string[]): CampaignRecord {
	const recorded: RecordedCampaignState = {
		difficulty: 'standard',
		recordedLogs: new Set(logs),
		crossedLogs: new Set(),
		recordedSectionItems: {}
	};
	return { campaignCode: 'tcu', recorded, manual: new Set() };
}

describe('buildTcu missing persons', () => {
	// Each missing person's section is a notes section named after their card code.
	const t = buildTcu([
		rec(['05046.pulled_into_the_spectral_realm', '05046.on_gavriellas_trail', '05046.dead']),
		rec([
			'05046.disappeared_into_the_mist',
			'05046.on_gavriellas_trail',
			'05046.alive',
			'05049.taken_by_the_watcher'
		])
	])!;

	it('reads each fate, trail and Union and Disillusion standing', () => {
		const gavriella = t.missingPersons.find((p) => p.code === '05046')!;
		expect(gavriella.trail).toBe(2);
		expect(gavriella.fates).toEqual([
			{ fate: 'disappeared_into_the_mist', plays: 1 },
			{ fate: 'pulled_into_the_spectral_realm', plays: 1 }
		]);
		expect(gavriella.union).toEqual({ alive: 1, dead: 1 });
		expect(t.missingPersons.find((p) => p.code === '05049')!.any).toBe(true);
		expect(t.missingPersons.find((p) => p.code === '05047')!.any).toBe(false);
	});
});
