<!--
@component
NotZ bespoke widget — "The Midnight Masks". Hunting the cult: how many cultists you
interrogated vs how many got away (the Cultist deck — lifetime counts across plays), and
whether the night ran past midnight (the Masked Hunter time-pressure). StatNumbers (grouped).
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
	const mm = $derived(notz?.midnightMasks ?? null);
	const cultistsTotal = $derived(mm ? mm.interrogated + mm.escaped : 0);
	const hasData = $derived(!!mm && cultistsTotal + mm.pastMidnight > 0);
	const rows = $derived<StatGroup[]>(
		hasData && mm
			? [
					...(cultistsTotal > 0
						? [
								{
									heading: m.campaign_notz_cultists_heading(),
									stats: [
										{ value: mm.interrogated, label: m.campaign_notz_interrogated() },
										{ value: mm.escaped, label: m.campaign_notz_escaped() }
									]
								}
							]
						: []),
					...(mm.pastMidnight > 0
						? [{ stats: [{ value: mm.pastMidnight, label: notzText('campaign_notes.past_midnight') }] }]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_midnight_masks" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_notz_masks_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
