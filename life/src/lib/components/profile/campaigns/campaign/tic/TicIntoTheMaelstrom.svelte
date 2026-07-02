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
	import StatNumbers, {
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const floodTotal = $derived(
		f ? f.escaped.total + f.plotThwarted.total + f.floodBegun.total + f.floodedEarth.total : 0
	);
	const harperTotal = $derived(
		f
			? f.harperComplete.total +
					f.harperCompleteCost.total +
					f.richesLost.total +
					f.richesDestroyed.total
			: 0
	);
	const hasData = $derived(!!f && floodTotal + harperTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && f
			? [
					{
						heading: m.campaign_tic_itm_flood_heading(),
						stats: [
							{
								value: f.plotThwarted.total,
								label: m.campaign_tic_itm_thwarted(),
								byTier: f.plotThwarted.byTier
							},
							{
								value: f.escaped.total,
								label: m.campaign_tic_itm_escaped(),
								byTier: f.escaped.byTier
							},
							{
								value: f.floodBegun.total,
								label: m.campaign_tic_itm_flood(),
								byTier: f.floodBegun.byTier
							},
							{
								value: f.floodedEarth.total,
								label: m.campaign_tic_itm_flooded(),
								byTier: f.floodedEarth.byTier
							}
						]
					},
					...(harperTotal > 0
						? [
								{
									heading: m.campaign_tic_itm_harper_heading(),
									stats: [
										{
											value: f.harperComplete.total,
											label: m.campaign_tic_itm_harper_complete(),
											byTier: f.harperComplete.byTier
										},
										{
											value: f.richesLost.total,
											label: m.campaign_tic_itm_riches_lost(),
											byTier: f.richesLost.byTier
										},
										{
											value: f.harperCompleteCost.total,
											label: m.campaign_tic_itm_harper_cost(),
											byTier: f.harperCompleteCost.byTier
										},
										{
											value: f.richesDestroyed.total,
											label: m.campaign_tic_itm_riches_destroyed(),
											byTier: f.richesDestroyed.byTier
										}
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
