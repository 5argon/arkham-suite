<!--
@component
TFA bespoke widget — "The City of Archives". The Yithian captivity: cooperated vs
resisted, and how the process went (perfected / successful / backfired / backfired
spectacularly / memories expunged). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tfa,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tfa: CampaignTfa | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const c = $derived(tfa?.cityOfArchives);
	const hasData = $derived(
		!!c &&
			(c.cooperated > 0 ||
				c.resisted > 0 ||
				c.perfected > 0 ||
				c.successful > 0 ||
				c.backfired > 0 ||
				c.backfiredSpectacularly > 0 ||
				c.memoriesExpunged > 0)
	);
	const rows = $derived<Stat[][]>(
		hasData && c
			? [
					[
						{ value: c.cooperated, label: m.campaign_tfa_archives_cooperated() },
						{ value: c.resisted, label: m.campaign_tfa_archives_resisted() },
						{ value: c.memoriesExpunged, label: m.campaign_tfa_archives_expunged() }
					],
					[
						{ value: c.perfected, label: m.campaign_tfa_archives_perfected() },
						{ value: c.successful, label: m.campaign_tfa_archives_successful() },
						{ value: c.backfired, label: m.campaign_tfa_archives_backfired() },
						{ value: c.backfiredSpectacularly, label: m.campaign_tfa_archives_backfired_spec() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="the_city_of_archives" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_archives_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
