<!--
@component
PtC bespoke widget — "The Unspeakable Oath". How you left the asylum (escaped cleanly, escaped under
attack, or the King claimed the whole party). Interlude II (Lost Soul, Daniel's fate) is its own widget.
Plus the scenario's two Act 2 versions ("The Really Bad Ones" v. I / v. II): v. I when you took the
onyx clasp back in Echoes, else v. II — precomputed (`unspeakableOath.versions`) and shown as an
always-two-rows matrix. Below, the asylum's toll: the investigators who went insane (Extra picker,
scoped to the viewed player's own investigator). The returning VIP (Constance Dumaine) rides in the
shared PtC passport header.
-->
<script lang="ts">
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { toVersionRow } from '$lib/campaign/stats/version-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
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
	const o = $derived(ptc?.unspeakableOath);
	const hasOath = $derived(!!o && (o.escaped > 0 || o.attacked > 0 || o.partyClaimed > 0));
	// Per-version breakdown (Really Bad Ones v. I / v. II) from the unified scenarios record.
	const SID = 'the_unspeakable_oath';
	const meta = scenarioMeta('ptc', SID);
	// Keep no_resolution so the table shows a "None" column (it's a real ending here).
	const resolutionIds = meta?.resolutions ?? [];
	const verdicts = (meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>;
	const labels: Record<string, string> = {
		I: m.campaign_ptc_oath_version_1(),
		II: m.campaign_ptc_oath_version_2()
	};
	const accents: Record<string, string> = {
		I: 'text-amber-600 dark:text-amber-400',
		II: 'text-violet-600 dark:text-violet-400'
	};
	const versionStats = $derived(scenarios?.scenarios.find((s) => s.scenario === SID)?.versions ?? []);
	const versionRows = $derived(
		versionStats.map((vs) =>
			toVersionRow(vs, { label: labels[vs.value] ?? vs.value, accent: accents[vs.value], resolutionIds, verdicts })
		)
	);
	const hasVersions = $derived(versionStats.some((v) => v.plays > 0));

	// Who went insane — already subject-scoped, newest-first, capped in the payload; each carries its
	// play's finish date, shown as a dated card list like the random-weakness lists.
	const insane = $derived(
		(o?.insaneInvestigators ?? []).map((x) => ({ code: x.code, date: x.finishDate }))
	);
	const hasData = $derived(hasOath || hasVersions || insane.length > 0);
	const rows = $derived<Stat[][]>(
		o
			? [
					[
						{ value: o.escaped, label: m.campaign_ptc_oath_escaped() },
						{ value: o.attacked, label: m.campaign_ptc_oath_attacked() },
						{ value: o.partyClaimed, label: m.campaign_ptc_oath_party_claimed() }
					]
				]
			: []
	);
</script>

<PtcScenarioInfo
	scenarioId="the_unspeakable_oath"
	{ptc}
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasOath}
					<StatNumbers {rows} />
				{/if}
				{#if versionStats.length}
					<VersionBreakdown
						title={m.campaign_ptc_oath_versions_title()}
						rows={versionRows}
						showSucceedFailed
						showXp
						{logOnly}
					/>
				{/if}
				{#if insane.length}
					<div>
						<div
							class="text-primary-600 dark:text-primary-300 mb-2 text-center text-sm font-semibold"
						>
							{m.campaign_ptc_oath_insane_heading()}
						</div>
						<PtcCardCountList items={insane} showDate />
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_oath_empty()}</p>
		{/if}
	{/snippet}
</PtcScenarioInfo>
