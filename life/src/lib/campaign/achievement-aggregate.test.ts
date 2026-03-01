import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import { buildUnionState, countLogsWithPrefix, type CampaignRecord } from './achievement-aggregate';

function rec(campaignCode: string, recorded: RecordedCampaignState): CampaignRecord {
	return { campaignCode, recorded, manual: new Set() };
}

describe('buildUnionState', () => {
	it('unions recorded logs/section items and SUMS counts + chaos bag across plays', () => {
		const a = rec('eoe', {
			recordedLogs: new Set(['memories_banished.a', 'memories_banished.b']),
			logCounts: { yigs_fury: 5 },
			recordedSectionItems: { supplies: new Set(['provisions']) },
			finalChaosBag: { tablet: 1 },
		});
		const b = rec('eoe', {
			recordedLogs: new Set(['memories_banished.b', 'memories_banished.c']),
			logCounts: { yigs_fury: 7 },
			recordedSectionItems: { supplies: new Set(['medicine']) },
			finalChaosBag: { tablet: 2, frost: 1 },
		});
		const u = buildUnionState([a, b]);
		expect([...u.recordedLogs].sort()).toEqual([
			'memories_banished.a',
			'memories_banished.b',
			'memories_banished.c',
		]);
		expect(u.logCounts.yigs_fury).toBe(12); // summed
		expect([...u.recordedSectionItems.supplies].sort()).toEqual(['medicine', 'provisions']);
		expect(u.finalChaosBag.tablet).toBe(3);
		expect(u.finalChaosBag.frost).toBe(1);
	});
});

describe('countLogsWithPrefix', () => {
	it('counts distinct recorded entries under a section prefix (lifetime tally)', () => {
		const u = buildUnionState([
			rec('eoe', { recordedLogs: new Set(['memories_banished.a', 'memories_banished.b']) }),
			rec('eoe', { recordedLogs: new Set(['memories_banished.b', 'memories_discovered.x']) }),
		]);
		// a, b (deduped) under memories_banished.
		expect(countLogsWithPrefix(u, 'memories_banished')).toBe(2);
		expect(countLogsWithPrefix(u, 'memories_discovered')).toBe(1);
	});
});
