import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { buildCob } from './cob';

const k = (id: string) => (id.includes('.') ? id : `campaign_notes.${id}`);

function rec(difficulty: string, logs: string[], blood?: number): CampaignRecord {
	const recorded: RecordedCampaignState = {
		difficulty,
		recordedLogs: new Set(logs.map(k)),
		crossedLogs: new Set(),
		recordedSectionItems: {},
		finalChaosBag: blood === undefined ? {} : { skull: 2, blood }
	};
	return { campaignCode: 'cob', recorded, manual: new Set() };
}

// A: spared Julia, defeated Zburamoarte, Priscilla walked away, stopped the cult with 4 blood left.
const A = rec(
	'standard',
	[
		'spared_julia_stern',
		'completed_their_search',
		'defeated_zburamoarte',
		'hidden.priscilla_done',
		'stopped_the_children_of_blood'
	],
	4
);
// B: killed Julia, left Zburamoarte alive, stopped the cult with 9 blood left.
const B = rec(
	'hard',
	[
		'killed_julia_stern',
		'did_not_complete_their_search',
		'left_zburamoarte_alive',
		'stopped_the_children_of_blood'
	],
	9
);
// C: Julia got away, left to the cult's mercy, failed at the party with no bag recorded.
const C = rec('standard', [
	'failed_to_stop_julia_stern',
	'left_to_the_cults_mercy',
	'failed_to_stop_the_children_of_blood'
]);
// D: still in New Horizons; its bag does not count.
const D = rec('standard', ['spared_julia_stern'], 1);

describe('buildCob', () => {
	const c = buildCob([A, B, C, D])!;

	it('tallies each scenario', () => {
		expect(c.plays).toBe(4);
		expect(c.riverOfBlood.spared.total).toBe(2);
		expect(c.riverOfBlood.killed.byTier).toEqual({ hard: 1 });
		expect(c.newHorizons.leftToTheCultsMercy.total).toBe(1);
		expect(c.bloodMoney.priscillaWalkedAway.total).toBe(1);
	});

	it('reads the epilogue', () => {
		expect(c.epilogue.arkhamRecovers.total).toBe(1);
		expect(c.epilogue.juliaSeenAgain.total).toBe(1);
		expect(c.epilogue.rumorsReturn.byTier).toEqual({ hard: 1 });
		expect(c.epilogue.bloodbath.total).toBe(1);
	});

	it('ranges the blood tokens over finished plays with a recorded bag', () => {
		expect(c.blood).toEqual({ max: 9, min: 4 });
	});
});
