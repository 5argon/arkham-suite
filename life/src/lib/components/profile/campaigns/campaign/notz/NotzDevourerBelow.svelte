<!--
@component
NotZ bespoke widget — "The Devourer Below". The finale beneath Arkham: the ritual broken
(a win), Umôrdhoth repelled (the better ending), Arkham succumbed (the loss), and whether
the investigators sacrificed Lita Chantler. StatNumbers (grouped), labels from log text.
-->
<script lang="ts">
	import { notzText, type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		notz,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		notz: CampaignNotz | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const d = $derived(notz?.devourerBelow ?? null);
	const total = $derived(d ? d.ritualBroken + d.umordhothRepelled + d.arkhamSuccumbed + d.litaSacrificed : 0);
	const hasData = $derived(!!d && total > 0);
	const rows = $derived<StatGroup[]>(
		hasData && d
			? [
					{
						heading: m.campaign_notz_devourer_heading(),
						stats: [
							{ value: d.ritualBroken, label: notzText('campaign_notes.ritual_broken') },
							{ value: d.umordhothRepelled, label: notzText('campaign_notes.umordhoth_repelled') },
							{ value: d.arkhamSuccumbed, label: notzText('campaign_notes.arkham_succumbed') },
							{ value: d.litaSacrificed, label: notzText('campaign_notes.lita_sacrificed') }
						]
					}
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_devourer_below" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_notz_devourer_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
