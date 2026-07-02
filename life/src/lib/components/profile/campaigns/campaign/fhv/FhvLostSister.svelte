<!--
@component
FHV bespoke widget — "The Lost Sister". The Akwan caves and the Peters family: whether the
family was reunited or only Elizabeth was saved, Theo's reconciliation with Helen, and Gideon
finding his treasure. Header art pictures Theo. Built on FhvScenarioInfo + OutcomeList.
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
		'campaign_notes.the_peters_family_was_reunited',
		'campaign_notes.elizabeth_peters_was_saved',
		'theo.theo_reconciled_with_helen',
		'gideon.gideon_found_his_treasure'
	];
	const sc = $derived(fhv?.scenarios['the_lost_sister'] ?? {});
	const items = $derived<OutcomeItem[]>(
		KEYS.map((key) => ({ label: fhvText(key), hit: (sc[key] ?? 0) > 0, count: sc[key] ?? 0 }))
	);
	const hasData = $derived(items.some((i) => i.hit));
</script>

<FhvScenarioInfo scenarioId="the_lost_sister" villagers={['theo', 'gideon']} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<OutcomeList {items} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
