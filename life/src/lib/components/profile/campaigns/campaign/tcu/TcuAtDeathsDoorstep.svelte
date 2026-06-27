<!--
@component
TCU bespoke widget — "At Death's Doorstep". Escaped the spectral realm vs learned
nothing of the Lodge's schemes, and how often the party was lost ("never seen again" —
the originals are killed and a fresh party continues). Built on StatNumbers.
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
	const d = $derived(tcu?.atDeathsDoorstep);
	const hasData = $derived(!!d && d.escaped + d.learnedNothing + d.neverSeenAgain > 0);
	const rows = $derived<Stat[][]>(
		hasData && d
			? [
					[
						{ value: d.escaped, label: m.campaign_tcu_doorstep_escaped() },
						{ value: d.learnedNothing, label: m.campaign_tcu_doorstep_learned_nothing() }
					],
					[{ value: d.neverSeenAgain, label: m.campaign_tcu_doorstep_never_seen() }]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="at_deaths_doorstep" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_doorstep_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
