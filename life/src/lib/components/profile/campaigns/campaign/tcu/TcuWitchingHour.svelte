<!-- @component The Witching Hour: the fate foretold and the witches' spell. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const w = $derived(tcu?.witchingHour);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tcu_witch_empty()}
			rows={[
				{
					heading: m.campaign_tcu_witch_fate_heading(),
					stats: [
						{ value: w?.acceptedFate, label: m.campaign_tcu_witch_accepted() },
						{ value: w?.rejectedFate, label: m.campaign_tcu_witch_rejected() }
					]
				},
				{
					heading: m.campaign_tcu_witch_spell_heading(),
					stats: [
						{ value: w?.spellBroken, label: m.campaign_tcu_witch_broken() },
						{ value: w?.spellCast, label: m.campaign_tcu_witch_cast() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
