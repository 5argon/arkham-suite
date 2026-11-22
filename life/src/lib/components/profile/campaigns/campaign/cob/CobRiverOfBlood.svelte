<!-- @component River of Blood: whether Julia Stern was spared, killed or got away. -->
<script lang="ts">
	import { COB_JULIA_CODE, type CampaignCob } from '$lib/campaign/campaigns/cob';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: cob, ctx }: CampaignWidgetProps<CampaignCob> = $props();

	const r = $derived(cob?.riverOfBlood);
</script>

<ScenarioInfo
	{ctx}
	headerCards={[
		{ code: COB_JULIA_CODE, label: m.campaign_cob_julia(), tone: 'danger', objectTop: true }
	]}
>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_cob_river_empty()}
			rows={[
				{
					heading: m.campaign_cob_julia(),
					stats: [
						{ tally: r?.spared, label: m.campaign_cob_julia_spared() },
						{ tally: r?.killed, label: m.campaign_cob_julia_killed() },
						{ tally: r?.failedToStop, label: m.campaign_cob_julia_got_away() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
