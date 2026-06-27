<!--
@component
FHV bespoke widget — "Fate of the Vale". Which of the 4 finale versions you played and the
ending reached (single-sided classes ride the campaign endings widget separately). Built on
StatNumbers (grouped).
-->
<script lang="ts">
	import { FHV_FATE_ENDINGS, fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
	const f = $derived(fhv?.fate);
	const VERSION: { id: string; label: () => string }[] = [
		{ id: 'v1', label: m.campaign_fhv_fate_v1 },
		{ id: 'v2', label: m.campaign_fhv_fate_v2 },
		{ id: 'v3', label: m.campaign_fhv_fate_v3 },
		{ id: 'v4', label: m.campaign_fhv_fate_v4 }
	];
	const versionTotal = $derived(f ? Object.values(f.version).reduce((a, b) => a + b, 0) : 0);
	const endingTotal = $derived(f ? Object.values(f.endings).reduce((a, b) => a + b, 0) : 0);
	const hasData = $derived(!!f && versionTotal + endingTotal > 0);
	const rows = $derived<StatGroup[]>(
		hasData && f
			? [
					...(versionTotal > 0
						? [{ heading: m.campaign_fhv_fate_version_heading(), stats: VERSION.map((v) => ({ value: f.version[v.id] ?? 0, label: v.label() })) }]
						: []),
					...(endingTotal > 0
						? [{ heading: m.campaign_fhv_fate_ending_heading(), stats: FHV_FATE_ENDINGS.map((e) => ({ value: f.endings[e.id] ?? 0, label: fhvText(`campaign_notes.${e.id}`) })) }]
						: [])
				]
			: []
	);
</script>

<ScenarioInfo scenarioId="fate_of_the_vale" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if hasData}
			<StatNumbers {rows} />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_fate_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
