<!--
@component
TCU bespoke widget — "In the Clutches of Chaos". Whom you asked for aid (Anette /
Sanford), whom you arrested, and whether you assumed control of the Lodge.
Built on StatNumbers.
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
	const c = $derived(tcu?.clutchesOfChaos);
	const hasData = $derived(
		!!c && c.askedAnette + c.askedSanford + c.arrestedAnette + c.arrestedSanford + c.assumedControl > 0
	);
	const rows = $derived<Stat[][]>(
		hasData && c
			? [
					[
						{ value: c.askedAnette, label: m.campaign_tcu_clutches_asked_anette() },
						{ value: c.askedSanford, label: m.campaign_tcu_clutches_asked_sanford() }
					],
					[
						{ value: c.arrestedAnette, label: m.campaign_tcu_clutches_arrested_anette() },
						{ value: c.arrestedSanford, label: m.campaign_tcu_clutches_arrested_sanford() }
					],
					[{ value: c.assumedControl, label: m.campaign_tcu_clutches_control() }]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="in_the_clutches_of_chaos" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_clutches_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
