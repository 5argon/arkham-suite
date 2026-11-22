/**
 * Campaign reward cards (rule 1.129 "Reward"): an outcome earns one, and it then joins that
 * player's collection for good. Each card and the rule that earns it.
 */
import type { Play } from '../records/play';

export interface RewardDef {
	/** The reward card. */
	code: string;
	/** The campaign-data catalogue whose scenario grants it: a campaign, or `side` for a Scenario Pack. */
	catalogue: string;
	scenario: string;
	earned: (p: Play) => boolean;
}

const QUEEN_OF_ASH_REWARDED = [
	'defeated_elokoss_and_the_brethren_of_ash',
	'stopped_elokoss_glorious_rebirth',
	'flooded_the_ritual'
];
const TTN_ENDINGS = [
	'saved_lina_husserl',
	'stopped_eugene_peel',
	'stopped_albrecht_husserl',
	'the_culprit_is_still_at_large'
];

export const COLLECTOR_CODE = '12181';
export const CHOSEN_OF_ZBURAMOARTE_CODE = '13093a';
export const AZIZA_STEER_REWARD_CODE = '73059';

/** In release order. */
export const REWARDS: readonly RewardDef[] = [
	{
		// Queen of Ash: Resolutions 1–3 each earn it.
		code: COLLECTOR_CODE,
		catalogue: 'boa',
		scenario: 'queen_of_ash',
		earned: (p) => QUEEN_OF_ASH_REWARDED.some((note) => p.has(note))
	},
	{
		// Blood Money: an investigator has The Blood Blight in their deck at the end. The same answer
		// earns "And All I Got Were These Bloody Fangs", so a ticked achievement counts too.
		code: CHOSEN_OF_ZBURAMOARTE_CODE,
		catalogue: 'cob',
		scenario: 'blood_money',
		earned: (p) =>
			p.choice('blood_money', 'check_chosen_of_zburamoarte') === 'yes' ||
			p.rec.manual.has('and_all_i_got')
	},
	{
		// Traces to Nowhere: Resolution 5, read after each of Resolutions 1–4, asks whether Aziza Steer
		// was under an investigator's control.
		code: AZIZA_STEER_REWARD_CODE,
		catalogue: 'side',
		scenario: 'ttn',
		earned: (p) =>
			p.choice('ttn', 'ask_control_aziza') === 'yes' &&
			(TTN_ENDINGS.some((note) => p.has(note)) || /^R[1-4]$/.test(p.resolution('ttn') ?? ''))
	}
];

export function rewardFor(catalogue: string, scenario: string): RewardDef | null {
	return REWARDS.find((r) => r.catalogue === catalogue && r.scenario === scenario) ?? null;
}
