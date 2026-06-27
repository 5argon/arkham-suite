<!--
@component
DWL bespoke widget — "Undimensioned and Unseen". A scoreboard of how many broods
escaped into the wild (0 = none escaped, else the recorded count) across plays,
plus whether you calmed or warned the townsfolk. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		dwl,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		dwl: CampaignDwl | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const t = $derived(dwl?.townsfolk);
	const hasData = $derived(!!dwl && (dwl.broodPlays > 0 || (!!t && (t.calmed > 0 || t.warned > 0))));

	const broodRow = $derived<Stat[]>(
		dwl
			? Object.keys(dwl.broodCounts)
					.map(Number)
					.sort((a, b) => a - b)
					.map((n) => ({
						value: dwl.broodCounts[n],
						label: n === 0 ? m.campaign_dwl_broods_none() : m.campaign_dwl_broods_label({ n })
					}))
			: []
	);
	const townsfolkRow = $derived<Stat[]>(
		t && (t.calmed > 0 || t.warned > 0)
			? [
					{ value: t.calmed, label: m.campaign_dwl_townsfolk_calmed() },
					{ value: t.warned, label: m.campaign_dwl_townsfolk_warned() }
				]
			: []
	);
	const rows = $derived<Stat[][]>([broodRow, townsfolkRow].filter((r) => r.length));
</script>

<ScenarioInfo
	scenarioId="undimensioned_and_unseen"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_broods_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
