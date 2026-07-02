<!--
@component
NotZ bespoke widget — "The Gathering". The opening night: your house left standing or burned to the
ground, whether Lita Chantler was recruited or forced to find others, and whether the Ghoul Priest
was slain here or left alive to stalk you into the finale. Three grouped StatNumbers (2+2+2), each
number hoverable for its per-difficulty split. Lita's card heads the passport.
-->
<script lang="ts">
	import { type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
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
	const houseTotal = $derived(g ? g.houseStanding.total + g.houseBurned.total : 0);
	const litaTotal = $derived(g ? g.litaRecruited.total + g.litaFindsOthers.total : 0);
	const ghoulTotal = $derived(g ? g.ghoulPriestSlain.total + g.ghoulPriestSurvived.total : 0);
	const hasData = $derived(!!g && houseTotal + litaTotal + ghoulTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && g
			? [
					...(houseTotal > 0
						? [
								{
									heading: m.campaign_notz_house_heading(),
									stats: [
										{ value: g.houseStanding.total, label: m.campaign_notz_house_standing(), byTier: g.houseStanding.byTier },
										{ value: g.houseBurned.total, label: m.campaign_notz_house_burned(), byTier: g.houseBurned.byTier }
									]
								}
							]
						: []),
					...(litaTotal > 0
						? [
								{
									heading: m.campaign_notz_lita_heading(),
									stats: [
										{ value: g.litaRecruited.total, label: m.campaign_notz_lita_recruited(), byTier: g.litaRecruited.byTier },
										{ value: g.litaFindsOthers.total, label: m.campaign_notz_lita_found_others(), byTier: g.litaFindsOthers.byTier }
									]
								}
							]
						: []),
					...(ghoulTotal > 0
						? [
								{
									heading: m.campaign_notz_ghoul_heading(),
									stats: [
										{ value: g.ghoulPriestSlain.total, label: m.campaign_notz_ghoul_slain(), byTier: g.ghoulPriestSlain.byTier },
										{ value: g.ghoulPriestSurvived.total, label: m.campaign_notz_ghoul_survived(), byTier: g.ghoulPriestSurvived.byTier }
									]
								}
							]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_gathering" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code="01117" alt="Lita Chantler" title="Lita Chantler" objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_notz_gathering_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
