<!-- @component Point of No Return: times the investigators found a way out of the Underworld. -->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdeb, ctx }: CampaignWidgetProps<CampaignTdeb> = $props();
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdeb_pnr_empty()}
			rows={[[{ value: tdeb?.pointOfNoReturn.foundWayOut, label: m.campaign_tdeb_pnr_found() }]]}
		/>
	{/snippet}
</ScenarioInfo>
