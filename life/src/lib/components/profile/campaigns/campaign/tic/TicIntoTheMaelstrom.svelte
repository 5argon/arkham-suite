<!--
@component
TIC bespoke widget — "Into the Maelstrom". The finale's two axes: the flood outcome (plot
thwarted / escaped / flood begun / Earth flooded) and — behind the 7-key secret branch — Agent
Harper's mission (helped: mission complete · defied: riches lost; the "…at what cost" pyrrhic
variants). The single-sided W/L is in the Campaign Overview endings; this shows the breakdown.
Built on StatNumbers.
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
	const f = $derived(tic?.finale);
	const floodTotal = $derived(f ? f.escaped + f.plotThwarted + f.floodBegun + f.floodedEarth : 0);
	const harperTotal = $derived(
		f ? f.harperComplete + f.harperCompleteCost + f.richesLost + f.richesDestroyed : 0
	);
	const hasData = $derived(!!f && floodTotal + harperTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && f
			? [
					{
						heading: m.campaign_tic_itm_flood_heading(),
						stats: [
							{ value: f.plotThwarted, label: m.campaign_tic_itm_thwarted() },
							{ value: f.escaped, label: m.campaign_tic_itm_escaped() },
							{ value: f.floodBegun, label: m.campaign_tic_itm_flood() },
							{ value: f.floodedEarth, label: m.campaign_tic_itm_flooded() }
						]
					},
					...(harperTotal > 0
						? [
								{
									heading: m.campaign_tic_itm_harper_heading(),
									stats: [
										{ value: f.harperComplete, label: m.campaign_tic_itm_harper_complete() },
										{ value: f.richesLost, label: m.campaign_tic_itm_riches_lost() },
										{ value: f.harperCompleteCost, label: m.campaign_tic_itm_harper_cost() },
										{ value: f.richesDestroyed, label: m.campaign_tic_itm_riches_destroyed() }
									]
								}
							]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="into_the_maelstrom" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_itm_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
