import { describe, expect, it } from 'vitest';
import type { RecordedCampaignState } from '@5argon/arkham-campaign-data';
import type { CampaignRecord } from '../records/campaign-record';
import { AZIZA_STEER_REWARD_CODE, CHOSEN_OF_ZBURAMOARTE_CODE, COLLECTOR_CODE } from './reward-defs';
import { buildRewards } from './rewards';

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

const unlocked = (records: CampaignRecord[], code: string) =>
	buildRewards(records).find((r) => r.code === code)!;

describe('buildRewards', () => {
	it('lists every reward, locked ones with nothing earned', () => {
		const all = buildRewards([]);
		expect(all.map((r) => r.code)).toEqual([
			COLLECTOR_CODE,
			CHOSEN_OF_ZBURAMOARTE_CODE,
			AZIZA_STEER_REWARD_CODE
		]);
		expect(all.every((r) => r.earned.total === 0 && r.firstDate === null)).toBe(true);
	});

	it('earns Collector on Queen of Ash Resolutions 1–3, not when Elokoss is reborn', () => {
		const r = unlocked(
			[
				rec('boa', 'standard', ['stopped_elokoss_glorious_rebirth'], { finishDate: 200 }),
				rec('boa', 'hard', ['flooded_the_ritual'], { finishDate: 100 }),
				rec('boa', 'standard', ['elokoss_was_reborn'], { finishDate: 50 })
			],
			COLLECTOR_CODE
		);
		expect(r.earned).toEqual({ total: 2, byTier: { standard: 1, hard: 1 } });
		expect(r.tiers).toEqual([
			{ tier: 'standard', plays: 1, firstDate: 200 },
			{ tier: 'hard', plays: 1, firstDate: 100 }
		]);
		expect(r.firstDate).toBe(100);
	});

	it('earns Chosen of Zburamoarte from the Blood Blight answer or a ticked achievement', () => {
		const r = unlocked(
			[
				rec('cob', 'standard', ['stopped_the_children_of_blood'], {
					scenarioChoices: { 'blood_money.check_chosen_of_zburamoarte': 'yes' }
				}),
				rec('cob', 'standard', ['stopped_the_children_of_blood'], {
					manual: new Set(['and_all_i_got'])
				}),
				rec('cob', 'standard', ['stopped_the_children_of_blood'], {
					scenarioChoices: { 'blood_money.check_chosen_of_zburamoarte': 'no' }
				})
			],
			CHOSEN_OF_ZBURAMOARTE_CODE
		);
		expect(r.earned.total).toBe(2);
	});

	it('earns Aziza Steer only with her under control after Resolutions 1–4', () => {
		const yes = { scenarioChoices: { 'ttn.ask_control_aziza': 'yes' } };
		const r = unlocked(
			[
				rec('side', 'standard', ['saved_lina_husserl'], yes),
				rec('side', 'standard', [], { ...yes, scenarioResolutions: { ttn: 'R4' } }),
				rec('side', 'standard', ['failed_to_solve_the_case'], yes),
				rec('side', 'standard', ['stopped_eugene_peel'])
			],
			AZIZA_STEER_REWARD_CODE
		);
		expect(r.earned.total).toBe(2);
	});

	it('earns Aziza Steer from a side story played inside a campaign, which has no log notes', () => {
		const inserted = rec('side', 'hard', [], {
			scenarioResolutions: { ttn: 'R2' },
			scenarioChoices: { 'ttn.ask_control_aziza': 'yes' }
		});
		expect(unlocked([inserted], AZIZA_STEER_REWARD_CODE).tiers).toEqual([
			{ tier: 'hard', plays: 1, firstDate: null }
		]);
	});
});
