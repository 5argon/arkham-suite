<!--
@component
PtC bespoke widget — "Dim Carcosa", the finale. The recorded endings (prevented
Hastur's escape / possessed — the dark win / Hastur has you) plus the Three Hasturs:
which version of Hastur you faced and beat (the log never records which, so it rides
the Extra-tab `hastur_version` choice). Endings on top, the version table below.
-->
<script lang="ts">
	import { scenarioMeta, scenarioVerdicts } from '$lib/campaign/utils/scenario-meta';
	import { reachableResolutions, type CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { scenarioVersions, toVersionRow, type VersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';

	let {
		ptc,
		scenarios = null,
		family = null,
		achievements = [],
		logOnly = false
	}: {
		ptc: CampaignPtc | null;
		scenarios?: CampaignScenarios | null;
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
	const meta = $derived(scenarioMeta(family ?? 'ptc', SID));
	// Keep no_resolution so the table shows a "None" column (it's a real ending here).
	const resolutionIds = $derived(meta?.resolutions ?? []);
	const verdicts = $derived(
		scenarioVerdicts(meta)
	);
	const versions = $derived(scenarioVersions(scenarios, SID));
	// Each Hastur version reaches only its own win (v. I → R1, v. II → R2, v. III → R3) plus the shared
	// losses — so filter the resolution columns per version (reached ones always kept lit).
	const versionRows = $derived(
		versions.stats.map((vs) =>
			toVersionRow(vs, {
				label: m.campaign_ptc_hasturs_version_label({ version: vs.value }),
				resolutionIds: reachableResolutions(SID, vs.value, resolutionIds, new Set(Object.keys(vs.tallies))),
				verdicts
			})
		)
	);

	// ── Who ended possessed (subject-scoped, newest first), as a dated card list ──
	const possessed = $derived(
		(d?.possessedInvestigators ?? []).map((p) => ({ code: p.code, date: p.finishDate }))
	);

	// ── Chasing the Stranger marks at arrival → the doom set on agenda 1a (precomputed tiers), as a
	//    per-tier breakdown with Succeed / Failed and the resolutions reached ──
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
		endingRows.length > 0 || versions.hasPlays || possessed.length > 0 || hasDoom
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
			{#if versions.stats.length}
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
					<SectionLabel variant="heading">{m.campaign_ptc_dim_possessed_heading()}</SectionLabel>
					<PtcCardCountList items={possessed} showDate />
				</div>
			{/if}
		{:else}
			<WidgetEmpty>{m.campaign_ptc_dim_empty()}</WidgetEmpty>
		{/if}
	{/snippet}
</ScenarioInfo>
