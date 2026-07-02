<!--
@component
TCU bespoke widget — "At Death's Doorstep". How the spectral realm let you out: escaped, learned
nothing of the Lodge's schemes, or the whole party was lost ("never seen again" — the originals die
and a fresh party carries on). Plus the most pieces of evidence you left behind back at the estate
(the prologue tally that seeds this scenario). Built on grouped StatNumbers, inside the passport.
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
	const d = $derived(tcu?.atDeathsDoorstep);
	const ev = $derived(tcu?.evidenceMax ?? null);
	const hasData = $derived(
		(!!d && d.escaped + d.learnedNothing + d.neverSeenAgain > 0) || ev !== null
	);
	const rows = $derived<StatGroup[]>(
		hasData && d
			? [
					{
						heading: m.campaign_tcu_doorstep_heading(),
						stats: [
							{ value: d.escaped, label: m.campaign_tcu_doorstep_escaped() },
							{ value: d.learnedNothing, label: m.campaign_tcu_doorstep_learned_nothing() },
							{ value: d.neverSeenAgain, label: m.campaign_tcu_doorstep_never_seen() }
						]
					},
					...(ev !== null
						? [{ stats: [{ value: ev, label: m.campaign_tcu_doorstep_evidence() }] }]
						: [])
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
