<!--
@component
FHV bespoke widget — "Written in Rock". The mine-cart dive under North Point Mine, and the
Atwood siblings' tragedy: whether Simeon rode out alive, Leah found something in the dark,
Simeon was lost, or the two were reunited in death. Header art pictures Simeon & Leah. Built
on FhvScenarioInfo + OutcomeList.
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

	// The Atwood siblings' fate (a single mutually-exclusive fork per play), best outcome first.
	const KEYS = [
		'simeon.simeon_survived',
		'leah.leah_and_simeon_were_reunited',
		'leah.leah_saw_something_in_the_mine',
		'simeon.simeon_disappeared',
		'campaign_notes.survived_the_horrors_in_the_rock'
	];
	const sc = $derived(fhv?.scenarios['written_in_rock'] ?? {});
	const items = $derived<OutcomeItem[]>(
		KEYS.map((key) => ({ label: fhvText(key), hit: (sc[key] ?? 0) > 0, count: sc[key] ?? 0 }))
	);
	const hasData = $derived(items.some((i) => i.hit));
</script>

<FhvScenarioInfo scenarioId="written_in_rock" villagers={['simeon', 'leah']} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<OutcomeList {items} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
