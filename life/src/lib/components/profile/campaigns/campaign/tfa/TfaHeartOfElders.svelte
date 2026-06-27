<!--
@component
TFA bespoke widget — "Heart of the Elders". Whom you consulted to find the way:
Ichtaca, Alejandro, or the journal. Built on StatNumbers.
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
	const h = $derived(tfa?.heartOfElders);
	const hasData = $derived(!!h && (h.consultIchtaca > 0 || h.consultAlejandro > 0 || h.consultJournal > 0));
	const rows = $derived<Stat[][]>(
		hasData && h
			? [
					[
						{ value: h.consultIchtaca, label: m.campaign_tfa_hote_ichtaca() },
						{ value: h.consultAlejandro, label: m.campaign_tfa_hote_alejandro() },
						{ value: h.consultJournal, label: m.campaign_tfa_hote_journal() }
					]
				]
			: []
	);
</script>

<!-- Covers BOTH Heart of the Elders parts in one widget; Part 1 stands as the representative scenario. -->
<ScenarioInfo scenarioId="heart_of_the_elders_part_1" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_hote_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
