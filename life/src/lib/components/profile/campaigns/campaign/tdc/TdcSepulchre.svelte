<!--
@component
TDC bespoke widget — "Sepulchre of the Sleeper". A west-only, skippable scenario that is the
campaign's BETTER-ending gate: with every glyph + every artifact + the inner sanctum unsealed you can
confront the nightmare directly (`halted_cthulhus_awakening`) rather than waiting for Cthulhu to reach
Arkham. Shows the three gate requirements (plays that met each) and the halted/skipped outcome, on top
of the passport's resolutions + the `skip_to_the_end` achievement. Half-width.
-->
<script lang="ts">
	import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const innerSanctum = $derived(
		tdc?.scenarios['the_grand_vault']?.['campaign_notes.the_inner_sanctum_was_unsealed'] ?? 0
	);
	const gateTotal = $derived(
		(tdc?.glyphs.allTwentySix ?? 0) + (tdc?.artifacts.allSix ?? 0) + innerSanctum
	);
	const outcomeTotal = $derived(s ? s.halted + s.didNotConfront : 0);
	const hasData = $derived(!!s && gateTotal + outcomeTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && tdc && s
			? [
					...(gateTotal > 0
						? [
								{
									heading: m.campaign_tdc_sepulchre_gate_heading(),
									stats: [
										{ value: tdc.glyphs.allTwentySix, label: m.campaign_tdc_sepulchre_gate_glyphs() },
										{ value: tdc.artifacts.allSix, label: m.campaign_tdc_sepulchre_gate_artifacts() },
										{ value: innerSanctum, label: m.campaign_tdc_sepulchre_gate_sanctum() }
									]
								}
							]
						: []),
					...(outcomeTotal > 0
						? [
								{
									heading: m.campaign_tdc_sepulchre_outcome_heading(),
									stats: [
										{ value: s.halted, label: m.campaign_tdc_sepulchre_halted() },
										{ value: s.didNotConfront, label: m.campaign_tdc_sepulchre_skipped() }
									]
								}
							]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="sepulchre_of_the_sleeper" {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
			<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_sepulchre_note()}</p>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdc_sepulchre_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
