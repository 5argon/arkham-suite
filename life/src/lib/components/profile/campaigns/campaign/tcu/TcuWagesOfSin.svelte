<!--
@component
TCU bespoke widget — "The Wages of Sin". How many heretics you released (the most in a
play) and how often you survived the Watcher's embrace. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tcu,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tcu: CampaignTcu | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const w = $derived(tcu?.wagesOfSin);
	const hasData = $derived(!!w && (w.hereticsReleasedMax !== null || w.survivedWatcher > 0));
	const rows = $derived<Stat[][]>(
		hasData && w
			? [
					[
						{ value: w.hereticsReleasedMax, label: m.campaign_tcu_wages_heretics() },
						{ value: w.survivedWatcher, label: m.campaign_tcu_wages_watcher() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_wages_of_sin" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_wages_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
