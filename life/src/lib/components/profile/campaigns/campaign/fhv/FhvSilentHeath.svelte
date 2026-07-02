<!--
@component
FHV bespoke widget — "The Silent Heath". The crystallized Pearl Ridge ruins: how many of the
Pearl family's Crystal Remains you recovered (laid to rest / partially recovered), whether
Madame Pearl's diary surfaced, and Leah's search of the ruins. Built on FhvScenarioInfo +
OutcomeList.
-->
<script lang="ts">
	import { fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import FhvScenarioInfo from './FhvScenarioInfo.svelte';
	import OutcomeList, { type OutcomeItem } from '$lib/components/profile/_primitives/OutcomeList.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		fhv,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		fhv: CampaignFhv | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const KEYS = [
		'campaign_notes.laid_the_pearl_family_to_rest',
		'campaign_notes.remains_were_partially_recovered',
		'campaign_notes.madame_pearls_diary_was_recovered',
		'leah.searched_the_pearl_ruins'
	];
	const sc = $derived(fhv?.scenarios['the_silent_heath'] ?? {});
	const items = $derived<OutcomeItem[]>(
		KEYS.map((key) => ({ label: fhvText(key), hit: (sc[key] ?? 0) > 0, count: sc[key] ?? 0 }))
	);
	const hasData = $derived(items.some((i) => i.hit));
</script>

<FhvScenarioInfo scenarioId="the_silent_heath" villagers={['leah']} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<OutcomeList {items} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
