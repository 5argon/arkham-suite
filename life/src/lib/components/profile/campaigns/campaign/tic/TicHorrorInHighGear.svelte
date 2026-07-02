<!--
@component
TIC bespoke widget — "Horror in High Gear". The car chase's time pressure: reached Falcon
Point before sunrise vs after. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tic,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tic: CampaignTic | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const h = $derived(tic?.horror);
	const hasData = $derived(!!h && h.beforeSunrise.total + h.afterSunrise.total > 0);
	const rows = $derived<Stat[][]>(
		hasData && h
			? [
					[
						{
							value: h.beforeSunrise.total,
							label: m.campaign_tic_hhg_before(),
							byTier: h.beforeSunrise.byTier
						},
						{
							value: h.afterSunrise.total,
							label: m.campaign_tic_hhg_after(),
							byTier: h.afterSunrise.byTier
						}
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="horror_in_high_gear" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_hhg_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
