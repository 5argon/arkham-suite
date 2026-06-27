<!--
@component
TFA bespoke widget — "Shattered Aeons", the finale. The endings reached (mended the
tear / saved the serpents / saved the Yithians / fabric of time unwoven) and the true
ending: sealing the Relic of Ages forever (Turn Back Time). Built on StatNumbers.
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
	const a = $derived(tfa?.shatteredAeons);
	const sealed = $derived(tfa?.turnBackTime.sealedForever ?? 0);
	const hasData = $derived(
		!!a &&
			(a.mendedTear > 0 ||
				a.savedSerpents > 0 ||
				a.savedYithians > 0 ||
				a.fabricUnwoven > 0 ||
				sealed > 0)
	);
	const rows = $derived<Stat[][]>(
		hasData && a
			? [
					[
						{ value: a.mendedTear, label: m.campaign_tfa_aeons_mended() },
						{ value: a.savedSerpents, label: m.campaign_tfa_aeons_serpents() },
						{ value: a.savedYithians, label: m.campaign_tfa_aeons_yithians() }
					],
					[
						{ value: a.fabricUnwoven, label: m.campaign_tfa_aeons_unwoven() },
						{ value: sealed, label: m.campaign_tfa_aeons_sealed() }
					]
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="shattered_aeons" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_aeons_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
