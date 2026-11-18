<!-- @component Weaver of the Cosmos: the Web of Dreams' own ending, grouped by verdict. -->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdeb, ctx }: CampaignWidgetProps<CampaignTdeb> = $props();

	const w = $derived(tdeb?.weaver);
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tdeb_weaver_empty()}
			rows={[
				{
					heading: m.campaign_tdeb_weaver_victory_heading(),
					stats: [
						{ value: w?.returnedToReality, label: m.campaign_tdeb_weaver_returned() },
						{ value: w?.stillInDreamlands, label: m.campaign_tdeb_weaver_still() },
						{ value: w?.bridgeDestroyed, label: m.campaign_tdeb_weaver_destroyed() }
					]
				},
				{
					heading: m.campaign_tdeb_weaver_defeat_heading(),
					stats: [
						{ value: w?.bridgeCompleted, label: m.campaign_tdeb_weaver_completed() },
						{ value: w?.neverEscaped, label: m.campaign_tdeb_weaver_never() }
					]
				},
				{
					heading: m.campaign_tdeb_weaver_details_heading(),
					stats: [
						{ value: w?.trappedInRealm, label: m.campaign_tdeb_weaver_trapped() },
						{ value: w?.spiderQueen, label: m.campaign_tdeb_weaver_spider() }
					]
				}
			]}
		/>
	{/snippet}
</ScenarioInfo>
