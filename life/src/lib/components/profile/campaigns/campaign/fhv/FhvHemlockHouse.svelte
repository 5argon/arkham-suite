<!--
@component
FHV bespoke widget — "Hemlock House". The vertical haunted-house crawl through Hemlock Harbor:
The Argument (Codex Σ), where you either respected William's wishes or sided with Judith —
whichever you chose removed the other from the house — and whether you found Little Sylvie, the
doll. The Argument is an Extra pick (only the winning relationship is logged), so it hides under
Log-only mode; Little Sylvie is log-derived. Header art pictures William & Judith. Built on
FhvScenarioInfo + StatNumbers.
-->
<script lang="ts">
	import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import FhvScenarioInfo from './FhvScenarioInfo.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		fhv,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		fhv: CampaignFhv | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();

	const h = $derived(fhv?.hemlockHouse ?? null);
	const argTotal = $derived(h ? h.argument.william + h.argument.judith + h.argument.neither : 0);
	const showArgument = $derived(!logOnly && argTotal > 0);
	const hasData = $derived(!!h && (showArgument || h.littleSylvie > 0));

	const rows = $derived<(Stat[] | StatGroup)[]>(
		h
			? [
					...(showArgument
						? [
								{
									heading: m.campaign_fhv_house_argument_heading(),
									stats: [
										{ value: h.argument.william, label: m.campaign_fhv_house_arg_william() },
										{ value: h.argument.judith, label: m.campaign_fhv_house_arg_judith() },
										{ value: h.argument.neither, label: m.campaign_fhv_house_arg_neither() }
									]
								} satisfies StatGroup
							]
						: []),
					...(h.littleSylvie > 0
						? [[{ value: h.littleSylvie, label: m.campaign_fhv_house_sylvie() }] satisfies Stat[]]
						: [])
				]
			: []
	);
</script>

<FhvScenarioInfo scenarioId="hemlock_house" villagers={['william', 'judith']} {family} {achievements} {scenarios} {logOnly} showPlays>
	{#snippet children()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_scenario_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
