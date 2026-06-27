<!--
@component
TFA bespoke widget — "Threads of Fate". The campaign's big branch: who you gave the
relic to (Alejandro vs Harlan), whether you listened to Ichtaca or forged your own
path, and whether you rescued Alejandro or left him missing. Built on StatNumbers.
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
	const t = $derived(tfa?.threadsOfFate);
	const hasData = $derived(
		!!t &&
			(t.relicToAlejandro > 0 ||
				t.relicToHarlan > 0 ||
				t.listenedIchtaca > 0 ||
				t.forgingOwnPath > 0 ||
				t.rescuedAlejandro > 0 ||
				t.alejandroMissing > 0)
	);
	const rows = $derived<Stat[][]>(
		hasData && t
			? [
					[
						{ value: t.relicToAlejandro, label: m.campaign_tfa_threads_relic_alejandro() },
						{ value: t.relicToHarlan, label: m.campaign_tfa_threads_relic_harlan() }
					],
					[
						{ value: t.listenedIchtaca, label: m.campaign_tfa_threads_listened() },
						{ value: t.forgingOwnPath, label: m.campaign_tfa_threads_forging() }
					],
					[
						{ value: t.rescuedAlejandro, label: m.campaign_tfa_threads_rescued() },
						{ value: t.alejandroMissing, label: m.campaign_tfa_threads_missing() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="threads_of_fate" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_threads_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
