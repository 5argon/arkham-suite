<!--
@component
TIC bespoke widget — "Devil Reef". The terror of Devil Reef's fate + the rising tide, and the
3 equipment items secured at the lighthouse (the `full_build` achievement). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const d = $derived(tic?.devilReef);
	const e = $derived(tic?.equipment);
	const hasData = $derived(
		!!d &&
			(d.terrorAlive + d.terrorDead + d.tideGrown > 0 ||
				(!!e && e.secured && Object.keys(e.secured).length > 0))
	);
	const rows = $derived<StatGroup[]>(
		hasData && d && e
			? [
					{
						heading: m.campaign_tic_dr_heading(),
						stats: [
							{ value: d.terrorDead, label: m.campaign_tic_dr_terror_dead() },
							{ value: d.terrorAlive, label: m.campaign_tic_dr_terror_alive() },
							{ value: d.tideGrown, label: m.campaign_tic_dr_tide() }
						]
					},
					{
						heading: m.campaign_tic_equip_heading(),
						stats: [
							{ value: e.secured.idol ?? 0, label: m.campaign_tic_equip_idol() },
							{ value: e.secured.mantle ?? 0, label: m.campaign_tic_equip_mantle() },
							{ value: e.secured.headdress ?? 0, label: m.campaign_tic_equip_headdress() }
						]
					}
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="devil_reef" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
			{#if tic && tic.equipment.allThree > 0}
				<p class="text-primary-500 mt-3 text-center text-xs">
					{m.campaign_tic_equip_full_build({ count: tic.equipment.allThree })}
				</p>
			{/if}
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_dr_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
