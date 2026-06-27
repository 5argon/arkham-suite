<!--
@component
PtC bespoke widget — "Echoes of the Past". The onyx-clasp choice (take = conviction / leave = doubt),
whether you destroyed the Oathspeaker, and whether the followers found their way. Then a per-player-
count table: Echoes' setup scales with the number of players, so each row is a player count you've
played it at, with its Succeed / Failed split and which resolutions lit up there — rendered through
the shared per-version breakdown (like EotE's City of the Elder Things matrix). The returning VIP
(Sebastien Moreau) rides in the shared PtC passport header.
-->
<script lang="ts">
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import { type VersionRow } from '$lib/campaign/stats/version-stats';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		ptc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		ptc: CampaignPtc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const e = $derived(ptc?.echoes);
	const hasOutcomes = $derived(
		!!e && (e.tookOnyx > 0 || e.leftOnyx > 0 || e.destroyedOathspeaker > 0 || e.followersFoundWay > 0)
	);
	const rows = $derived<Stat[][]>(
		hasOutcomes && e
			? [
					[
						{ value: e.tookOnyx, label: m.campaign_ptc_echoes_took_onyx() },
						{ value: e.leftOnyx, label: m.campaign_ptc_echoes_left_onyx() }
					],
					[
						{ value: e.destroyedOathspeaker, label: m.campaign_ptc_echoes_oathspeaker() },
						{ value: e.followersFoundWay, label: m.campaign_ptc_echoes_followers() }
					]
				]
			: []
	);

	// ── Per-player-count table (shared per-version breakdown, player count as the axis) ──
	// The scenario's named resolutions (campaign-data) — including no_resolution, shown as a "None"
	// column (it's a real ending here) and the lit/dimmed set each row reuses.
	const meta = $derived(scenarioMeta('ptc', 'echoes_of_the_past'));
	const resolutionIds = $derived(meta?.resolutions ?? []);
	const verdicts = $derived(
		(meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>
	);
	const pcRows = $derived<VersionRow[]>(
		Object.entries(e?.byPlayerCount ?? {})
			.map(([pc, v]) => ({
				id: pc,
				label: m.campaign_ptc_echoes_players_n({ count: Number(pc) }),
				succeed: v.succeed,
				failed: v.failed,
				resolutionIds,
				reached: new Set(Object.keys(v.tallies)),
				tallies: v.tallies,
				verdicts
			}))
			.sort((a, b) => Number(a.id) - Number(b.id))
	);

	const hasData = $derived(hasOutcomes || pcRows.length > 0);
</script>

<PtcScenarioInfo scenarioId="echoes_of_the_past" {ptc} {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<div class="flex flex-col gap-4">
				{#if hasOutcomes}
					<StatNumbers {rows} />
				{/if}
				{#if pcRows.length}
					<VersionBreakdown
						rows={pcRows}
						title={m.campaign_ptc_echoes_table_title()}
						versionLabel={m.campaign_ptc_echoes_col_players()}
						showSucceedFailed
					/>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_echoes_empty()}</p>
		{/if}
	{/snippet}
</PtcScenarioInfo>
