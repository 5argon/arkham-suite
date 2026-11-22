<!-- @component New Horizons: Zburamoarte defeated or left alive, and how the search of the meat packing facility ended. -->
<script lang="ts">
	import { COB_ZBURAMOARTE_CODE, type CampaignCob } from '$lib/campaign/campaigns/cob';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: cob, ctx }: CampaignWidgetProps<CampaignCob> = $props();

	const n = $derived(cob?.newHorizons);
</script>

<ScenarioInfo
	{ctx}
	headerCards={[
		{
			code: COB_ZBURAMOARTE_CODE,
			label: m.campaign_cob_zburamoarte(),
			tone: 'danger',
			objectTop: true
		}
	]}
>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_cob_horizons_empty()}
			rows={[
				{
					heading: m.campaign_cob_zburamoarte(),
					stats: [
						{ tally: n?.defeatedZburamoarte, label: m.campaign_cob_zburamoarte_defeated() },
						{ tally: n?.leftZburamoarteAlive, label: m.campaign_cob_zburamoarte_alive() }
					]
				},
				{
					heading: m.campaign_cob_search_heading(),
					stats: [
						{ tally: n?.completedSearch, label: m.campaign_cob_search_completed() },
						{ tally: n?.didNotComplete, label: m.campaign_cob_search_incomplete() },
						{ tally: n?.leftToTheCultsMercy, label: m.campaign_cob_cults_mercy() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
