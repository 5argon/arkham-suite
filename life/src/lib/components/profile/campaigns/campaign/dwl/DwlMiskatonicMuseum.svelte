<!-- @component The Miskatonic Museum: the Necronomicon's fate and how the museum was entered. -->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();

	const nec = $derived(dwl?.necronomicon);
	const approach = $derived(dwl?.miskatonicApproach);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			logOnly={ctx.logOnly}
			empty={m.campaign_dwl_miskatonic_empty()}
			rows={[
				{
					heading: m.campaign_dwl_miskatonic_nec_heading(),
					stats: [
						{ value: nec?.took, label: m.campaign_dwl_necronomicon_took() },
						{ value: nec?.destroyed, label: m.campaign_dwl_necronomicon_destroyed() },
						{ value: nec?.failed, label: m.campaign_dwl_necronomicon_failed() }
					]
				},
				{
					heading: m.campaign_dwl_miskatonic_approach_heading(),
					nonLog: true,
					stats: [
						{ value: approach?.brokeIn, label: m.campaign_dwl_miskatonic_broke_in() },
						{ value: approach?.spokeToAdam, label: m.campaign_dwl_miskatonic_spoke_to_adam() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
