/** Each TDC dive site's passport: its header card and its logged forks (`TDC_OUTCOMES`) under short labels. */
import { logText } from '$lib/campaign/records/campaign-log-source';
import * as m from '$lib/paraglide/messages.js';

/** One number on a dive-site passport: a logged fork's play count, or the site's glyphs decrypted. */
export type TdcStat = { key: string; label: () => string } | { glyphs: true };

export interface TdcScenarioView {
	/** The card shown in the passport header. */
	header: { code: string; tone?: 'primary' | 'danger' };
	groups: { heading?: () => string; stats: TdcStat[] }[];
}

const GLYPHS: TdcStat = { glyphs: true };
const artifact = (id: string): TdcStat => ({
	key: `artifacts_earned.${id}`,
	label: () => logText('tdc', `artifacts_earned.${id}`)
});

/** Each dive site's passport: its header card and its forks under short labels. */
export const TDC_SCENARIO_VIEWS: Record<string, TdcScenarioView> = {
	one_last_job: {
		header: { code: '11765' },
		groups: [
			{
				heading: m.campaign_tdc_bet_heading,
				stats: [
					{ key: 'campaign_notes.ruby_won_the_bet', label: m.campaign_tdc_bet_won },
					{ key: 'campaign_notes.ruby_lost_the_bet', label: m.campaign_tdc_bet_lost }
				]
			},
			{
				stats: [
					{
						key: 'campaign_notes.discovered_an_alien_language',
						label: m.campaign_tdc_alien_language
					},
					GLYPHS
				]
			}
		]
	},
	the_western_wall: {
		header: { code: '11537b', tone: 'danger' },
		groups: [
			{
				heading: m.campaign_tdc_pilgrim_heading,
				stats: [
					{ key: 'campaign_notes.expedition_helped_pilgrim', label: m.campaign_tdc_pilgrim_helped },
					{ key: 'campaign_notes.expedition_abandoned_pilgrim', label: m.campaign_tdc_pilgrim_left }
				]
			},
			{
				stats: [
					{
						key: 'campaign_notes.the_creature_was_defeated',
						label: m.campaign_tdc_creature_defeated_full
					},
					GLYPHS
				]
			}
		]
	},
	the_drowned_quarter: {
		header: { code: '11552' },
		groups: [
			{
				stats: [
					artifact('barrier_node'),
					{ key: 'campaign_notes.the_power_was_diverted', label: m.campaign_tdc_power_diverted },
					GLYPHS
				]
			}
		]
	},
	the_apiary: {
		header: { code: '11573', tone: 'danger' },
		groups: [
			{
				heading: m.campaign_tdc_pilgrims_heading,
				stats: [
					{ key: 'campaign_notes.pilgrims_were_saved', label: m.campaign_tdc_pilgrims_saved },
					{ key: 'campaign_notes.pilgrims_were_devoured', label: m.campaign_tdc_pilgrims_devoured },
					{
						key: 'campaign_notes.exterminated_the_alien_parasites',
						label: m.campaign_tdc_parasites_exterminated
					}
				]
			},
			{
				heading: m.campaign_tdc_interlude_heading,
				stats: [
					{ key: 'hidden.tdc_lost_pilgrims', label: m.campaign_tdc_lost_pilgrims },
					{ key: 'hidden.tdc_hive_mind', label: m.campaign_tdc_hive_mind }
				]
			},
			{ stats: [artifact('grisly_mask'), GLYPHS] }
		]
	},
	the_grand_vault: {
		header: { code: '11611' },
		groups: [
			{
				stats: [
					{
						key: 'campaign_notes.the_inner_sanctum_was_unsealed',
						label: m.campaign_tdc_sanctum_unsealed
					},
					{ key: 'hidden.tdc_vault_core', label: m.campaign_tdc_vault_core }
				]
			},
			{ stats: [artifact('tidal_tablet'), GLYPHS] }
		]
	},
	court_of_the_ancients: {
		header: { code: '11638' },
		groups: [{ stats: [artifact('shard'), GLYPHS] }]
	},
	obsidian_canyons: {
		header: { code: '11672a' },
		groups: [
			{
				stats: [
					artifact('obsidian_claw'),
					{ key: 'hidden.tdc_helped_with_the_ropes', label: m.campaign_tdc_helped_with_the_ropes },
					GLYPHS
				]
			}
		]
	}
};
