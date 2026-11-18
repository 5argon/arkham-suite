<!-- @component Lost in Time and Space: the finale's endings and the epilogue read after a win. -->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();

	const f = $derived(dwl?.finale);
	const e = $derived(dwl?.epilogue);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={m.campaign_dwl_finale_empty()}
			rows={[
				[
					{ value: f?.closedTear, label: m.campaign_dwl_finale_closed() },
					{ value: f?.yogFled, label: m.campaign_dwl_finale_fled() },
					{ value: f?.yogBecameOne, label: m.campaign_dwl_finale_became_one() }
				],
				{
					nonLog: true,
					stats: [{ value: f?.wonLostForever, label: m.campaign_dwl_finale_lost_forever() }]
				},
				{
					heading: m.campaign_dwl_epilogue_heading(),
					stats: [
						{ value: e?.peaceful, label: m.campaign_dwl_epilogue_peaceful() },
						{ value: e?.ominous, label: m.campaign_dwl_epilogue_ominous() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
