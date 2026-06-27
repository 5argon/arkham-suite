<!--
@component
TCU bespoke widget — "Before the Black Throne", the finale. Azathoth devoured the
universe (loss) vs slumbers, with the slumber variants (joined the Pipers / signed the
Black Book / clean — R3 base & R6 rttcu can't be told apart from the log). The early
Lodge/Coven faction victories live in the Union and Disillusion widget. Built on StatNumbers.
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
	const e = $derived(tcu?.endings);
	const hasData = $derived(
		!!e && e.azathothDevoured + e.slumbersJoinedPipers + e.slumbersBlackBook + e.slumbersClean > 0
	);
	const rows = $derived<Stat[][]>(
		hasData && e
			? [
					[
						{ value: e.slumbersClean, label: m.campaign_tcu_end_clean() },
						{ value: e.slumbersJoinedPipers, label: m.campaign_tcu_end_pipers() },
						{ value: e.slumbersBlackBook, label: m.campaign_tcu_end_black_book() },
						{ value: e.azathothDevoured, label: m.campaign_tcu_end_devoured() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="before_the_black_throne" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_end_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
