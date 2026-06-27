<!--
@component
tdeb bespoke widget — "A Thousand Shapes of Horror". Whether Randolph survived the descent
into the Underworld, and whether the Silver Key was obtained here (both from the shared
tracks — the Key passes to the Dream-Quest in interconnected play). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, {
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const r = $derived(tdeb?.shared.randolph);
	const key = $derived(tdeb?.shared.silverKey);
	const hasData = $derived(
		!!r && r.survivedDescent + r.diedDescent + (key?.obtained ?? 0) > 0
	);
	const rows = $derived<StatGroup[]>(
		hasData && r
			? [
					{
						heading: m.campaign_tdeb_shapes_descent_heading(),
						stats: [
							{ value: r.survivedDescent, label: m.campaign_tdeb_shapes_survived() },
							{ value: r.diedDescent, label: m.campaign_tdeb_shapes_died() }
						]
					},
					{
						heading: m.campaign_tdeb_shapes_key_heading(),
						stats: [{ value: key?.obtained ?? 0, label: m.campaign_tdeb_shapes_key() }]
					}
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="a_thousand_shapes_of_horror" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdeb_shapes_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
