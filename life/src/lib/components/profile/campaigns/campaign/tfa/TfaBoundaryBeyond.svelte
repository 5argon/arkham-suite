<!--
@component
TFA bespoke widget — "The Boundary Beyond". How many paths you'd charted (knowing all
6 skips Heart of the Elders, Part 1 — the scenario_5_what achievement) and whether
Ichtaca has confidence in you. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tfa,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tfa: CampaignTfa | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const b = $derived(tfa?.boundaryBeyond);
	const hasData = $derived(!!b && (b.pathsKnownMax !== null || b.ichtacaConfidence > 0));
	const rows = $derived<Stat[][]>(
		hasData && b
			? [
					[
						{ value: b.pathsKnownMax, label: m.campaign_tfa_boundary_paths() },
						{ value: b.part1Skipped, label: m.campaign_tfa_boundary_skip() }
					],
					b.ichtacaConfidence > 0
						? [{ value: b.ichtacaConfidence, label: m.campaign_tfa_boundary_confidence() }]
						: []
				].filter((r) => r.length)
			: []
	);
</script>

<ScenarioInfo scenarioId="the_boundary_beyond" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_boundary_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
