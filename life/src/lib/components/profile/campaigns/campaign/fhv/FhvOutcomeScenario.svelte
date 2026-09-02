<!--
@component
An FHV scenario passport with its logged outcomes as ●/○ lists — the `campaign_notes` and villager
milestones the `fhv` aggregate counted for the scenario, grouped as declared in
`fhv-outcome-scenarios.ts`. Serves every FHV scenario without bespoke content.
-->
<script lang="ts">
	import { fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import OutcomeList, { type OutcomeItem } from '$lib/components/profile/_primitives/OutcomeList.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';
	import FhvScenarioInfo from './FhvScenarioInfo.svelte';
	import { FHV_OUTCOME_SCENARIOS } from './fhv-outcome-scenarios';
	import * as m from '$lib/paraglide/messages.js';

	let {
		scenarioId,
		fhv,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		scenarioId: string;
		fhv: CampaignFhv | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const def = $derived(FHV_OUTCOME_SCENARIOS[scenarioId]);
	const sc = $derived(fhv?.scenarios[scenarioId] ?? {});
	const item = (key: string): OutcomeItem => ({
		label: fhvText(key),
		hit: (sc[key] ?? 0) > 0,
		count: sc[key] ?? 0
	});
	const groups = $derived(
		def.groups.map((g, i) => ({
			id: i,
			heading: g.heading?.(),
			items: g.keys.map(item),
			shown: !g.onlyWhenHit || g.keys.some((key) => (sc[key] ?? 0) > 0)
		}))
	);
	const hasData = $derived(groups.some((g) => g.items.some((i) => i.hit)));
</script>

<FhvScenarioInfo
	{scenarioId}
	villagers={def.villagers}
	{family}
	{achievements}
	{scenarios}
	{logOnly}
	showPlays
>
	{#snippet children()}
		{#if hasData}
			<div class="space-y-3">
				{#each groups as g (g.id)}
					{#if g.shown}
						<div>
							{#if g.heading}<SectionLabel>{g.heading}</SectionLabel>{/if}
							<OutcomeList items={g.items} />
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<WidgetEmpty>{m.campaign_fhv_scenario_empty()}</WidgetEmpty>
		{/if}
	{/snippet}
</FhvScenarioInfo>
