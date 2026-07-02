<!--
@component
TFA scenario — "Shattered Aeons", the finale. The five endings reached: mended the tear · saved the
serpents · saved the Yithians (the three wins) · fabric of time unwoven (the loss) · and turned back
time (the neutral rewind that opens the secret Turn Back Time finale). The passport's resolution chips
carry each ending's win/loss verdict; this names them. Wrapped in the shared TFA passport (Relic of
Ages & Yig header art).
-->
<script lang="ts">
	import { TFA_RELIC_CODE, TFA_YIG_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import TfaScenarioInfo from './TfaScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const hasData = $derived(
		!!a &&
			a.mendedTear + a.savedSerpents + a.savedYithians + a.fabricUnwoven + a.turnedBackTime > 0
	);
	const rows = $derived<(Stat[] | StatGroup)[]>(
		a
			? [
					{
						heading: m.campaign_tfa_aeons_heading(),
						stats: [
							{ value: a.mendedTear, label: m.campaign_tfa_aeons_mended() },
							{ value: a.savedSerpents, label: m.campaign_tfa_aeons_serpents() },
							{ value: a.savedYithians, label: m.campaign_tfa_aeons_yithians() }
						]
					},
					[
						{ value: a.fabricUnwoven, label: m.campaign_tfa_aeons_unwoven() },
						{ value: a.turnedBackTime, label: m.campaign_tfa_aeons_turned() }
					]
				]
			: []
	);
</script>

<TfaScenarioInfo scenarioId="shattered_aeons" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<div class="flex shrink-0 gap-2">
			<CardThumb code={TFA_RELIC_CODE} alt={m.campaign_tfa_relic_name()} objectTop />
			<CardThumb code={TFA_YIG_CODE} alt={m.campaign_tfa_yig_name()} tone="danger" objectTop />
		</div>
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_aeons_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
