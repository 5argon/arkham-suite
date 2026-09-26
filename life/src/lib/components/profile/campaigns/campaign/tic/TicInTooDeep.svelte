<!-- @component In Too Deep: whether you reached the vehicles or Innsmouth was consumed by the tide. -->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const d = $derived(tic?.inTooDeep);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tic_itd_empty()}
			rows={[
				[
					{ tally: d?.safe, label: m.campaign_tic_itd_safe() },
					{ tally: d?.consumed, label: m.campaign_tic_itd_consumed() }
				]
			]}
		/>
	{/snippet}
</ScenarioInfo>
