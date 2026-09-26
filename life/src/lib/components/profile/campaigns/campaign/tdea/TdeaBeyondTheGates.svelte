<!-- @component Beyond the Gates of Sleep: Randolph's rescue, the cats' tribute, the Zoogs and straying from the path. -->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdea, ctx }: CampaignWidgetProps<CampaignTdea> = $props();

	const b = $derived(tdea?.beyondGates);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdea_gates_empty()}
			rows={[
				[
					{ value: b?.savedByRandolph, label: m.campaign_tdea_gates_saved() },
					{ value: b?.strayedFromPath, label: m.campaign_tdea_gates_strayed() }
				],
				[
					{ value: b?.catsCollectedTribute, label: m.campaign_tdea_gates_tribute() },
					{ value: b?.parleyedZoogs, label: m.campaign_tdea_gates_zoogs() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
