<!--
@component
NotZ bespoke widget — "The Gathering". The opening scenario: whether your house was left
standing or burned to the ground, whether the Ghoul Priest survived (a threat that follows
you into later scenarios), and whether Lita was forced to find others. StatNumbers (grouped).
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
	const g = $derived(notz?.gathering ?? null);
	const houseTotal = $derived(g ? g.houseStanding + g.houseBurned : 0);
	const aftermathTotal = $derived(g ? g.ghoulPriestAlive + g.litaFindsOthers : 0);
	const hasData = $derived(!!g && houseTotal + aftermathTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && g
			? [
					...(houseTotal > 0
						? [
								{
									heading: m.campaign_notz_house_heading(),
									stats: [
										{ value: g.houseStanding, label: notzText('campaign_notes.house_standing') },
										{ value: g.houseBurned, label: notzText('campaign_notes.house_burned') }
									]
								}
							]
						: []),
					...(aftermathTotal > 0
						? [
								{
									heading: m.campaign_notz_aftermath_heading(),
									stats: [
										{ value: g.ghoulPriestAlive, label: notzText('campaign_notes.ghoul_priest_alive') },
										{ value: g.litaFindsOthers, label: notzText('campaign_notes.lita_finds_others') }
									]
								}
							]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_gathering" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_notz_gathering_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
