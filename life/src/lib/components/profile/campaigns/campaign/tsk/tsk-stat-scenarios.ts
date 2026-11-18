import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
import type { Stat, StatGroup } from '$lib/components/profile/_primitives';
import * as m from '$lib/paraglide/messages.js';

type StatRows = (Stat[] | StatGroup)[];

export interface ScenarioStats {
	rows: StatRows;
	/** Titled blocks under the rows. */
	sections?: { heading: string; rows: StatRows }[];
}

/** The stats under a scenario's passport; a scenario without an entry shows the passport alone. */
export const TSK_SCENARIO_STATS: Record<string, (tsk: CampaignTsk, logOnly: boolean) => ScenarioStats> = {
	on_thin_ice: ({ onThinIce: o }, logOnly) => ({
		rows: [
			[
				...(logOnly
					? []
					: [
							{ value: o.deal, label: m.campaign_tsk_onthinice_deal() },
							{ value: o.refused, label: m.campaign_tsk_onthinice_refused() }
						]),
				{ value: o.thorneDisappeared, label: m.campaign_tsk_onthinice_disappeared() },
				{ value: o.neverHappened, label: m.campaign_tsk_onthinice_never() }
			]
		]
	}),
	shades_of_suffering: ({ shadesOfSuffering: s }) => ({
		rows: [
			{
				keepEmpty: true,
				stats: [
					{ tally: s.tzuUnderYourSway, label: m.campaign_tsk_shades_tzu_yours() },
					{ tally: s.tzuHasYouUnderHerSway, label: m.campaign_tsk_shades_tzu_hers() }
				]
			}
		]
	}),
	without_a_trace: ({ withoutATrace: w, deadAndGone: d }) => ({
		rows: [
			{
				keepEmpty: true,
				stats: [
					{ tally: w.knowsTrueNature, label: m.campaign_tsk_wat_knows() },
					{ tally: w.alikiOnYourSide, label: m.campaign_tsk_wat_aliki() },
					{ tally: w.notSeenAliki, label: m.campaign_tsk_wat_not_seen() },
					{ tally: w.cellHollowed, label: m.campaign_tsk_wat_hollowed() }
				]
			}
		],
		sections:
			d.whistle + d.offMission + d.enteredWaT.total + d.quinnVanished + d.refusedWhistle > 0
				? [
						{
							heading: m.campaign_tsk_dag_heading(),
							rows: [
								{
									keepEmpty: true,
									stats: [
										{ value: d.whistle, label: m.campaign_tsk_dag_whistle() },
										{ value: d.offMission, label: m.campaign_tsk_dag_offmission() },
										{ tally: d.enteredWaT, label: m.campaign_tsk_dag_entered() }
									]
								},
								[
									{ value: d.quinnVanished, label: m.campaign_tsk_dag_quinn_vanished() },
									{ value: d.refusedWhistle, label: m.campaign_tsk_dag_refused() }
								]
							]
						}
					]
				: []
	})
};
