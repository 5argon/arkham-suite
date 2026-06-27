<!--
@component
TFA bespoke widget — "The Depths of Yoth". How deep you descended, and which agenda
you began on — the headline Yig's Fury breakpoint ("Fury N → started on agenda X").
The agenda distribution is derived from each play's final Yig's Fury. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
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
	const d = $derived(tfa?.depthsOfYoth);
	const agenda = $derived(tfa?.vengeance.depthsAgenda ?? {});
	const hasData = $derived(!!d && d.finalDepthMax !== null);

	const agendaRow = $derived<Stat[]>(
		Object.keys(agenda)
			.map(Number)
			.sort((a, b) => a - b)
			.map((n) => ({
				value: agenda[n],
				label:
					n === 0 ? m.campaign_tfa_vengeance_agenda_special() : m.campaign_tfa_vengeance_agenda({ n })
			}))
	);
	const rows = $derived<Stat[][]>(
		hasData && d
			? [
					[
						{ value: d.finalDepthMax, label: m.campaign_tfa_yoth_depth_max() },
						{ value: d.finalDepthMin, label: m.campaign_tfa_yoth_depth_min() }
					],
					agendaRow
				].filter((r) => r.length)
			: []
	);
</script>

<ScenarioInfo scenarioId="the_depths_of_yoth" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_yoth_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
