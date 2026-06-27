<!--
@component
FHV bespoke widget — a generic per-scenario fork view (reused via `scenario`). Lists that
scenario's fork outcomes lit/greyed. Half-width. (Also folded into the Schedule widget so a
user can disable these and keep just the Schedule.)
-->
<script lang="ts">
	import { FHV_SCENARIOS, fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		scenario,
		fhv,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		scenario: string;
		fhv: CampaignFhv | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const def = $derived(FHV_SCENARIOS.find((s) => s.id === scenario) ?? null);
	const tally = $derived(fhv?.scenarios[scenario] ?? {});
	const hasData = $derived(!!def && def.notes.some((n) => (tally[n] ?? 0) > 0));
</script>

<ScenarioInfo scenarioId={scenario} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if def && hasData}
			<div class="space-y-1">
				{#each def.notes as note (note)}
					{@const hit = (tally[note] ?? 0) > 0}
					<div class="flex items-start gap-1.5 text-sm {hit ? 'text-black dark:text-white' : 'text-primary-400'}">
						<span class="mt-px shrink-0">{hit ? '●' : '○'}</span>
						<span>{fhvText(`campaign_notes.${note}`)}</span>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
