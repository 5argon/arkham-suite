import { describe, expect, it } from 'vitest';
import { getCampaignLog, type RecordedCampaignState } from '@5argon/arkham-campaign-data';
import { buildClearGrid, playClearState } from './clear-status';
import type { CampaignRecord } from './achievement-aggregate';

function rec(campaignCode: string, recorded: RecordedCampaignState): CampaignRecord {
	return { campaignCode, recorded, manual: new Set() };
}

const WIN = 'campaign_notes.azathoth_slumbers';
const LOSS = 'campaign_notes.azathoth_devoured_the_universe';
const LODGE = 'campaign_notes.true_work_of_silver_twilight_lodge_has_begun'; // special
const COVEN = 'campaign_notes.coven_of_keziah_holds_the_world_in_its_grasp'; // rttcu special

describe('playClearState', () => {
	const tcu = getCampaignLog('tcu')!;

	it('classifies win / loss / special / null by recorded outcome entry', () => {
		expect(playClearState(tcu, { recordedLogs: new Set([WIN]) })).toBe('cleared');
		expect(playClearState(tcu, { recordedLogs: new Set([LOSS]) })).toBe('attempted');
		expect(playClearState(tcu, { recordedLogs: new Set([LODGE]) })).toBe('special');
		expect(playClearState(tcu, { recordedLogs: new Set(['campaign_notes.mementos_collected']) })).toBeNull();
		expect(playClearState(tcu, {})).toBeNull();
	});

	it('a win outranks a co-recorded special/loss', () => {
		expect(playClearState(tcu, { recordedLogs: new Set([WIN, LODGE, LOSS]) })).toBe('cleared');
	});
});

describe('buildClearGrid', () => {
	it('folds Return-to into the base family and keeps the strongest state per tier', () => {
		const grid = buildClearGrid([
			rec('tcu', { difficulty: 'standard', recordedLogs: new Set([WIN]) }), // cleared @ standard
			rec('tcu', { difficulty: 'hard', recordedLogs: new Set([LOSS]) }), // attempted @ hard
			rec('tcu', { difficulty: 'standard', recordedLogs: new Set([LODGE]) }), // special @ standard (weaker than cleared)
			rec('rttcu', { difficulty: 'standard', recordedLogs: new Set([COVEN]) }), // RT special folds to tcu
		]);
		expect(grid).toHaveLength(1);
		const tcu = grid[0];
		expect(tcu.family).toBe('tcu');
		expect(tcu.plays).toBe(4);
		expect(tcu.byTier.standard).toBe('cleared'); // cleared beats special at the same tier
		expect(tcu.byTier.hard).toBe('attempted');
		expect(tcu.byTier.expert).toBeUndefined();
	});

	it('separates distinct families and defaults missing difficulty to standard', () => {
		const grid = buildClearGrid([
			rec('notz', { recordedLogs: new Set(['campaign_notes.umordhoth_repelled']) }), // win, no difficulty
			rec('tfa', { difficulty: 'expert', recordedLogs: new Set(['campaign_notes.mended_tear_in_time']) }),
		]);
		const byFamily = Object.fromEntries(grid.map((g) => [g.family, g]));
		expect(byFamily.notz.byTier.standard).toBe('cleared');
		expect(byFamily.tfa.byTier.expert).toBe('cleared');
	});
});
