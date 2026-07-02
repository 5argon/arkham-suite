<!--
@component
TIC bespoke widget — "In Too Deep". The flooding fork: made it safely to the vehicles vs
Innsmouth consumed by the rising tide. Built on StatNumbers.
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
	const d = $derived(tic?.inTooDeep);
	const hasData = $derived(!!d && d.safe.total + d.consumed.total > 0);
	const rows = $derived<Stat[][]>(
		hasData && d
			? [
					[
						{ value: d.safe.total, label: m.campaign_tic_itd_safe(), byTier: d.safe.byTier },
						{
							value: d.consumed.total,
							label: m.campaign_tic_itd_consumed(),
							byTier: d.consumed.byTier
						}
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="in_too_deep" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_itd_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
