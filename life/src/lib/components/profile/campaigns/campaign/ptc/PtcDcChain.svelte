<!--
@component
The PtC Doubt/Conviction chain: the seven decision points in book order (Curtain Call · Reality's
Shadow · Echoes · Lost Soul · A Phantom of Truth · The Pallid Mask · Black Stars Rise), each its
scenario icon with an amber Conviction / violet Doubt letter beneath (a superscript for the +2
marks at Lost Soul / The Pallid Mask), dimmed where the run took no mark. Hover names the decision.
-->
<script lang="ts">
	import { DC_SOURCE_SCENARIOS, type DcBead } from '$lib/campaign/campaigns/ptc';
	import TwoSidedChain from '$lib/components/profile/campaigns/campaign/TwoSidedChain.svelte';
	import { DC_TINT, dcIconSet, ptcScenarioName } from './ptc-dc-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { beads, size = '1.4rem' }: { beads: DcBead[]; size?: string } = $props();

	const sides = {
		conviction: { abbr: m.campaign_ptc_dc_conviction_abbr(), tint: DC_TINT.conviction },
		doubt: { abbr: m.campaign_ptc_dc_doubt_abbr(), tint: DC_TINT.doubt }
	};

	/** The decision that granted a mark: the 4 log sources reuse their outcome messages, the 3
	 *  Extra sources name the in-scenario prompt. */
	const SOURCE: Record<string, { conviction: () => string; doubt: () => string }> = {
		curtain_call: {
			conviction: m.campaign_ptc_curtain_warned,
			doubt: m.campaign_ptc_curtain_not_warned
		},
		reality_s_shadow: {
			conviction: m.campaign_ptc_lastking_slayed,
			doubt: m.campaign_ptc_lastking_intruded
		},
		echoes_of_the_past: {
			conviction: m.campaign_ptc_echoes_took_onyx,
			doubt: m.campaign_ptc_echoes_left_onyx
		},
		lost_soul: {
			conviction: m.campaign_ptc_oath_daniel_heeded,
			doubt: m.campaign_ptc_oath_daniel_ignored
		},
		a_phantom_of_truth: {
			conviction: m.campaign_ptc_dc_src_phantom,
			doubt: m.campaign_ptc_dc_src_phantom
		},
		the_pallid_mask: {
			conviction: m.campaign_ptc_dc_src_pallid,
			doubt: m.campaign_ptc_dc_src_pallid
		},
		black_stars_rise: { conviction: m.campaign_ptc_dc_src_bsr, doubt: m.campaign_ptc_dc_src_bsr }
	};
	function earnedTitle(b: DcBead): string {
		const decision = SOURCE[b.scenario]?.[b.side]() ?? b.scenario;
		const side =
			b.side === 'conviction'
				? m.campaign_ptc_dc_conviction_full()
				: m.campaign_ptc_dc_doubt_full();
		return `${decision} (+${b.amount} ${side})`;
	}
</script>

<TwoSidedChain
	{beads}
	sources={DC_SOURCE_SCENARIOS}
	{sides}
	iconSet={dcIconSet}
	scenarioName={ptcScenarioName}
	{earnedTitle}
	neutralLabel={m.campaign_ptc_dc_neutral()}
	{size}
/>
