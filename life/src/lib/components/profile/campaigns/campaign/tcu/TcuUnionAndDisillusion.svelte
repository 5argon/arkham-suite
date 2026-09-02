<!--
@component
TCU bespoke widget — "Union and Disillusion". The point of no return (sided with the Lodge vs the
coven), the ritual's aftermath (whose faction ascends to set up the finale — the Lodge's true work /
Sanford / Anette), and how the four missing persons stood when the veil parted. Below, the Cosmos
you played: the Beyond-the-Mist Act version (v. I–v. IV) is auto-chosen by your allegiance + deception
record, so the shared per-version breakdown shows which Rite each play walked. Built on StatNumbers +
VersionBreakdown, inside the scenario passport.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import { scenarioMeta, scenarioVerdicts } from '$lib/campaign/utils/scenario-meta';
	import { scenarioVersions, toVersionRow } from '$lib/campaign/stats/version-stats';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';

	let {
		tcu,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tcu: CampaignTcu | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const SID = 'union_and_disillusion';
	const u = $derived(tcu?.union);

	const rows = $derived<StatGroup[]>(
		u
			? [
					...(u.sidedLodge + u.sidedCoven > 0
						? [
								{
									heading: m.campaign_tcu_union_pnr_heading(),
									stats: [
										{ value: u.sidedLodge, label: m.campaign_tcu_union_sided_lodge() },
										{ value: u.sidedCoven, label: m.campaign_tcu_union_sided_coven() }
									]
								}
							]
						: []),
					...(u.lodgeTrueWork + u.sanfordPossesses + u.anettePossessed > 0
						? [
								{
									heading: m.campaign_tcu_union_aftermath_heading(),
									stats: [
										{ value: u.lodgeTrueWork, label: m.campaign_tcu_union_true_work() },
										{ value: u.sanfordPossesses, label: m.campaign_tcu_union_sanford() },
										{ value: u.anettePossessed, label: m.campaign_tcu_union_anette() }
									]
								}
							]
						: []),
					...(u.survivors.alive + u.survivors.dead > 0
						? [
								{
									heading: m.campaign_tcu_union_survivors_heading(),
									stats: [
										{ value: u.survivors.alive, label: m.campaign_tcu_union_alive() },
										{ value: u.survivors.dead, label: m.campaign_tcu_union_dead() }
									]
								}
							]
						: [])
				]
			: []
	);

	// The Beyond-the-Mist Cosmos version (derived axis in ScenarioStat.versions).
	const meta = $derived(scenarioMeta(family, SID));
	const resolutionIds = $derived(meta?.resolutions ?? []);
	const verdicts = $derived(scenarioVerdicts(meta));
	const COSMOS: Record<string, { label: () => string; accent: string }> = {
		I: { label: m.campaign_tcu_cosmos_v1, accent: 'text-sky-600 dark:text-sky-400' },
		II: { label: m.campaign_tcu_cosmos_v2, accent: 'text-emerald-600 dark:text-emerald-400' },
		III: { label: m.campaign_tcu_cosmos_v3, accent: 'text-emerald-600 dark:text-emerald-400' },
		IV: { label: m.campaign_tcu_cosmos_v4, accent: 'text-emerald-600 dark:text-emerald-400' }
	};
	const versions = $derived(scenarioVersions(scenarios, SID));
	const versionRows = $derived(
		versions.stats.map((vs) =>
			toVersionRow(vs, {
				label: COSMOS[vs.value]?.label() ?? vs.value,
				accent: COSMOS[vs.value]?.accent,
				resolutionIds,
				verdicts
			})
		)
	);
	const hasData = $derived(rows.length > 0 || versions.hasPlays);
</script>

<ScenarioInfo scenarioId={SID} {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			{#if rows.length}
				<StatNumbers {rows} />
			{/if}
			{#if versions.hasPlays}
				<div class:mt-4={rows.length}>
					<VersionBreakdown
						rows={versionRows}
						title={m.campaign_tcu_cosmos_heading()}
						showSucceedFailed
						{logOnly}
						versionFromLog
					/>
				</div>
			{/if}
		{:else}
			<WidgetEmpty>{m.campaign_tcu_union_empty()}</WidgetEmpty>
		{/if}
	{/snippet}
</ScenarioInfo>
