<!--
@component
PtC bespoke widget — "The Last King". How the dinner party ended: resigned (R1), defeated
(R2), or survived to the end (R3). Resolution-only in the log, so it reads the Extra-tab
resolution. Plus the Reality's Shadow (Interlude I) fork — fled / intruded / slayed — which
only the resigned/R1 path reaches and is a derivable campaign note. Then a mini VIP grid for
the party itself: who you interviewed (campaign-wide — interviews only happen here) above who
you slew AT the party (the per-scenario slain_vips Extra), each greyed out until you did it.
-->
<script lang="ts">
	import { type CampaignPtc, VIP_ROSTER } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, {
		type Stat,
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import PtcVipGrid from './PtcVipGrid.svelte';
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
	const lk = $derived(ptc?.lastKing);
	const hasResolution = $derived(!!lk && (lk.resigned > 0 || lk.defeated > 0 || lk.survived > 0));
	const hasInterlude = $derived(
		!!lk && (lk.fledParty > 0 || lk.intrudedMeeting > 0 || lk.slayedMonsters > 0)
	);

	// Mini VIP grid: interview row = campaign-wide interviews (which only happen here), slain row
	// = those slain AT the party (the Last King slain_vips Extra, keyed by guest/asset code).
	const interviewedCounts = $derived(VIP_ROSTER.map((v) => ptc?.vipsInterviewed[v.asset]?.total ?? 0));
	const interviewedByTier = $derived(VIP_ROSTER.map((v) => ptc?.vipsInterviewed[v.asset]?.byTier ?? {}));
	const partySlainCounts = $derived(VIP_ROSTER.map((v) => lk?.slainVips[v.asset]?.total ?? 0));
	const partySlainByTier = $derived(VIP_ROSTER.map((v) => lk?.slainVips[v.asset]?.byTier ?? {}));
	const mostSlain = $derived(lk?.mostSlainInRun ?? null);
	const hasVips = $derived([...interviewedCounts, ...partySlainCounts].some((n) => n > 0));

	const hasData = $derived(hasResolution || hasInterlude || hasVips);
	const rows = $derived<(Stat[] | StatGroup)[]>(
		lk
			? [
					{
						heading: m.campaign_ptc_lastking_resolution(),
						stats: [
							{ value: lk.survived, label: m.campaign_ptc_lastking_survived() },
							{ value: lk.resigned, label: m.campaign_ptc_lastking_resigned() },
							{ value: lk.defeated, label: m.campaign_ptc_lastking_defeated() }
						]
					},
					...(hasInterlude
						? [
								{
									heading: m.campaign_ptc_lastking_interlude(),
									stats: [
										{ value: lk.fledParty, label: m.campaign_ptc_lastking_fled() },
										{ value: lk.intrudedMeeting, label: m.campaign_ptc_lastking_intruded() },
										{ value: lk.slayedMonsters, label: m.campaign_ptc_lastking_slayed() }
									]
								} satisfies StatGroup
							]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo
	scenarioId="the_last_king"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasResolution || hasInterlude}
					<StatNumbers {rows} />
				{/if}
				{#if hasVips}
					<PtcVipGrid
						{interviewedCounts}
						slainCounts={partySlainCounts}
						{interviewedByTier}
						slainByTier={partySlainByTier}
						{mostSlain}
						slainRowLabel={m.campaign_ptc_lastking_slain_heading()}
					/>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_lastking_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
