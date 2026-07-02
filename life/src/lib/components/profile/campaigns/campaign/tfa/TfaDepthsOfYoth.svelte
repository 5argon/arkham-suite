<!--
@component
TFA flagship — "The Depths of Yoth". How far you descended (final depth reached, from the Extra tab)
and the headline Yig's Fury breakpoint that shaped the descent: which agenda you began on ("Fury N →
agenda X"), derived from each play's final Fury. Built on StatNumbers, wrapped in the shared TFA
passport (Yig header art; the Patricide achievement surfaces here).
-->
<script lang="ts">
	import { TFA_YIG_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import TfaScenarioInfo from './TfaScenarioInfo.svelte';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const agendaStats = $derived<Stat[]>(
		Object.keys(agenda)
			.map(Number)
			.sort((a, b) => a - b)
			.map((n) => ({
				value: agenda[n],
				label:
					n === 0 ? m.campaign_tfa_vengeance_agenda_special() : m.campaign_tfa_vengeance_agenda({ n })
			}))
	);
	const hasData = $derived((!logOnly && !!d && d.recorded > 0) || agendaStats.length > 0);

	// Final depth is an Extra-tab value — hidden in Log-only mode; the Yig's Fury agenda is log-derived.
	const rows = $derived<(Stat[] | StatGroup)[]>([
		!logOnly && d && d.recorded > 0
			? [
					{ value: d.finalDepthMax, label: m.campaign_tfa_yoth_depth_max() },
					{ value: d.finalDepthMin, label: m.campaign_tfa_yoth_depth_min() }
				]
			: [],
		agendaStats.length
			? { heading: m.campaign_tfa_yoth_agenda_heading(), stats: agendaStats }
			: { stats: [] }
	]);
</script>

<TfaScenarioInfo scenarioId="the_depths_of_yoth" {family} {achievements} {scenarios} {logOnly}>
	{#snippet headerArt()}
		<CardThumb code={TFA_YIG_CODE} alt={m.campaign_tfa_yig_name()} tone="danger" objectTop />
	{/snippet}
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_tfa_yoth_empty()}</p>
		{/if}
	{/snippet}
</TfaScenarioInfo>
