<!--
@component
TFA secret finale — "Turn Back Time". The true ending: rewind time at Shattered Aeons (its
Resolution 5), then seal the Relic of Ages forever. A LOSS here logs identically to a Shattered
Aeons loss, so the campaign log can only confirm the WIN (`sealed_relic_of_ages_forever`); the
played count celebrates every time you came all the way here — the authoritative seal count, or
any reach you recorded yourself in the Extra tab, whichever is higher. Wrapped in the shared
`ScenarioInfo` passport (resolutions reached + verdicts, victory-display highscore, achievements).
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo, {
		type CornerStat
	} from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
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

	// Authoritative true-ending count (the `sealed_relic_of_ages_forever` log note) — always
	// recorded on a win, even when no per-scenario XP/resolution was logged for Turn Back Time.
	const sealed = $derived(tfa?.turnBackTime.sealedForever ?? 0);
	// The generic per-scenario record (any reach the player logged in the Extra tab).
	const stat = $derived(scenarios?.scenarios.find((s) => s.scenario === 'turn_back_time') ?? null);
	// "Came all the way here": the authoritative seals OR any reaches the player recorded (whichever
	// is larger) — so a sealed-forever win never reads as "never played".
	const reached = $derived(Math.max(stat?.plays ?? 0, sealed));
	const playsStat = $derived<CornerStat | null>(
		reached > 0 ? { total: reached, byTier: stat?.playsByTier ?? {} } : null
	);
	const sealedRows = $derived<Stat[][]>(
		sealed > 0 ? [[{ value: sealed, label: m.campaign_tfa_aeons_sealed() }]] : []
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
	{#snippet stats()}
		{#if sealed > 0}
			<StatNumbers rows={sealedRows} />
		{:else if reached === 0}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_turn_back_time_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
