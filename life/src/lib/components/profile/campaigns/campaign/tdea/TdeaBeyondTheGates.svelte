<!--
@component
tdea bespoke widget — "Beyond the Gates of Sleep". The opening scenario's decisions: saved
by Randolph Carter, the cats collected their tribute, parleyed with the Zoogs, strayed from
the path. Built on StatNumbers.
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
	const b = $derived(tdea?.beyondGates);
	const hasData = $derived(
		!!b && b.savedByRandolph + b.catsCollectedTribute + b.parleyedZoogs + b.strayedFromPath > 0
	);
	const rows = $derived<Stat[][]>(
		hasData && b
			? [
					[
						{ value: b.savedByRandolph, label: m.campaign_tdea_gates_saved() },
						{ value: b.strayedFromPath, label: m.campaign_tdea_gates_strayed() }
					],
					[
						{ value: b.catsCollectedTribute, label: m.campaign_tdea_gates_tribute() },
						{ value: b.parleyedZoogs, label: m.campaign_tdea_gates_zoogs() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="beyond_the_gates_of_sleep" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdea_gates_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
