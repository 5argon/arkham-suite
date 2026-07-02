<!--
@component
TIC bespoke widget — "The Pit of Despair" (the opener). The passport for the campaign's first
scenario: The Amalgam (the boss you claw free from — defeat it 5+ times for "Die Already!") as
header art, plus the four flashbacks first recovered here (the Memories spine begins in the Pit).
Built on ScenarioInfo + LitTileGrid.
-->
<script lang="ts">
	import { TIC_AMALGAM_CODE, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import { ticMemoryTiles } from './tic-memory-tiles';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import LitTileGrid from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tic,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tic: CampaignTic | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const memTiles = $derived(ticMemoryTiles(tic, 'the_pit_of_despair'));
	const hasMem = $derived(memTiles.some((t) => t.count > 0));
</script>

<ScenarioInfo scenarioId="the_pit_of_despair" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb
			code={TIC_AMALGAM_CODE}
			alt={m.campaign_tic_pit_amalgam()}
			title={m.campaign_tic_pit_amalgam()}
			tone="danger"
			objectTop
		/>
	{/snippet}
	{#snippet children()}
		{#if hasMem}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.campaign_tic_pit_memories_heading()}</SectionLabel
				>
				<LitTileGrid tiles={memTiles} colsClass="grid-cols-2 @3xl:grid-cols-4" />
			</div>
		{/if}
	{/snippet}
</ScenarioInfo>
