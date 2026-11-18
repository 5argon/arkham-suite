<!-- @component Dark Side of the Moon: how the party reached the Cold Wastes and whether Randolph survived the voyage. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdea, ctx }: CampaignWidgetProps<CampaignTdea> = $props();

	const d = $derived(tdea?.darkSideOfMoon);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdea_moon_empty()}
			rows={[
				[
					{ value: d?.carried, label: m.campaign_tdea_moon_carried() },
					{ value: d?.travelled, label: m.campaign_tdea_moon_travelled() }
				],
				[
					{ value: d?.randolphSurvivedVoyage, label: m.campaign_tdea_moon_survived() },
					{ value: d?.randolphDiedVoyage, label: m.campaign_tdea_moon_died() }
				],
				[{ value: tdea?.dreamersGrowWeaker, label: m.campaign_tdea_moon_grow_weaker() }]
			]}
		/>
	{/snippet}
</ScenarioInfo>
