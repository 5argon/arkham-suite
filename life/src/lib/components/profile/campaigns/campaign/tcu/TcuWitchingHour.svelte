<!--
@component
TCU bespoke widget — "The Witching Hour". Two logged forks, grouped: whether you accepted or
rejected the fate the reading foretold, and whether the witches' spell was broken or cast. Built on
grouped StatNumbers, inside the scenario passport.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const w = $derived(tcu?.witchingHour);
	const hasData = $derived(!!w && w.acceptedFate + w.rejectedFate + w.spellBroken + w.spellCast > 0);
	const rows = $derived<StatGroup[]>(
		hasData && w
			? [
					{
						heading: m.campaign_tcu_witch_fate_heading(),
						stats: [
							{ value: w.acceptedFate, label: m.campaign_tcu_witch_accepted() },
							{ value: w.rejectedFate, label: m.campaign_tcu_witch_rejected() }
						]
					},
					{
						heading: m.campaign_tcu_witch_spell_heading(),
						stats: [
							{ value: w.spellBroken, label: m.campaign_tcu_witch_broken() },
							{ value: w.spellCast, label: m.campaign_tcu_witch_cast() }
						]
					}
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_witching_hour" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_witch_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
