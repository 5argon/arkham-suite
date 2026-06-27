<!--
@component
TCU bespoke widget — "The Secret Name". A Lodge-allegiance beat: did you tell the Lodge
about the Coven, or hide that knowledge? Built on StatNumbers.
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
	const s = $derived(tcu?.secretName);
	const hasData = $derived(!!s && s.toldLodge + s.hidCoven > 0);
	const rows = $derived<Stat[][]>(
		hasData && s
			? [
					[
						{ value: s.toldLodge, label: m.campaign_tcu_secret_told() },
						{ value: s.hidCoven, label: m.campaign_tcu_secret_hid() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_secret_name" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tcu_secret_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
