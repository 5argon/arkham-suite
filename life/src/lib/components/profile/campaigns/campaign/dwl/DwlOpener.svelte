<!--
@component
DWL bespoke widget — one of the two opening cases (Extracurricular Activity / The House Always Wins),
which Dunwich lets you play in EITHER order. The passport breaks the scenario down by the position it
was played in — first vs second — because the second opener is tackled by stronger, already-levelled
investigators: resolution coverage and the Victory-Point high score are tracked separately per
position (the shared VersionBreakdown, order axis derived from the play's route, so log-known).
-->
<script lang="ts">
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { toVersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		scenarioId,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		scenarioId: string;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	// Include `no_resolution` — a play that ended with no scored ending still lights its "None" chip.
	const resolutionIds = $derived(scenarioMeta(family, scenarioId)?.resolutions ?? []);
	const labels: Record<string, string> = {
		first: m.campaign_dwl_opener_first(),
		second: m.campaign_dwl_opener_second()
	};
	const versionStats = $derived(
		scenarios?.scenarios.find((s) => s.scenario === scenarioId)?.versions ?? []
	);
	const versionRows = $derived(
		versionStats.map((vs) => toVersionRow(vs, { label: labels[vs.value] ?? vs.value, resolutionIds }))
	);
	const hasVersions = $derived(versionStats.some((v) => v.plays > 0));
</script>

<ScenarioInfo
	{scenarioId}
	{family}
	{achievements}
	{scenarios}
	{logOnly}
	showPlays
	hideResolutions
	hideVp
>
	{#snippet stats()}
		{#if hasVersions}
			<VersionBreakdown rows={versionRows} showPlays showResolutions showXp {logOnly} versionFromLog />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_opener_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
