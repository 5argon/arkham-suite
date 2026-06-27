<!--
@component
tdeb bespoke widget — "Weaver of the Cosmos". The Web of Dreams finale's single-sided outcome
distribution: returned to reality / never escaped / still in the Dreamlands / the bridge was
completed, with the sub-flavors (bridge destroyed, trapped in Atlach-Nacha's realm, the Spider
Queen). The combined interconnected verdict lives in the Epilogue matrix widget. Built on
StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdeb,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdeb: CampaignTdeb | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const w = $derived(tdeb?.weaver);
	const hasData = $derived(!!w && w.reached > 0);
	const rows = $derived<Stat[][]>(
		hasData && w
			? [
					[
						{ value: w.returnedToReality, label: m.campaign_tdeb_weaver_returned() },
						{ value: w.neverEscaped, label: m.campaign_tdeb_weaver_never() },
						{ value: w.stillInDreamlands, label: m.campaign_tdeb_weaver_still() }
					],
					[
						{ value: w.bridgeCompleted, label: m.campaign_tdeb_weaver_completed() },
						{ value: w.bridgeDestroyed, label: m.campaign_tdeb_weaver_destroyed() }
					],
					[
						{ value: w.trappedInRealm, label: m.campaign_tdeb_weaver_trapped() },
						{ value: w.spiderQueen, label: m.campaign_tdeb_weaver_spider() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="weaver_of_the_cosmos" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdeb_weaver_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
