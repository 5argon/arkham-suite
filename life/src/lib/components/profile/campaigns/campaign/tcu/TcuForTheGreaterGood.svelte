<!--
@component
TCU bespoke widget — "For the Greater Good". How the Lodge's puzzle box went (opened it / the
Guardian of the Trap emerged / the Guardian was defeated), plus the following Inner Circle interlude
— inducted into the Inner Circle vs kept your mementos hidden. Built on grouped StatNumbers.
-->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
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
	const g = $derived(tcu?.forTheGreaterGood);
	const ic = $derived(tcu?.innerCircle);
	const hasGreater = $derived(!!g && g.openedPuzzleBox + g.guardianEmerged + g.guardianDefeated > 0);
	const hasInner = $derived(!!ic && ic.inducted + ic.keptHidden > 0);
	const hasData = $derived(hasGreater || hasInner);
	const rows = $derived<StatGroup[]>(
		hasData
			? [
					...(hasGreater && g
						? [
								{
									heading: m.campaign_tcu_greater_heading(),
									stats: [
										{ value: g.openedPuzzleBox, label: m.campaign_tcu_greater_box() },
										{ value: g.guardianEmerged, label: m.campaign_tcu_greater_emerged() },
										{ value: g.guardianDefeated, label: m.campaign_tcu_greater_defeated() }
									]
								}
							]
						: []),
					...(hasInner && ic
						? [
								{
									heading: m.campaign_tcu_inner_heading(),
									stats: [
										{ value: ic.inducted, label: m.campaign_tcu_inner_inducted() },
										{ value: ic.keptHidden, label: m.campaign_tcu_inner_hidden() }
									]
								}
							]
						: [])
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
