import { describe, expect, it } from 'vitest';
import { buildScenarioStats } from './scenario-stats';
import { buildEndings, buildWinLossRecord } from '../outcomes/clear-status';
import type { CampaignRecord } from '../achievements/achievement-aggregate';

function rec(campaignCode: string, scenario: string, resolution: string): CampaignRecord {
	return {
		campaignCode,
		recorded: { difficulty: 'standard', recordedLogs: new Set([`campaign_notes.${resolution}`]) },
		scenarioResolutions: { [scenario]: resolution },
		manual: new Set(),
	} as unknown as CampaignRecord;
}

describe('Return-to merge', () => {
	const rttfaPlay = () => [rec('rttfa', 'return_to_the_untamed_wilds', 'R1')];

	it('merge ON: an rttfa play surfaces under the base tfa family as its own RT scenario row', () => {
		const out = buildScenarioStats(rttfaPlay(), true);
		const tfa = out.find((c) => c.family === 'tfa');
		expect(tfa, 'base tfa family should exist from RT-only plays').toBeTruthy();
		expect(tfa!.scenarios.some((s) => s.scenario === 'return_to_the_untamed_wilds')).toBe(true);
		expect(out.find((c) => c.family === 'rttfa'), 'rttfa still first-class').toBeTruthy();
	});

	it('merge OFF: an rttfa play stays only under rttfa', () => {
		const out = buildScenarioStats(rttfaPlay(), false);
		expect(out.find((c) => c.family === 'tfa')).toBeFalsy();
		expect(out.find((c) => c.family === 'rttfa')).toBeTruthy();
	});

	it('win/loss + endings: rttfa play appears under tfa (merge) but not (no merge)', () => {
		expect(buildWinLossRecord(rttfaPlay(), true).find((r) => r.family === 'tfa')).toBeTruthy();
		expect(buildWinLossRecord(rttfaPlay(), false).find((r) => r.family === 'tfa')).toBeFalsy();
		expect(buildEndings(rttfaPlay(), true).find((e) => e.family === 'tfa')).toBeTruthy();
	});

	it('hideReturnTo: win/loss drops the separate rttfa row', () => {
		expect(buildWinLossRecord(rttfaPlay(), true, true).find((r) => r.family === 'rttfa')).toBeFalsy();
		expect(buildWinLossRecord(rttfaPlay(), true, true).find((r) => r.family === 'tfa')).toBeTruthy();
	});
});
