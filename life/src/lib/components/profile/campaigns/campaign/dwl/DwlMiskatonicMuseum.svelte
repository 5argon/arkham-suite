<!--
@component
DWL bespoke widget — "The Miskatonic Museum". The Necronomicon's fate decided here
(took custody / destroyed / failed to recover) and the opening approach — break in,
or spend clues to get Adam Lynch to let you in. The approach is an Extra-tab choice
(the log never records it). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, {
		type Stat,
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	// `logOnly` (global or per-campaign): the opening approach is an Extra-tab choice, so that
	// group hides when the player only has the log (the Necronomicon custody stays — it's logged).
	let {
		dwl,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		dwl: CampaignDwl | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const n = $derived(dwl?.necronomicon);
	const a = $derived(dwl?.miskatonicApproach);
	const hasData = $derived(
		(!!n && (n.took > 0 || n.destroyed > 0 || n.failed > 0)) ||
			(!logOnly && !!a && (a.brokeIn > 0 || a.spokeToAdam > 0))
	);

	const necRow = $derived<Stat[]>(
		n && (n.took > 0 || n.destroyed > 0 || n.failed > 0)
			? [
					{ value: n.took, label: m.campaign_dwl_necronomicon_took() },
					{ value: n.destroyed, label: m.campaign_dwl_necronomicon_destroyed() },
					{ value: n.failed, label: m.campaign_dwl_necronomicon_failed() }
				]
			: []
	);
	const approachRow = $derived<Stat[]>(
		a && (a.brokeIn > 0 || a.spokeToAdam > 0)
			? [
					{ value: a.brokeIn, label: m.campaign_dwl_miskatonic_broke_in() },
					{ value: a.spokeToAdam, label: m.campaign_dwl_miskatonic_spoke_to_adam() }
				]
			: []
	);
	const rows = $derived<StatGroup[]>([
		...(necRow.length ? [{ heading: m.campaign_dwl_miskatonic_nec_heading(), stats: necRow }] : []),
		...(!logOnly && approachRow.length
			? [{ heading: m.campaign_dwl_miskatonic_approach_heading(), stats: approachRow }]
			: [])
	]);
</script>

<ScenarioInfo
	scenarioId="the_miskatonic_museum"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_miskatonic_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
