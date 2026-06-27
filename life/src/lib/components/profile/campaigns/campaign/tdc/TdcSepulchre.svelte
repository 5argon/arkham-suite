<!--
@component
TDC bespoke widget — "Sepulchre of the Sleeper". A west-only, skippable scenario that is the
campaign's BETTER-ending gate: collect every glyph + every artifact + unseal the inner sanctum
and you can confront the nightmare directly (`halted_cthulhus_awakening`) rather than waiting
for Cthulhu to reach Arkham; skip it and the nightmare goes unconfronted. StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdc: CampaignTdc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const s = $derived(tdc?.sepulchre ?? null);
	const hasData = $derived(!!s && s.halted + s.didNotConfront > 0);
	const rows = $derived<Stat[][]>(
		hasData && s
			? [
					[
						{ value: s.halted, label: m.campaign_tdc_sepulchre_halted() },
						{ value: s.didNotConfront, label: m.campaign_tdc_sepulchre_skipped() }
					]
				]
			: []
	);
</script>

<ScenarioInfo
	scenarioId="sepulchre_of_the_sleeper"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
	showPlays
>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
			<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_sepulchre_note()}</p>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdc_sepulchre_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
