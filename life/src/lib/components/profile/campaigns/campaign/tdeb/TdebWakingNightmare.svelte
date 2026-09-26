<!-- @component Waking Nightmare: Dr. Maheswaran's fate and how Randolph escaped the hospital. -->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdeb, ctx }: CampaignWidgetProps<CampaignTdeb> = $props();

	const w = $derived(tdeb?.wakingNightmare);
	const r = $derived(tdeb?.shared.randolph);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdeb_waking_empty()}
			rows={[
				{
					heading: m.campaign_tdeb_waking_doctor_heading(),
					stats: [
						{ value: w?.doctorJoined, label: m.campaign_tdeb_waking_joined() },
						{ value: w?.doctorStayed, label: m.campaign_tdeb_waking_stayed() },
						{ value: w?.doctorAlive, label: m.campaign_tdeb_waking_alive() },
						{ value: w?.doctorMissing, label: m.campaign_tdeb_waking_missing() },
						{ value: w?.doctorFateUnknown, label: m.campaign_tdeb_waking_unknown() }
					]
				},
				{
					heading: m.campaign_tdeb_waking_randolph_heading(),
					stats: [
						{ value: r?.escapedAlone, label: m.campaign_tdeb_waking_escaped_alone() },
						{ value: r?.escapedWithInvestigators, label: m.campaign_tdeb_waking_escaped_with() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
