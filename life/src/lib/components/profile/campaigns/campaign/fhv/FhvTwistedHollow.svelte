<!--
@component
FHV bespoke widget — "The Twisted Hollow" (Night One). The rescue of Bertie Musgrave through
the darkening Western Woods: whether Bertie made it out, whether you told Mother Rachel the
truth or lied, who threw themselves at the Ursine Hybrid to save you (Judith / Theo / Mother
Rachel herself), and whether the Bear was wounded. Header art pictures Mother Rachel. Built on
FhvScenarioInfo + OutcomeList.
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

	const sc = $derived(fhv?.scenarios['the_twisted_hollow'] ?? {});
	const item = (key: string): OutcomeItem => ({ label: fhvText(key), hit: (sc[key] ?? 0) > 0, count: sc[key] ?? 0 });

	// Bertie's rescue + your word to Mother Rachel (top), then who saved you from the Bear.
	const topItems = $derived<OutcomeItem[]>([
		item('campaign_notes.bertie_was_rescued'),
		item('campaign_notes.bertie_was_lost_in_the_woods'),
		item('campaign_notes.mother_rachel_showed_the_way'),
		item('campaign_notes.lost_the_path'),
		item('campaign_notes.the_bear_was_wounded')
	]);
	const bearItems = $derived<OutcomeItem[]>([
		item('judith.judith_saved_your_ass'),
		item('theo.theo_distracted_the_bear'),
		item('rachel.mother_rachel_intervened')
	]);
	const hasData = $derived([...topItems, ...bearItems].some((i) => i.hit));
</script>

<FhvScenarioInfo scenarioId="the_twisted_hollow" villagers={['rachel']} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<div class="space-y-3">
				<OutcomeList items={topItems} />
				{#if bearItems.some((i) => i.hit)}
					<div>
						<SectionLabel>{m.campaign_fhv_hollow_bear_heading()}</SectionLabel>
						<OutcomeList items={bearItems} />
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
