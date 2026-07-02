<!--
@component
TCU bespoke widget — "In the Clutches of Chaos". The two fates you hand down, grouped: Anette's
(asked her for aid / arrested her / learned her spells) and Sanford's (asked him for aid / arrested
him / seized control of the Lodge), plus the plays you carried on alone. Both leaders' fates feed the
Lodge-vs-Coven spine. Built on grouped StatNumbers.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const c = $derived(tcu?.clutchesOfChaos);
	const hasData = $derived(
		!!c &&
			c.askedAnette +
				c.arrestedAnette +
				c.anetteTaughtSpells +
				c.askedSanford +
				c.arrestedSanford +
				c.assumedControl +
				c.continuedAlone >
				0
	);
	const rows = $derived<(Stat[] | StatGroup)[]>(
		hasData && c
			? [
					{
						heading: m.campaign_tcu_clutches_anette_heading(),
						stats: [
							{ value: c.askedAnette, label: m.campaign_tcu_clutches_asked_anette() },
							{ value: c.arrestedAnette, label: m.campaign_tcu_clutches_arrested_anette() },
							{ value: c.anetteTaughtSpells, label: m.campaign_tcu_clutches_taught() }
						]
					},
					{
						heading: m.campaign_tcu_clutches_sanford_heading(),
						stats: [
							{ value: c.askedSanford, label: m.campaign_tcu_clutches_asked_sanford() },
							{ value: c.arrestedSanford, label: m.campaign_tcu_clutches_arrested_sanford() },
							{ value: c.assumedControl, label: m.campaign_tcu_clutches_control() }
						]
					},
					...(c.continuedAlone > 0
						? [[{ value: c.continuedAlone, label: m.campaign_tcu_clutches_alone() }]]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="in_the_clutches_of_chaos" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_clutches_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
