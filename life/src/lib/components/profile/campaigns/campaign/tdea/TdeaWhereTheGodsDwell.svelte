<!-- @component Where the Gods Dwell: the Dream-Quest's own ending, grouped by verdict. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdea, ctx }: CampaignWidgetProps<CampaignTdea> = $props();

	const g = $derived(tdea?.whereTheGodsDwell);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdea_gods_empty()}
			rows={[
				{
					heading: m.campaign_tdea_gods_victory_heading(),
					stats: [
						{ value: g?.banished, label: m.campaign_tdea_gods_banished() },
						{ value: g?.escapedGrasp, label: m.campaign_tdea_gods_escaped() },
						{ value: g?.awoke, label: m.campaign_tdea_gods_awoke() }
					]
				},
				{
					heading: m.campaign_tdea_gods_bittersweet_heading(),
					stats: [
						{ value: g?.stayedForever, label: m.campaign_tdea_gods_stayed() },
						{ value: g?.traveledMonastery, label: m.campaign_tdea_gods_monastery() }
					]
				},
				{
					heading: m.campaign_tdea_gods_defeat_heading(),
					stats: [{ value: g?.invasion, label: m.campaign_tdea_gods_invasion() }]
				},
				{
					heading: m.campaign_tdea_gods_details_heading(),
					stats: [
						{ value: g?.knowAnotherPath, label: m.campaign_tdea_gods_another_path() },
						{ value: g?.grandDesign, label: m.campaign_tdea_gods_grand_design() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
