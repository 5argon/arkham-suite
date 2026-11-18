import {
	TCU_ALLEGIANCE_SOURCES,
	type AllegianceBead,
	type AllegianceSide
} from '$lib/campaign/campaigns/tcu';
import { scenarioName } from '$lib/campaign/records/campaign-log-source';
import * as m from '$lib/paraglide/messages.js';
import type { TwoSidedSpec } from '../two-sided';

export const ALLEGIANCE_TINT: Record<AllegianceSide, string> = {
	lodge: 'text-sky-600 dark:text-sky-400',
	coven: 'text-emerald-600 dark:text-emerald-400'
};

/** The interludes borrow the icon of the scenario they follow. */
const ICON: Record<string, string> = {
	the_price_of_progress: 'at_deaths_doorstep',
	the_inner_circle: 'for_the_greater_good'
};

const DECISION: Record<string, Record<AllegianceSide, () => string>> = {
	the_price_of_progress: {
		lodge: m.campaign_tcu_alleg_src_price_lodge,
		coven: m.campaign_tcu_alleg_src_price_coven
	},
	the_secret_name: {
		lodge: m.campaign_tcu_alleg_src_secret_lodge,
		coven: m.campaign_tcu_alleg_src_secret_coven
	},
	the_inner_circle: {
		lodge: m.campaign_tcu_alleg_src_inner_lodge,
		coven: m.campaign_tcu_alleg_src_inner_coven
	},
	union_and_disillusion: {
		lodge: m.campaign_tcu_alleg_src_union_lodge,
		coven: m.campaign_tcu_alleg_src_union_coven
	},
	in_the_clutches_of_chaos: {
		lodge: m.campaign_tcu_alleg_src_clutches_lodge,
		coven: m.campaign_tcu_alleg_src_clutches_coven
	}
};

export function tcuAllegianceSpec(): TwoSidedSpec {
	return {
		family: 'tcu',
		sides: [
			{
				key: 'lodge',
				abbr: m.campaign_tcu_alleg_lodge_abbr(),
				label: m.campaign_tcu_alleg_lodge_full(),
				tint: ALLEGIANCE_TINT.lodge
			},
			{
				key: 'coven',
				abbr: m.campaign_tcu_alleg_coven_abbr(),
				label: m.campaign_tcu_alleg_coven_full(),
				tint: ALLEGIANCE_TINT.coven
			}
		],
		sources: TCU_ALLEGIANCE_SOURCES,
		iconScenario: (id) => ICON[id] ?? id,
		sourceName: (id) => scenarioName('tcu', id),
		earned: (bead) => {
			const b = bead as AllegianceBead;
			const decision = DECISION[b.scenario]?.[b.side]() ?? b.scenario;
			return b.deceiving ? `${decision} ${m.campaign_tcu_alleg_deceiving_tip()}` : decision;
		},
		neutral: m.campaign_tcu_alleg_neutral(),
		neutralColumn: m.campaign_tcu_alleg_neutral_short(),
		neutralNa: m.campaign_tcu_alleg_neutral_na(),
		decisionColumn: m.campaign_tcu_alleg_src_col_decision(),
		chainColumn: m.campaign_tcu_alleg_col_chain(),
		resultColumn: m.campaign_tcu_alleg_col_result(),
		signatureTitles: [
			m.campaign_tcu_alleg_row_most_lodge(),
			m.campaign_tcu_alleg_row_most_coven(),
			m.campaign_tcu_alleg_row_least()
		],
		unfinished: m.campaign_tcu_outcome_abandoned()
	};
}
