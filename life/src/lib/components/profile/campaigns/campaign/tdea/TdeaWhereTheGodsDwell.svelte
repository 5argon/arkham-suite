<!--
@component
tdea bespoke widget — "Where the Gods Dwell". The Dream-Quest finale's single-sided outcome
distribution: the dreamers awoke / stayed in the Dreamlands forever / traveled beneath the
monastery / Nyarlathotep's invasion began, with the win sub-flavors (banished / escaped the
grasp) and the `dreamers_know_of_another_path` interlock. The combined interconnected verdict
lives in the Epilogue matrix widget. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdea,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdea: CampaignTdea | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const g = $derived(tdea?.whereTheGodsDwell);
	const hasData = $derived(!!g && g.reached > 0);
	// Grouped by the single-sided verdict (curation outcomes): banished is the better win.
	const rows = $derived<StatGroup[]>(
		hasData && g
			? [
					{
						heading: m.campaign_tdea_gods_victory_heading(),
						stats: [
							{ value: g.banished, label: m.campaign_tdea_gods_banished() },
							{ value: g.escapedGrasp, label: m.campaign_tdea_gods_escaped() },
							{ value: g.awoke, label: m.campaign_tdea_gods_awoke() }
						]
					},
					{
						heading: m.campaign_tdea_gods_bittersweet_heading(),
						stats: [
							{ value: g.stayedForever, label: m.campaign_tdea_gods_stayed() },
							{ value: g.traveledMonastery, label: m.campaign_tdea_gods_monastery() }
						]
					},
					{
						heading: m.campaign_tdea_gods_defeat_heading(),
						stats: [{ value: g.invasion, label: m.campaign_tdea_gods_invasion() }]
					},
					{
						heading: m.campaign_tdea_gods_details_heading(),
						stats: [
							{ value: g.knowAnotherPath, label: m.campaign_tdea_gods_another_path() },
							{ value: g.grandDesign, label: m.campaign_tdea_gods_grand_design() }
						]
					}
				].filter((grp) => grp.stats.some((st) => (st.value as number) > 0))
			: []
	);
</script>

<ScenarioInfo scenarioId="where_gods_dwell" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdea_gods_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
