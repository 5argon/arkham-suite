<!--
@component
PtC bespoke widget — "Black Stars Rise". Which path you opened (above / below) and
whether Carcosa merged with our world (a LOST play opens neither). Plus the random basic
weakness/es the storm forced into your deck at setup (Madness/Pact/Cultist/Detective),
captured via the Extra card picker — most-drawn first. Built on StatNumbers + a list.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import PtcCardCountList from './PtcCardCountList.svelte';
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
	const b = $derived(ptc?.blackStarsRise);

	// The random-weakness trait pool (Madness / Pact / Cultist / Detective) — filters the trait column to
	// the pool membership that made each weakness drawable, dropping a card's unrelated traits.
	const weaknessTraits =
		getCampaignLog('ptc')
			?.db.scenarioMeta?.find((s) => s.id === 'black_stars_rise')
			?.choices?.find((c) => c.id === 'randomized_weakness')?.cardFilter?.traits ?? [];

	// Random basic weaknesses drawn at setup (precomputed: one entry per draw, newest first, capped).
	// `bearer` lights the investigator thumbnail in the list's second column; `date` shows when drawn.
	const weaknesses = $derived(
		(b?.randomizedWeaknesses ?? []).map((w) => ({
			code: w.weakness,
			bearer: w.bearer ?? undefined,
			date: w.finishDate
		}))
	);

	const hasPath = $derived(!!b && (b.pathAbove > 0 || b.pathBelow > 0 || b.carcosaMerged > 0));
	const hasData = $derived(hasPath || weaknesses.length > 0);
	const rows = $derived<Stat[][]>(
		hasPath && b
			? [
					[
						{ value: b.pathAbove, label: m.campaign_ptc_bsr_above() },
						{ value: b.pathBelow, label: m.campaign_ptc_bsr_below() },
						{ value: b.carcosaMerged, label: m.campaign_ptc_bsr_merged() }
					]
				]
			: []
	);
</script>

<PtcScenarioInfo
	scenarioId="black_stars_rise"
	{ptc}
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasPath}
					<StatNumbers {rows} />
				{/if}
				{#if weaknesses.length}
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_ptc_bsr_weakness_heading()}</SectionLabel
						>
						<PtcCardCountList items={weaknesses} showTrait showDate traitFilter={weaknessTraits} />
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_bsr_empty()}</p>
		{/if}
	{/snippet}
</PtcScenarioInfo>
