<!--
@component
TFA secret finale — "Turn Back Time". The true ending: rewind time at Shattered Aeons (its Resolution
5), then seal the Relic of Ages forever. A LOSS here logs identically to a Shattered Aeons loss, so the
campaign log can only confirm the WIN (`sealed_relic_of_ages_forever`); the played count celebrates
every time you came all the way here — the authoritative seal count, or any reach you recorded in the
Extra tab, whichever is higher. Wrapped in the shared `ScenarioInfo` passport (Relic of Ages header
art; the If I Could Turn Back Time achievement surfaces here).
-->
<script lang="ts">
	import { TFA_RELIC_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo, {
		type CornerStat
	} from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';

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

	// A sealed-forever win is always logged even without per-scenario XP/resolution, so the reach
	// count is the larger of the generic record and the seal count.
	const sealed = $derived(tfa?.turnBackTime.sealedForever ?? 0);
	const stat = $derived(scenarios?.scenarios.find((s) => s.scenario === 'turn_back_time') ?? null);
	const reached = $derived(Math.max(stat?.plays ?? 0, sealed));
	const playsStat = $derived<CornerStat | null>(
		reached > 0 ? { total: reached, byTier: stat?.playsByTier ?? {} } : null
	);
</script>

<ScenarioInfo
	scenarioId="turn_back_time"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
	plays={playsStat}
>
	{#snippet headerArt()}
		<CardThumb code={TFA_RELIC_CODE} alt={m.campaign_tfa_relic_name()} objectTop />
	{/snippet}
	{#snippet stats()}
		{#if sealed > 0}
			<div class="flex items-center justify-center gap-2">
				<OutcomeFace kind="best" label={m.campaign_tfa_aeons_sealed()} size="text-2xl" />
				<span class="text-4xl leading-none font-bold text-black tabular-nums dark:text-white">×{sealed}</span>
				<span class="text-primary-500 text-sm">{m.campaign_tfa_aeons_sealed()}</span>
			</div>
		{:else if reached === 0}
			<WidgetEmpty>{m.campaign_tfa_turn_back_time_empty()}</WidgetEmpty>
		{/if}
	{/snippet}
</ScenarioInfo>
