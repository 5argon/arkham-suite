<!--
@component
DWL bespoke widget — "Lost in Time and Space". The finale's recorded endings: closed
the tear (the standard win) / Yog-Sothoth fled (the superior win — you defeated it) /
Yog-Sothoth became one with reality (the loss). Plus the silent "won, lost forever"
(Act 4) ending, which writes no log — it's recovered from the Extra `final_act` choice,
so that one count hides under Log-only mode. Lifetime counts. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	// `logOnly` (global or per-campaign): drop the Extra-derived "won, lost forever" count.
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
	const f = $derived(dwl?.finale);
	const hasData = $derived(
		!!f && (f.closedTear > 0 || f.yogFled > 0 || f.yogBecameOne > 0 || (!logOnly && f.wonLostForever > 0))
	);
	const rows = $derived<Stat[][]>(
		hasData && f
			? [
					[
						{ value: f.closedTear, label: m.campaign_dwl_finale_closed() },
						{ value: f.yogFled, label: m.campaign_dwl_finale_fled() },
						{ value: f.yogBecameOne, label: m.campaign_dwl_finale_became_one() }
					],
					...(!logOnly
						? [[{ value: f.wonLostForever, label: m.campaign_dwl_finale_lost_forever() }]]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo
	scenarioId="lost_in_time_and_space"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_finale_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
