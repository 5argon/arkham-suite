<!--
@component
TCU bespoke widget — "Union and Disillusion". The Inner Circle's reckoning: a rival
faction can WIN here and end the campaign early — the Silver Twilight Lodge (and, in
rttcu, the Coven) — or a leader ascends (Sanford possesses the secrets / Anette is
possessed) and the campaign goes on. Built on StatNumbers.
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
		!!e && e.lodgeVictory + e.covenVictory + e.sanfordPossesses + e.anettePossessed > 0
	);
	const rows = $derived<Stat[][]>(
		hasData && e
			? [
					[
						{ value: e.lodgeVictory, label: m.campaign_tcu_end_lodge() },
						{ value: e.covenVictory, label: m.campaign_tcu_end_coven() }
					],
					[
						{ value: e.sanfordPossesses, label: m.campaign_tcu_union_sanford() },
						{ value: e.anettePossessed, label: m.campaign_tcu_union_anette() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="union_and_disillusion" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_union_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
