<!--
@component
NotZ bespoke widget — "The Midnight Masks". The campaign's star scenario, often run standalone as a
deck-testing training ground scored by cultists caught. The six unique Cultists as a lit card roster
(each lit by times interrogated, got-away count in its tooltip), a best-single-play haul highscore
(per difficulty), plus lifetime interrogated / escaped totals and the past-midnight time-pressure.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { type CampaignNotz, NOTZ_CULTISTS } from '$lib/campaign/campaigns/notz';
	import { getAllCards } from '$lib/card-data';
	import { difficultyLabel, orderedDifficulties } from '$lib/campaign/utils/difficulty';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		notz,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		notz: CampaignNotz | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const mm = $derived(notz?.midnightMasks ?? null);
	// Resolve just the six cultist names, not a map over the whole ~6k-card database.
	const CULTIST_CODES = new Set<string>(NOTZ_CULTISTS);
	const nameByCode = new Map(
		getAllCards()
			.filter((c) => CULTIST_CODES.has(c.code))
			.map((c) => [c.code, c.name])
	);

	const roster = $derived<LitTile[]>(
		mm
			? NOTZ_CULTISTS.map((code) => {
					const pc = mm.perCultist[code];
					const caught = pc?.caught.total ?? 0;
					const escaped = pc?.escaped.total ?? 0;
					return {
						id: code,
						image: getCardImagePath(code, 'square'),
						label: nameByCode.get(code) ?? code,
						count: caught,
						detail: m.campaign_notz_cultist_detail({ caught: String(caught), escaped: String(escaped) })
					};
				})
			: []
	);
	const hasRoster = $derived(mm != null && mm.totalInterrogated + mm.totalEscaped > 0);
	const bestTiers = $derived(
		mm ? orderedDifficulties(mm.bestHaul.byTier).filter((t) => (mm.bestHaul.byTier[t] ?? 0) > 0) : []
	);
	const statRows = $derived<StatGroup[]>(
		mm
			? [
					...(mm.bestHaul.total > 0
						? [
								{
									heading: m.campaign_notz_best_haul_heading(),
									stats: bestTiers.map((t) => ({ value: mm.bestHaul.byTier[t], label: difficultyLabel(t) }))
								}
							]
						: []),
					...(mm.totalInterrogated + mm.totalEscaped + mm.pastMidnight.total > 0
						? [
								{
									stats: [
										{ value: mm.totalInterrogated, label: m.campaign_notz_total_interrogated() },
										{ value: mm.pastMidnight.total, label: m.campaign_notz_past_midnight(), byTier: mm.pastMidnight.byTier },
										{ value: mm.totalEscaped, label: m.campaign_notz_total_escaped() }
									]
								}
							]
						: [])
				]
			: []
	);
	const hasData = $derived(hasRoster || (mm != null && mm.pastMidnight.total > 0));
</script>

<ScenarioInfo scenarioId="the_midnight_masks" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasRoster}
					<div>
						<SectionLabel variant="heading" align="center">{m.campaign_notz_cultists_heading()}</SectionLabel>
						<LitTileGrid rows={[roster]} />
					</div>
				{/if}
				<StatNumbers rows={statRows} />
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_notz_masks_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
