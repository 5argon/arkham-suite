<!--
@component
TIC bespoke widget — "A Light in the Fog". The map + key to Y'ha-nthlei obtained (two of the
finale's obtainable keys) and whether you kept a Diving Suit (the `fish_out_of_water`
achievement). Built on StatNumbers.
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
	const l = $derived(tic?.lightInTheFog);
	const hasData = $derived(!!l && l.map + l.key + l.divingSuit > 0);
	const rows = $derived<Stat[][]>(
		hasData && l
			? [
					[
						{ value: l.key, label: m.campaign_tic_lif_key() },
						{ value: l.map, label: m.campaign_tic_lif_map() },
						{ value: l.divingSuit, label: m.campaign_tic_lif_suit() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="a_light_in_the_fog" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tic_lif_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
