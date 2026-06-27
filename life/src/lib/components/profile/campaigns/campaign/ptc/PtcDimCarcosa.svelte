<!--
@component
PtC bespoke widget — "Dim Carcosa", the finale. The recorded endings (prevented
Hastur's escape / possessed — the dark win / Hastur has you) plus the Three Hasturs:
which version of Hastur you faced and beat (the log never records which, so it rides
the Extra-tab `hastur_version` choice). Endings on top, the version table below.
-->
<script lang="ts">
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import { reachableResolutions, type CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { toVersionRow, type VersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		ptc,
		scenarios = null,
		code = 'ptc',
		family = null,
		achievements = [],
		logOnly = false
	}: {
		ptc: CampaignPtc | null;
		scenarios?: CampaignScenarios | null;
		code?: string;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		logOnly?: boolean;
	} = $props();

	// ── Endings (from the log) ──
	const d = $derived(ptc?.dimCarcosa);
	const endingRows = $derived<Stat[][]>(
		d && (d.preventedEscape > 0 || d.possessed > 0 || d.hasturHasYou > 0 || d.carcosaMerged > 0)
			? [
					[
						{ value: d.preventedEscape, label: m.campaign_ptc_dim_prevented() },
						{ value: d.possessed, label: m.campaign_ptc_dim_possessed() },
						{ value: d.hasturHasYou, label: m.campaign_ptc_dim_hastur_has_you() },
						{ value: d.carcosaMerged, label: m.campaign_ptc_dim_merged() }
					]
				]
			: []
	);

	// ── The Three Hasturs (version table from the unified scenarios record) ──
	const SID = 'dim_carcosa';
	const meta = $derived(scenarioMeta(code, SID));
	// Keep no_resolution so the table shows a "None" column (it's a real ending here).
	const resolutionIds = $derived(meta?.resolutions ?? []);
	const verdicts = $derived(
		(meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>
	);
	const versionStats = $derived(scenarios?.scenarios.find((s) => s.scenario === SID)?.versions ?? []);
	// Each Hastur version reaches only its own win (v. I → R1, v. II → R2, v. III → R3) plus the shared
	// losses — so filter the resolution columns per version (reached ones always kept lit).
	const versionRows = $derived(
		versionStats.map((vs) =>
			toVersionRow(vs, {
				label: m.campaign_ptc_hasturs_version_label({ version: vs.value }),
				resolutionIds: reachableResolutions(SID, vs.value, resolutionIds, new Set(Object.keys(vs.tallies))),
				verdicts
			})
		)
	);
	const hasVersions = $derived(versionStats.some((v) => v.plays > 0));

	// ── Who ended possessed — the repeatable `possessed` campaign-note picks (log-derived, scoped to the
	//    viewed player's own investigators, newest first), shown as a dated card list like the weaknesses. ──
	const possessed = $derived(
		(d?.possessedInvestigators ?? []).map((p) => ({ code: p.code, date: p.finishDate }))
	);

	// ── Chasing the Stranger AT ARRIVAL → the doom it set on agenda 1a (precomputed tiers: ≤2 → 3,
	//    3-5 → 2, 6-8 → 1, ≥9 → 0; the final tally minus the marks earned within Dim Carcosa). Rendered
	//    through the shared per-version breakdown — doom tier as the axis, each tier carrying its
	//    Succeed / Failed + the resolutions reached there (the same resolution columns as the version
	//    table). The row label folds the doom into the marks-at-arrival column ("≤ 2 (+3 doom)"). ──
	const DOOM_TIERS = [
		{ doom: '3', label: m.campaign_ptc_dim_doom_row3 },
		{ doom: '2', label: m.campaign_ptc_dim_doom_row2 },
		{ doom: '1', label: m.campaign_ptc_dim_doom_row1 },
		{ doom: '0', label: m.campaign_ptc_dim_doom_row0 }
	];
	const doomRows = $derived<VersionRow[]>(
		DOOM_TIERS.map((t) => {
			const v = d?.strangerArrivalDoom?.[t.doom];
			return {
				id: t.doom,
				label: t.label(),
				succeed: v?.succeed ?? null,
				failed: v?.failed ?? null,
				resolutionIds,
				reached: new Set(Object.keys(v?.tallies ?? {})),
				tallies: v?.tallies ?? {},
				verdicts
			};
		})
	);
	const hasDoom = $derived(['3', '2', '1', '0'].some((k) => !!d?.strangerArrivalDoom?.[k]));

	const hasData = $derived(
		endingRows.length > 0 || hasVersions || possessed.length > 0 || hasDoom
	);
</script>

<ScenarioInfo
	scenarioId="dim_carcosa"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			{#if endingRows.length}
				<StatNumbers rows={endingRows} />
			{/if}
			{#if versionStats.length}
				<div class:mt-4={endingRows.length}>
					<VersionBreakdown rows={versionRows} showSucceedFailed showXp {logOnly} />
				</div>
			{/if}
			{#if hasDoom}
				<div class="mt-4">
					<VersionBreakdown
						rows={doomRows}
						title={m.campaign_ptc_dim_stranger_arrival_heading()}
						versionLabel={m.campaign_ptc_dim_doom_col_marks()}
						showSucceedFailed
						{logOnly}
					/>
				</div>
			{/if}
			{#if possessed.length}
				<div class="mt-4">
					<div class="text-primary-600 dark:text-primary-300 mb-2 text-sm font-semibold">
						{m.campaign_ptc_dim_possessed_heading()}
					</div>
					<PtcCardCountList items={possessed} showDate />
				</div>
			{/if}
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_dim_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
