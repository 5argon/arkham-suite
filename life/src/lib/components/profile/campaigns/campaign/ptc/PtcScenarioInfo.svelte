<!--
@component
PtC-specific scenario passport — a thin wrapper over the shared `ScenarioInfo` that, for the five
scenarios where a dinner-party VIP returns as an enemy (Echoes / Unspeakable Oath / Phantom /
Pallid Mask / Black Stars Rise), injects that VIP's reference art (the interview card + the slain
enemy card, like TSK's Key/Coterie header art) plus the player's record there: the interview "help"
bonus (plays that reached here having interviewed them at The Last King) and how many times the VIP
was slain in exactly this scenario. Everything else (corner stats, resolutions, achievements, the
`stats` block) is the shared passport. Scenarios without a home VIP just render the plain passport.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getAllCards } from '$lib/card-data';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		scenarioId,
		ptc,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false,
		stats,
		children
	}: {
		scenarioId: string;
		ptc: CampaignPtc | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
		/** The standardised stat-numbers section (forwarded verbatim to the passport). */
		stats?: Snippet;
		/** Final bespoke content below the passport (forwarded verbatim). */
		children?: Snippet;
	} = $props();

	// The home VIP for this scenario (null for scenarios without one — then this is a plain passport).
	const vh = $derived(ptc?.vipHelp?.[scenarioId] ?? null);
	const nameByCode = new Map(getAllCards().map((c) => [c.code, c.name]));
	const vipName = $derived(vh ? (nameByCode.get(vh.asset) ?? vh.asset) : '');
</script>

<ScenarioInfo {scenarioId} {family} {achievements} {scenarios} {logOnly} {stats}>
	{#snippet headerArt()}
		{#if vh}
			<div class="flex shrink-0 gap-2">
				<CardThumb code={vh.asset} alt={vipName} title={vipName} objectTop />
				<CardThumb code={vh.enemy} alt={vipName} title={vipName} tone="danger" objectTop />
			</div>
		{/if}
	{/snippet}

	{#snippet headerMeta()}
		{#if vh}
			<p class="text-sm font-semibold text-black dark:text-white">{vipName}</p>
			{#if !logOnly}
				<div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
					<span class="inline-flex items-center gap-1">
						<span class="text-primary-500" title={m.campaign_ptc_vip_bonus_tip({ name: vipName })}
							>{m.campaign_ptc_vip_bonus_label()}</span
						>
						<CountWithBreakdown
							value="×{vh.bonus.total}"
							byTier={vh.bonus.byTier}
							class="text-secondary-700 dark:text-secondary-300 font-semibold tabular-nums"
						/>
					</span>
					<span class="inline-flex items-center gap-1">
						<span
							class="text-primary-500"
							title={m.campaign_ptc_vip_slain_here_tip({ name: vipName })}
							>{m.campaign_ptc_vip_slain_here_label()}</span
						>
						<CountWithBreakdown
							value="×{vh.slainHere.total}"
							byTier={vh.slainHere.byTier}
							class="text-primary-700 dark:text-primary-300 font-semibold tabular-nums"
						/>
					</span>
				</div>
			{/if}
		{/if}
	{/snippet}

	{@render children?.()}
</ScenarioInfo>
