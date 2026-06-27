<!--
@component
TCU bespoke widget — "For the Greater Good". Opened the puzzle box, and whether the
Guardian of the Trap emerged vs was defeated. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const g = $derived(tcu?.forTheGreaterGood);
	const hasData = $derived(!!g && g.openedPuzzleBox + g.guardianEmerged + g.guardianDefeated > 0);
	const rows = $derived<Stat[][]>(
		hasData && g
			? [
					[
						{ value: g.openedPuzzleBox, label: m.campaign_tcu_greater_box() },
						{ value: g.guardianEmerged, label: m.campaign_tcu_greater_emerged() },
						{ value: g.guardianDefeated, label: m.campaign_tcu_greater_defeated() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="for_the_greater_good" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_greater_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
