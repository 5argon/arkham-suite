<!-- @component The Secret Name: whether the Lodge was told about the coven. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tcu_secret_empty()}
			rows={[
				[
					{ value: tcu?.secretName.toldLodge, label: m.campaign_tcu_secret_told() },
					{ value: tcu?.secretName.hidCoven, label: m.campaign_tcu_secret_hid() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
