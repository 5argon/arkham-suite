<!--
@component
PtC bespoke widget — "A Phantom of Truth". Which of the four mutually-exclusive Nigel outcomes you
reached, plus the scenario's two Act 1 versions: per the setup's check_doubt_and_conviction branch it
uses "The Parisian Conspiracy" v. I when you enter with Doubt ≥ Conviction (which also ends at R3), v.
II on a Conviction lean (which advances to act 2b → R1/R2). That isn't logged, but it's implied by the
Doubt/Conviction chain (the four log-derived pre-Phantom marks), so the version each play faced is
precomputed into the unified `scenarios` record and shown via the shared VersionBreakdown table — its
resolution columns filtered per version. The returning VIP (Jordan Perry) rides in the PtC passport header.
-->
<script lang="ts">
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import { reachableResolutions, type CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { toVersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		ptc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		ptc: CampaignPtc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const p = $derived(ptc?.phantom);
	const hasOutcomes = $derived(
		!!p && (p.foundNigel > 0 || p.foundNigelsHome > 0 || p.unableToFind > 0 || p.didNotEscapeGaze > 0)
	);
	const rows = $derived<Stat[][]>(
		hasOutcomes && p
			? [
					[
						{ value: p.foundNigel, label: m.campaign_ptc_phantom_found() },
						{ value: p.foundNigelsHome, label: m.campaign_ptc_phantom_found_home() }
					],
					[
						{ value: p.unableToFind, label: m.campaign_ptc_phantom_unable() },
						{ value: p.didNotEscapeGaze, label: m.campaign_ptc_phantom_gaze() }
					]
				]
			: []
	);

	// Per-version breakdown (v. I = Doubt/tie lean entering, v. II = Conviction lean — the meter on
	// entry, not the in-scenario vision mark) from the unified scenarios record. v. I ends at R3; v. II
	// advances to R1/R2 — so the resolution columns are filtered per version.
	const SID = 'a_phantom_of_truth';
	const meta = scenarioMeta('ptc', SID);
	// Keep no_resolution so the table shows a "None" column (it's a real ending here).
	const resolutionIds = meta?.resolutions ?? [];
	const verdicts = (meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>;
	const labels: Record<string, string> = {
		I: m.campaign_ptc_phantom_version_1(),
		II: m.campaign_ptc_phantom_version_2()
	};
	// v. I is the Doubt branch (violet), v. II the Conviction branch (amber) — matching the chain colours.
	const accents: Record<string, string> = {
		I: 'text-violet-600 dark:text-violet-400',
		II: 'text-amber-600 dark:text-amber-400'
	};
	const versionStats = $derived(scenarios?.scenarios.find((s) => s.scenario === SID)?.versions ?? []);
	const versionRows = $derived(
		versionStats.map((vs) =>
			toVersionRow(vs, {
				label: labels[vs.value] ?? vs.value,
				accent: accents[vs.value],
				resolutionIds: reachableResolutions(SID, vs.value, resolutionIds, new Set(Object.keys(vs.tallies))),
				verdicts
			})
		)
	);
	const hasVersions = $derived(versionStats.some((v) => v.plays > 0));
	const hasData = $derived(hasOutcomes || hasVersions);
</script>

<PtcScenarioInfo scenarioId="a_phantom_of_truth" {ptc} {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasOutcomes}
					<StatNumbers {rows} />
				{/if}
				{#if versionStats.length}
					<VersionBreakdown
						title={m.campaign_ptc_phantom_versions_title()}
						rows={versionRows}
						showSucceedFailed
						showXp
						{logOnly}
						versionFromLog
					/>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_phantom_empty()}</p>
		{/if}
	{/snippet}
</PtcScenarioInfo>
