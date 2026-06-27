<!--
@component
DWL bespoke widget — "The Essex County Express". What the train takes back from you:
the Necronomicon stolen, and any rescued scholar snatched again (a rescued ally is
re-kidnapped when you lose here). Necronomicon count on top; the re-captured scholars
as a lit portrait roster below. Built on StatNumbers + LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { DWL_PERSONS, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import { times } from '$lib/profile/plural';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

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

	const NAME: Record<string, () => string> = {
		warren_rice: m.campaign_dwl_person_warren_rice,
		francis_morgan: m.campaign_dwl_person_francis_morgan,
		henry_armitage: m.campaign_dwl_person_henry_armitage
	};

	const stolen = $derived(dwl?.necronomicon.stolen ?? 0);
	const statRows = $derived<Stat[][]>(
		stolen > 0 ? [[{ value: stolen, label: m.campaign_dwl_necronomicon_stolen() }]] : []
	);

	const tiles = $derived<LitTile[]>(
		dwl
			? DWL_PERSONS.map((p): LitTile => {
					const n = dwl.persons[p.id]?.snatchedAgain ?? 0;
					return {
						id: p.id,
						image: getCardImagePath(p.code, 'square'),
						label: (NAME[p.id] ?? (() => p.id))(),
						count: n,
						detail: n > 0 ? m.campaign_dwl_persons_snatched({ times: times(n) }) : m.campaign_dwl_essex_safe()
					};
				})
			: []
	);
	const reKidnapAny = $derived(tiles.some((t) => t.count > 0));
	const hasData = $derived(stolen > 0 || reKidnapAny);
</script>

<ScenarioInfo
	scenarioId="the_essex_county_express"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			{#if statRows.length}
				<StatNumbers rows={statRows} />
			{/if}
			{#if reKidnapAny}
				<div class:mt-4={statRows.length}>
					<LitTileGrid {tiles} colsClass="grid-cols-3" />
				</div>
			{/if}
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_essex_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
