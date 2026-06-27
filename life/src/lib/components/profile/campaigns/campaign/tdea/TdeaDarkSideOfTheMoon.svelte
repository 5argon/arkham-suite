<!--
@component
tdea bespoke widget — "Dark Side of the Moon". Carried vs travelled to the Cold Wastes, and
whether Randolph survived the voyage. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdea,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdea: CampaignTdea | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const d = $derived(tdea?.darkSideOfMoon);
	const hasData = $derived(
		!!d && d.carried + d.travelled + d.randolphSurvivedVoyage + d.randolphDiedVoyage > 0
	);
	const rows = $derived<Stat[][]>(
		hasData && d
			? [
					[
						{ value: d.carried, label: m.campaign_tdea_moon_carried() },
						{ value: d.travelled, label: m.campaign_tdea_moon_travelled() }
					],
					[
						{ value: d.randolphSurvivedVoyage, label: m.campaign_tdea_moon_survived() },
						{ value: d.randolphDiedVoyage, label: m.campaign_tdea_moon_died() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="dark_side_of_the_moon" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdea_moon_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
