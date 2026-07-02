<!--
@component
TIC bespoke widget — "The Lair of Dagon". Whether Dagon awoke (Awakened and Enraged — Massive,
6–18 health) or stayed slumbering, the gatekeeper defeated, and the Order's ritual disrupted.
(The log doesn't distinguish defeating Dagon from merely waking him — only awoke vs slumbers.)
Built on StatNumbers.
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
	const d = $derived(tic?.lairOfDagon);
	const hasData = $derived(
		!!d &&
			d.awoke.total + d.slumbers.total + d.gatekeeperDefeated.total + d.ritualDisrupted.total > 0
	);
	const rows = $derived<Stat[][]>(
		hasData && d
			? [
					[
						{
							value: d.slumbers.total,
							label: m.campaign_tic_lod_slumbers(),
							byTier: d.slumbers.byTier
						},
						{ value: d.awoke.total, label: m.campaign_tic_lod_awoke(), byTier: d.awoke.byTier }
					],
					[
						{
							value: d.gatekeeperDefeated.total,
							label: m.campaign_tic_lod_gatekeeper(),
							byTier: d.gatekeeperDefeated.byTier
						},
						{
							value: d.ritualDisrupted.total,
							label: m.campaign_tic_lod_ritual(),
							byTier: d.ritualDisrupted.byTier
						}
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_lair_of_dagon" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_lod_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
