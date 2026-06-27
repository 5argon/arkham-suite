<!--
@component
PtC bespoke widget — "The Pallid Mask". Whether you entered the catacombs under your
own power or awoke trapped inside, and whether you learned the site of the gate. Plus
the random basic Madness/Pact weakness/es drawn for reading Act II of The King in
Yellow (captured via the Extra card picker; WHO read it is the repeatable read_act_2
campaign-log entry) — most-drawn first. Built on StatNumbers + a list.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { reachableResolutions, type CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import { toVersionRow } from '$lib/campaign/stats/version-stats';
	import { choicesForScenario } from '$lib/campaign/stats/scenario-extras';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import PtcScenarioInfo from './PtcScenarioInfo.svelte';
	import VersionBreakdown from '$lib/components/profile/campaigns/campaign/VersionBreakdown.svelte';
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
	const p = $derived(ptc?.pallidMask);

	// Per-version breakdown (Conviction / Doubt — how Act 2 advanced) from the unified scenarios record.
	const SID = 'the_pallid_mask';
	const log = getCampaignLog('ptc');
	const meta = log?.db.scenarioMeta?.find((s) => s.id === SID);
	const resolutionIds = (meta?.resolutions ?? []).filter((r) => r !== 'no_resolution');
	// The random-weakness trait pool (Madness / Pact) — filters the trait column to the pool membership
	// that made each weakness drawable, dropping a card's unrelated traits.
	const weaknessTraits = meta?.choices?.find((c) => c.id === 'randomized_weakness')?.cardFilter?.traits ?? [];
	const verdicts = (meta?.resolutionOutcomes ?? {}) as Record<string, 'win' | 'loss' | 'neutral'>;
	const dcChoice = log ? choicesForScenario(log, SID).find((c) => c.id === 'doubt_conviction') : undefined;
	const accents: Record<string, string> = {
		conviction: 'text-amber-600 dark:text-amber-400',
		doubt: 'text-violet-600 dark:text-violet-400'
	};
	const versionStats = $derived(scenarios?.scenarios.find((s) => s.scenario === SID)?.versions ?? []);
	// Act 2 advancing by Conviction ends at R1, by Doubt at R2 — so each version shows only its own
	// resolution column (a reached one is always kept lit, guarding against an edge-case mis-key).
	const versionRows = $derived(
		versionStats.map((vs) =>
			toVersionRow(vs, {
				label: dcChoice?.options.find((o) => o.value === vs.value)?.label ?? vs.value,
				accent: accents[vs.value],
				resolutionIds: reachableResolutions(SID, vs.value, resolutionIds, new Set(Object.keys(vs.tallies))),
				verdicts
			})
		)
	);
	const hasVersions = $derived(versionStats.some((v) => v.plays > 0));

	// Random basic Madness/Pact weaknesses drawn for reading Act II (precomputed: one entry per draw,
	// newest first, capped). `bearer` lights the investigator thumbnail; `date` shows when it was drawn.
	const weaknesses = $derived(
		(p?.randomizedWeaknesses ?? []).map((w) => ({
			code: w.weakness,
			bearer: w.bearer ?? undefined,
			date: w.finishDate
		}))
	);

	const hasStats = $derived(!!p && (p.enteredCatacombs > 0 || p.awokeInside > 0));
	const hasData = $derived(hasStats || weaknesses.length > 0 || hasVersions);
	const rows = $derived<Stat[][]>(
		hasStats && p
			? [
					[
						{ value: p.enteredCatacombs, label: m.campaign_ptc_pallid_entered() },
						{ value: p.awokeInside, label: m.campaign_ptc_pallid_awoke() }
					]
				]
			: []
	);
</script>

<PtcScenarioInfo
	scenarioId="the_pallid_mask"
	{ptc}
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<div class="space-y-4">
				{#if hasStats}
					<StatNumbers {rows} />
				{/if}
				{#if weaknesses.length}
					<div>
						<SectionLabel variant="heading" align="center"
							>{m.campaign_ptc_pallid_weakness_heading()}</SectionLabel
						>
						<PtcCardCountList items={weaknesses} showTrait showDate traitFilter={weaknessTraits} />
					</div>
				{/if}
			</div>
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_ptc_pallid_empty()}</p>
		{/if}
	{/snippet}
</PtcScenarioInfo>
