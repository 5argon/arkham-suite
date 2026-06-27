<!--
@component
tdeb bespoke widget — "Point of No Return". Times the investigators found a way out of the
Underworld. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdeb,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdeb: CampaignTdeb | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const p = $derived(tdeb?.pointOfNoReturn);
	const hasData = $derived(!!p && p.foundWayOut > 0);
	const rows = $derived<Stat[][]>(
		hasData && p ? [[{ value: p.foundWayOut, label: m.campaign_tdeb_pnr_found() }]] : []
	);
</script>

<ScenarioInfo scenarioId="point_of_no_return" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdeb_pnr_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
