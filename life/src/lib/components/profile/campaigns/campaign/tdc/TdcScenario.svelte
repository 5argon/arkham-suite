<!--
@component
TDC bespoke widget — a generic per-expedition-scenario passport (reused via `scenario`). Renders
that dive site's fork outcomes lit/greyed (Ruby's bet, the pilgrim, the artifact-vs-power choice,
the pilgrims' fate, the inner sanctum, …) plus how many of the site's alien glyphs were decrypted
there. Half-width. The scenario NAME + encounter icon live on the widget's title tab.
-->
<script lang="ts">
	import {
		TDC_GLYPHS_BY_SCENARIO,
		TDC_SCENARIOS,
		tdcText,
		type CampaignTdc
	} from '$lib/campaign/campaigns/tdc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import OutcomeList from '$lib/components/profile/_primitives/OutcomeList.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		scenario,
		tdc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		scenario: string;
		tdc: CampaignTdc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const def = $derived(TDC_SCENARIOS.find((s) => s.id === scenario) ?? null);
	const tally = $derived(tdc?.scenarios[scenario] ?? {});
	const glyphIds = $derived(TDC_GLYPHS_BY_SCENARIO.find((g) => g.scenario === scenario)?.ids ?? []);
	const glyphDone = $derived(glyphIds.filter((id) => (tdc?.glyphs.collected[id] ?? 0) > 0).length);
	const hasNotes = $derived(!!def && def.notes.some((n) => (tally[n] ?? 0) > 0));
	const hasGlyphs = $derived(glyphIds.length > 0 && glyphDone > 0);
</script>

<ScenarioInfo scenarioId={scenario} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if def && (hasNotes || hasGlyphs)}
			<div class="space-y-2">
				{#if hasNotes}
					<OutcomeList
						items={def.notes.map((note) => ({ label: tdcText(note), hit: (tally[note] ?? 0) > 0 }))}
					/>
				{/if}
				{#if glyphIds.length}
					<div>
						<SectionLabel>{m.campaign_tdc_scenario_glyphs_label()}</SectionLabel>
						<span class="text-sm tabular-nums text-black dark:text-white"
							>{glyphDone}<span class="text-primary-400">&nbsp;/ {glyphIds.length}</span></span
						>
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdc_scenario_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
