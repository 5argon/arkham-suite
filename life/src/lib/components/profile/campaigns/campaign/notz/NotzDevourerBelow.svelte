<!--
@component
NotZ bespoke widget — "The Devourer Below". The finale beneath Arkham as a win-quality ladder of
OutcomeFaces: Umôrdhoth repelled (the better ending) → the ritual broken (a win) → Lita sacrificed
(a distinct, hard-won win) → Arkham succumbed (the loss). Laid out 2+2 with per-difficulty counts;
Umôrdhoth heads the passport.
-->
<script lang="ts">
	import { type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';
	import CountWithBreakdown from '$lib/components/profile/_primitives/CountWithBreakdown.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		notz,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		notz: CampaignNotz | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const d = $derived(notz?.devourerBelow ?? null);
	const endings = $derived(
		d
			? [
					{ kind: 'best' as EndingKind, label: m.campaign_notz_ending_repelled(), tally: d.umordhothRepelled },
					{ kind: 'win' as EndingKind, label: m.campaign_notz_ending_ritual(), tally: d.ritualBroken },
					{ kind: 'special' as EndingKind, label: m.campaign_notz_ending_sacrifice(), tally: d.litaSacrificed },
					{ kind: 'loss' as EndingKind, label: m.campaign_notz_ending_succumbed(), tally: d.arkhamSuccumbed }
				]
			: []
	);
	const hasData = $derived(endings.some((e) => e.tally.total > 0));
</script>

<ScenarioInfo scenarioId="the_devourer_below" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code="01142" alt="Umôrdhoth" title="Umôrdhoth" tone="danger" objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<div>
				<SectionLabel variant="heading" align="center">{m.campaign_notz_devourer_heading()}</SectionLabel>
				<div class="grid grid-cols-2 gap-x-6 gap-y-2">
					{#each endings as e (e.label)}
						<div class="flex items-center gap-2 {e.tally.total > 0 ? '' : 'opacity-45'}">
							<OutcomeFace kind={e.kind} label={e.label} reached={e.tally.total > 0} />
							<span class="min-w-0 flex-1 truncate text-sm text-black dark:text-white">{e.label}</span>
							<CountWithBreakdown
								value="×{e.tally.total}"
								byTier={e.tally.byTier}
								class="text-secondary-600 dark:text-secondary-400 shrink-0 font-semibold tabular-nums"
							/>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_notz_devourer_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
