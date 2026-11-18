<!-- @component At Death's Doorstep: how the spectral realm let the investigators go, and the most evidence left behind. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const d = $derived(tcu?.atDeathsDoorstep);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tcu_doorstep_empty()}
			rows={[
				{
					heading: m.campaign_tcu_doorstep_heading(),
					stats: [
						{ value: d?.escaped, label: m.campaign_tcu_doorstep_escaped() },
						{ value: d?.learnedNothing, label: m.campaign_tcu_doorstep_learned_nothing() },
						{ value: d?.neverSeenAgain, label: m.campaign_tcu_doorstep_never_seen() }
					]
				},
				{
					keepEmpty: tcu?.evidenceMax != null,
					stats: [{ value: tcu?.evidenceMax, label: m.campaign_tcu_doorstep_evidence() }]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
