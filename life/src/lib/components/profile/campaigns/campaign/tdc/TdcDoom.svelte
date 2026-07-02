<!--
@component
TDC bespoke widget — "The Doom of Arkham" (the finale passport). How you faced Cthulhu in Part II —
the last stand (`stood_together`) vs the ritual with 5+ artifacts (`your_allies_have_a_plan`) — the
four endings (drove him off / banished / banished-but-Arkham-destroyed / annihilated), and which
Arkham neighborhoods flooded. The secret better ending (halting his awakening at the Sepulchre) is
tracked by the Sepulchre widget. Full width. Built on ScenarioInfo + StatNumbers + LitTileGrid.
-->
<script lang="ts">
	import { TDC_FLOODED, tdcText, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdc: CampaignTdc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const d = $derived(tdc?.doom ?? null);
	const approachTotal = $derived(d ? d.stoodTogether + d.alliesPlan : 0);
	const endingTotal = $derived(
		d ? d.drivenAway + d.banished + d.banishedButDestroyed + d.annihilated : 0
	);
	const rows = $derived<StatGroup[]>(
		d
			? [
					...(approachTotal > 0
						? [
								{
									heading: m.campaign_tdc_doom_approach_heading(),
									stats: [
										{ value: d.stoodTogether, label: tdcText('campaign_notes.stood_together') },
										{ value: d.alliesPlan, label: tdcText('campaign_notes.your_allies_have_a_plan') }
									]
								}
							]
						: []),
					...(endingTotal > 0
						? [
								{
									heading: m.campaign_tdc_doom_endings_heading(),
									stats: [
										{ value: d.drivenAway, label: tdcText('campaign_notes.cthulhu_was_driven_away') },
										{ value: d.banished, label: tdcText('campaign_notes.cthulhu_was_banished') },
										{ value: d.banishedButDestroyed, label: tdcText('campaign_notes.cthulhu_was_banished_but_arkham_was_destroyed') },
										{ value: d.annihilated, label: tdcText('campaign_notes.cthulhu_annihilated_the_city_of_arkham') }
									]
								}
							]
						: [])
				]
			: []
	);

	const floodTiles = $derived<LitTile[]>(
		d
			? TDC_FLOODED.map((id): LitTile => {
					const c = d.flooded[id] ?? 0;
					return {
						id,
						image: '',
						label: tdcText(`flooded_neighborhoods.${id}`),
						count: c,
						detail: c > 0 ? m.campaign_tdc_doom_flooded_count({ times: times(c) }) : m.campaign_tdc_doom_flooded_dry()
					};
				})
			: []
	);
	const anyFlooded = $derived(floodTiles.some((t) => t.count > 0));
	const hasData = $derived(!!d && approachTotal + endingTotal > 0);
</script>

<ScenarioInfo scenarioId="the_doom_of_arkham" {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdc_doom_empty()}</p>
		{/if}
	{/snippet}
	{#snippet children()}
		{#if anyFlooded}
			<div>
				<SectionLabel variant="heading" align="center">{m.campaign_tdc_doom_flooded_heading()}</SectionLabel>
				<LitTileGrid tiles={floodTiles} colsClass="grid-cols-4 @3xl:grid-cols-7" />
			</div>
		{/if}
		{#if hasData}
			<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_doom_note()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
