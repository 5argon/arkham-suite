<!--
@component
TCU bespoke widget — "Before the Black Throne", the finale, as a "how the world ended" tree. First
the ritual's outcome from Union and Disillusion (which threat rose: the Lodge's true work / Sanford /
Anette), then the finale itself: Azathoth slumbers clean, the lead investigator joined the Pipers,
the Black Book was signed, or Azathoth devoured the universe. Below, the Twist of Fate reckoning —
your campaign-long tally (`path winds before you`) that set the finale's starting doom, cross-cut
with how the finale then went (Succeed / Failed + the resolution reached). Built on StatNumbers +
VersionBreakdown, inside the scenario passport.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import type { VersionRow } from '$lib/campaign/stats/version-stats';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

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

	const SID = 'before_the_black_throne';
	const e = $derived(tcu?.endings);
	const u = $derived(tcu?.union);
	const hasRitual = $derived(!!u && u.lodgeTrueWork + u.sanfordPossesses + u.anettePossessed > 0);
	const hasFinale = $derived(
		!!e && e.slumbersClean + e.joinedPipers + e.signedBlackBook + e.azathothDevoured > 0
	);
	const rows = $derived<StatGroup[]>(
		[
			...(hasRitual && u
				? [
						{
							heading: m.campaign_tcu_end_ritual_heading(),
							stats: [
								{ value: u.lodgeTrueWork, label: m.campaign_tcu_union_true_work() },
								{ value: u.sanfordPossesses, label: m.campaign_tcu_union_sanford() },
								{ value: u.anettePossessed, label: m.campaign_tcu_union_anette() }
							]
						}
					]
				: []),
			...(hasFinale && e
				? [
						{
							heading: m.campaign_tcu_end_finale_heading(),
							stats: [
								{ value: e.slumbersClean, label: m.campaign_tcu_end_clean() },
								{ value: e.joinedPipers, label: m.campaign_tcu_end_pipers() },
								{ value: e.signedBlackBook, label: m.campaign_tcu_end_black_book() },
								{ value: e.azathothDevoured, label: m.campaign_tcu_end_devoured() }
							]
						}
					]
				: [])
		]
	);

	// Twist of Fate tally → how the finale went (the shared per-version breakdown, tally as the axis).
	const meta = $derived(scenarioMeta(family, SID));
	const resolutionIds = $derived(meta?.resolutions ?? []);
	const verdicts = $derived((meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>);
	const pathWindsRows = $derived<VersionRow[]>(
		Object.keys(tcu?.pathWinds ?? {})
			.sort((a, b) => Number(a) - Number(b))
			.map((tally) => {
				const v = tcu!.pathWinds[tally];
				return {
					id: tally,
					label: m.campaign_tcu_pathwinds_row({ tally }),
					succeed: v.succeed,
					failed: v.failed,
					resolutionIds,
					reached: new Set(Object.keys(v.tallies)),
					tallies: v.tallies,
					verdicts
				};
			})
	);
	const hasPathWinds = $derived(pathWindsRows.length > 0);
	const hasData = $derived(rows.length > 0 || hasPathWinds);
</script>

<ScenarioInfo scenarioId={SID} {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			{#if rows.length}
				<StatNumbers {rows} />
			{/if}
			{#if hasPathWinds}
				<div class:mt-4={rows.length}>
					<VersionBreakdown
						rows={pathWindsRows}
						title={m.campaign_tcu_pathwinds_heading()}
						versionLabel={m.campaign_tcu_pathwinds_col()}
						showSucceedFailed
						{logOnly}
						versionFromLog
					/>
				</div>
			{/if}
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_end_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
