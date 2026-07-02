<!--
@component
FHV bespoke widget — "Fate of the Vale", the finale. Which of the 4 Act-3a versions you played
(Marquez's plan / save the Vale / burn it all / flee), the ending reached, and — the finale's
emotional ledger — which residents you carried out alive. The endings' win/loss classes ride the
campaign endings widget separately. Built on FhvScenarioInfo + StatNumbers + LitTileGrid.
-->
<script lang="ts">
	import { FHV_FATE_ENDINGS, FHV_VILLAGERS, fhvText, fhvVillagerName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import FhvScenarioInfo from './FhvScenarioInfo.svelte';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import { times } from '$lib/profile/plural';
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
	const savedTotal = $derived(f ? Object.values(f.saved).reduce((a, b) => a + b, 0) : 0);
	const hasData = $derived(!!f && versionTotal + endingTotal + savedTotal > 0);
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
	const savedTiles = $derived<LitTile[]>(
		f
			? FHV_VILLAGERS.map((v): LitTile => {
					const c = f.saved[v.id] ?? 0;
					const name = fhvVillagerName(v.id);
					return {
						id: v.id,
						image: portraitUrl('fhv', v.id),
						label: name,
						count: c,
						detail: c > 0 ? m.campaign_fhv_fate_saved_tile({ name, times: times(c) }) : m.campaign_fhv_fate_lost_tile({ name })
					};
				})
			: []
	);
</script>

<FhvScenarioInfo scenarioId="fate_of_the_vale" {family} {achievements} {scenarios} {logOnly}>
	{#snippet stats()}
		{#if rows.length}
			<StatNumbers {rows} />
		{/if}
	{/snippet}
	{#snippet children()}
		{#if savedTotal > 0}
			<div>
				<SectionLabel variant="heading" align="center">{m.campaign_fhv_fate_saved_heading()}</SectionLabel>
				<LitTileGrid tiles={savedTiles} layout="flex" objectTop />
			</div>
		{:else if !hasData}
			<p class="text-primary-500 text-sm">{m.campaign_fhv_fate_empty()}</p>
		{/if}
	{/snippet}
</FhvScenarioInfo>
