<!-- @component In the Clutches of Chaos: Anette's and Sanford's fates, and the plays that carried on alone. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const c = $derived(tcu?.clutchesOfChaos);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tcu_clutches_empty()}
			rows={[
				{
					heading: m.campaign_tcu_clutches_anette_heading(),
					stats: [
						{ value: c?.askedAnette, label: m.campaign_tcu_clutches_asked_anette() },
						{ value: c?.arrestedAnette, label: m.campaign_tcu_clutches_arrested_anette() },
						{ value: c?.anetteTaughtSpells, label: m.campaign_tcu_clutches_taught() }
					]
				},
				{
					heading: m.campaign_tcu_clutches_sanford_heading(),
					stats: [
						{ value: c?.askedSanford, label: m.campaign_tcu_clutches_asked_sanford() },
						{ value: c?.arrestedSanford, label: m.campaign_tcu_clutches_arrested_sanford() },
						{ value: c?.assumedControl, label: m.campaign_tcu_clutches_control() }
					]
				},
				[{ value: c?.continuedAlone, label: m.campaign_tcu_clutches_alone() }]
			]}
		/>
	{/snippet}
</ScenarioInfo>
