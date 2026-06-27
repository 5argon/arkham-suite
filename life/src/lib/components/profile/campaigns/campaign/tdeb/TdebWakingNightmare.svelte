<!--
@component
tdeb bespoke widget — "Waking Nightmare". Dr. Maheswaran's fate (joined the investigation vs
stayed with her patients; alive / missing / unknown) and how Randolph escaped the hospital
(alone vs with the investigators — from the shared Randolph track). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, {
		type StatGroup
	} from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		tdeb,
		family = null,
		achievements = [],
		scenarios = null,
		logOnly = false
	}: {
		tdeb: CampaignTdeb | null;
		family?: string | null;
		achievements?: ProfileFamilyAchievement[];
		scenarios?: CampaignScenarios | null;
		logOnly?: boolean;
	} = $props();
	const w = $derived(tdeb?.wakingNightmare);
	const r = $derived(tdeb?.shared.randolph);
	const hasData = $derived(
		!!w &&
			w.doctorJoined + w.doctorStayed + w.doctorFateUnknown + w.doctorAlive + w.doctorMissing +
				(r ? r.escapedAlone + r.escapedWithInvestigators : 0) >
				0
	);
	const rows = $derived<StatGroup[]>(
		hasData && w
			? [
					{
						heading: m.campaign_tdeb_waking_doctor_heading(),
						stats: [
							{ value: w.doctorJoined, label: m.campaign_tdeb_waking_joined() },
							{ value: w.doctorStayed, label: m.campaign_tdeb_waking_stayed() },
							{ value: w.doctorAlive, label: m.campaign_tdeb_waking_alive() },
							{ value: w.doctorMissing, label: m.campaign_tdeb_waking_missing() },
							{ value: w.doctorFateUnknown, label: m.campaign_tdeb_waking_unknown() }
						]
					},
					{
						heading: m.campaign_tdeb_waking_randolph_heading(),
						stats: [
							{ value: r?.escapedAlone ?? 0, label: m.campaign_tdeb_waking_escaped_alone() },
							{ value: r?.escapedWithInvestigators ?? 0, label: m.campaign_tdeb_waking_escaped_with() }
						]
					}
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="waking_nightmare" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tdeb_waking_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
