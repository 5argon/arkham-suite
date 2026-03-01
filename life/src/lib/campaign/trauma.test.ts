import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import { buildTraumaTally, attributeTraumaInvestigators } from './trauma';
import type { CampaignRecord } from './achievement-aggregate';

function rec(
	campaignCode: string,
	scenarioResolutions: Record<string, string>,
	opts: { difficulty?: string; campaignId?: string } = {},
): CampaignRecord {
	return {
		campaignCode,
		campaignId: opts.campaignId,
		recorded: { difficulty: opts.difficulty ?? 'standard' } as RecordedCampaignState,
		manual: new Set(),
		scenarioResolutions,
	};
}

describe('buildTraumaTally (per-ending)', () => {
	it('counts a guaranteed party kill (all-target) and flags it attributable', () => {
		const t = buildTraumaTally([rec('notz', { the_devourer_below: 'no_resolution' }, { campaignId: 'A' })]);
		expect(t.killed).toBe(1);
		expect(t.insane).toBe(0);
		expect(t.killedNotInsane).toBe(1);
		expect(t.perInvestigator).toHaveLength(0); // filled only at assembly
		expect(t.events[0]).toMatchObject({
			family: 'notz',
			campaignId: 'A',
			scenario: 'the_devourer_below',
			resolution: 'no_resolution',
			killed: 'yes',
			allKilled: true,
			allInsane: false,
			result: 'lose',
			pyrrhic: false,
		});
	});

	it('flags a pyrrhic win (lead insane) and does NOT mark it party-wide', () => {
		const t = buildTraumaTally([rec('tcu', { before_the_black_throne: 'R2' })]);
		expect(t.insane).toBe(1);
		expect(t.insaneNotKilled).toBe(1);
		expect(t.pyrrhic).toBe(1);
		expect(t.events[0].result).toBe('win');
		expect(t.events[0].allInsane).toBe(false); // lead_investigator, not 'all'
	});

	it('treats a death with no win/lose result as a casualty, not a loss ending', () => {
		const t = buildTraumaTally([rec('notz', { the_gathering: 'R3' })]);
		expect(t.killed).toBe(1);
		expect(t.casualties).toBe(1);
		expect(t.events[0].result).toBeUndefined();
		expect(t.events[0].allKilled).toBe(false); // not_resigned, not 'all'
	});

	it('counts conditional (branch-gated) trauma as possible, not a guaranteed death', () => {
		const t = buildTraumaTally([rec('tcu', { before_the_black_throne: 'R4' })]);
		expect(t.killed).toBe(0);
		expect(t.possible).toBe(1);
		expect(t.events[0].killed).toBe('maybe');
		expect(t.events[0].allKilled).toBe(false); // conditional → not attributable
	});

	it('folds Return-to onto the base family (matching clear-status familyOf)', () => {
		const t = buildTraumaTally([rec('rttcu', { before_the_black_throne: 'no_resolution' })]);
		expect(t.events).toHaveLength(1);
		expect(t.events[0].family).toBe('tcu'); // rttcu.originalId === 'tcu'
		expect(t.killed).toBe(1);
	});

	it('ignores recorded resolutions that inflict no death/madness', () => {
		const t = buildTraumaTally([rec('notz', { the_devourer_below: 'R1' })]);
		expect(t.events).toHaveLength(0);
		expect(t.killed).toBe(0);
	});
});

describe('attributeTraumaInvestigators (assembly join)', () => {
	it('attributes a guaranteed all-target ending to every investigator in that play', () => {
		const t = buildTraumaTally([rec('notz', { the_devourer_below: 'no_resolution' }, { campaignId: 'A' })]);
		const per = attributeTraumaInvestigators(t.events, { A: ['01001', '01004'] });
		expect(per).toEqual(
			expect.arrayContaining([
				{ code: '01001', killed: 1, insane: 0 },
				{ code: '01004', killed: 1, insane: 0 },
			]),
		);
	});

	it('does not attribute a non-all target (lead/not_resigned) to anyone', () => {
		const t = buildTraumaTally([rec('tcu', { before_the_black_throne: 'R2' }, { campaignId: 'A' })]);
		expect(attributeTraumaInvestigators(t.events, { A: ['01001'] })).toHaveLength(0);
	});

	it('skips events whose campaign has no mapped investigators', () => {
		const t = buildTraumaTally([rec('notz', { the_devourer_below: 'no_resolution' }, { campaignId: 'A' })]);
		expect(attributeTraumaInvestigators(t.events, { B: ['01001'] })).toHaveLength(0);
	});
});
