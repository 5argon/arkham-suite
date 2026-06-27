<!--
@component
TCU bespoke widget — "The Witching Hour". Accepted vs rejected your fate, and whether
the witches' spell was broken or cast. Built on StatNumbers.
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
	const w = $derived(tcu?.witchingHour);
	const hasData = $derived(!!w && w.acceptedFate + w.rejectedFate + w.spellBroken + w.spellCast > 0);
	const rows = $derived<Stat[][]>(
		hasData && w
			? [
					[
						{ value: w.acceptedFate, label: m.campaign_tcu_witch_accepted() },
						{ value: w.rejectedFate, label: m.campaign_tcu_witch_rejected() }
					],
					[
						{ value: w.spellBroken, label: m.campaign_tcu_witch_broken() },
						{ value: w.spellCast, label: m.campaign_tcu_witch_cast() }
					]
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
