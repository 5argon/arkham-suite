<!--
@component
FHV bespoke widget — "The Thing in the Depths". The sinking Eastwick Bog: whether you defeated
the apex predator, the fate of the Chelydran Hybrid (spared / harvested / devoured before your
eyes), and Judith's grudge. Grouped so the boss and the turtle read apart. Header art pictures
Judith. Built on FhvScenarioInfo + OutcomeList.
-->
<script lang="ts">
	import { fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import FhvScenarioInfo from './FhvScenarioInfo.svelte';
	import OutcomeList, { type OutcomeItem } from '$lib/components/profile/_primitives/OutcomeList.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
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

	const sc = $derived(fhv?.scenarios['the_thing_in_the_depths'] ?? {});
	const item = (key: string): OutcomeItem => ({ label: fhvText(key), hit: (sc[key] ?? 0) > 0, count: sc[key] ?? 0 });

	// The boss + Judith's grudge (top), then the Chelydran Hybrid's mutually-exclusive fate.
	const topItems = $derived<OutcomeItem[]>([item('campaign_notes.thing_in_the_depths_was_defeated'), item('judith.judith_shared_a_grudge')]);
	const hybridItems = $derived<OutcomeItem[]>([
		item('campaign_notes.chelydran_hybrid_lived'),
		item('campaign_notes.chelydran_hybrid_perished'),
		item('campaign_notes.chelydran_hybrid_devoured')
	]);
	const hasData = $derived([...topItems, ...hybridItems].some((i) => i.hit));
</script>

<FhvScenarioInfo scenarioId="the_thing_in_the_depths" villagers={['judith']} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<div class="space-y-3">
				<OutcomeList items={topItems} />
				<div>
					<SectionLabel>{m.campaign_fhv_thing_hybrid_heading()}</SectionLabel>
					<OutcomeList items={hybridItems} />
				</div>
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
