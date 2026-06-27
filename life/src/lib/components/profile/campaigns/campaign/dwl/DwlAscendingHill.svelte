<!--
@component
DWL bespoke widget — "Where Doom Awaits". The per-version breakdown of Act 2 (Ascending the
Hill) — DERIVED from your Silas Bishop / Necronomicon state (v.I restored Silas; v.II without
the Necronomicon; else v.III) — with Succeed / Failed / Resolutions / XP per version (the shared
VersionBreakdown). The version is log-known, so it survives log-only mode (degrading to Version +
Plays). Below it, the scenario outcome from the log: entered the gate vs Yog-Sothoth escaped.
-->
<script lang="ts">
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { toVersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		dwl,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		dwl: CampaignDwl | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	// Per-version breakdown (Ascending the Hill v.I/II/III) from the unified scenarios record. The
	// version is derived from log notes (Silas / Necronomicon), so it survives log-only mode.
	const SID = 'where_doom_awaits';
	const meta = scenarioMeta('dwl', SID);
	const resolutionIds = (meta?.resolutions ?? []).filter((r) => r !== 'no_resolution');
	const verdicts = (meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>;
	const labels: Record<string, string> = {
		v1: m.campaign_dwl_hill_v1(),
		v2: m.campaign_dwl_hill_v2(),
		v3: m.campaign_dwl_hill_v3()
	};
	const versionStats = $derived(scenarios?.scenarios.find((s) => s.scenario === SID)?.versions ?? []);
	const versionRows = $derived(
		versionStats.map((vs) =>
			toVersionRow(vs, { label: labels[vs.value] ?? vs.value, resolutionIds, verdicts })
		)
	);
	const hasVersions = $derived(versionStats.some((v) => v.plays > 0));

	// Scenario outcome (from the log): entered the gate vs Yog-Sothoth escaped.
	const w = $derived(dwl?.wda);
	const hasWda = $derived(!!w && (w.enteredGate > 0 || w.yogEscaped > 0));
	const wdaRows = $derived<Stat[][]>(
		hasWda && w
			? [
					[
						{ value: w.enteredGate, label: m.campaign_dwl_wda_entered() },
						{ value: w.yogEscaped, label: m.campaign_dwl_wda_escaped() }
					]
				]
			: []
	);
	const hasData = $derived(hasVersions || hasWda);
</script>

<ScenarioInfo scenarioId="where_doom_awaits" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if versionStats.length}
					<VersionBreakdown rows={versionRows} showSucceedFailed showXp {logOnly} versionFromLog />
				{/if}
				{#if hasWda}
					<StatNumbers rows={wdaRows} />
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_hill_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
