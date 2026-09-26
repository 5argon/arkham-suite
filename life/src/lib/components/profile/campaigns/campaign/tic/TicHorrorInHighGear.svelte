<!-- @component Horror in High Gear: whether you reached Falcon Point before or after sunrise. -->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const h = $derived(tic?.horror);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tic_hhg_empty()}
			rows={[
				[
					{ tally: h?.beforeSunrise, label: m.campaign_tic_hhg_before() },
					{ tally: h?.afterSunrise, label: m.campaign_tic_hhg_after() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
