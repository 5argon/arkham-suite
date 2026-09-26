<!-- @component Into the Maelstrom: the flood's outcome and, behind the secret ending, Agent Harper's mission. -->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const f = $derived(tic?.finale);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tic_itm_empty()}
			rows={[
				{
					heading: m.campaign_tic_itm_flood_heading(),
					stats: [
						{ tally: f?.plotThwarted, label: m.campaign_tic_itm_thwarted() },
						{ tally: f?.escaped, label: m.campaign_tic_itm_escaped() },
						{ tally: f?.floodBegun, label: m.campaign_tic_itm_flood() },
						{ tally: f?.floodedEarth, label: m.campaign_tic_itm_flooded() }
					]
				},
				{
					heading: m.campaign_tic_itm_harper_heading(),
					stats: [
						{ tally: f?.harperComplete, label: m.campaign_tic_itm_harper_complete() },
						{ tally: f?.richesLost, label: m.campaign_tic_itm_riches_lost() },
						{ tally: f?.harperCompleteCost, label: m.campaign_tic_itm_harper_cost() },
						{ tally: f?.richesDestroyed, label: m.campaign_tic_itm_riches_destroyed() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
