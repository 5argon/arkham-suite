<!--
@component
DWL bespoke widget — "Blood on the Altar". The five Dunwich allies (Rice, Morgan,
Armitage, Zebulon Whateley, Earl Sawyer), each lit by how often they were
SACRIFICED to the ritual, with a hover that also shows how often they SURVIVED to
the campaign's end. Portraits are the Ally story-asset cards. Built on LitTileGrid.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { DWL_SACRIFICE_ALLIES, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import type { ProfileFamilyAchievement } from '$lib/campaign/achievements/achievement-aggregate';
	import ScenarioInfo from '$lib/components/profile/campaigns/campaign/ScenarioInfo.svelte';
	import { times } from '$lib/profile/plural';
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
		henry_armitage: m.campaign_dwl_person_henry_armitage,
		zebulon_whateley: m.campaign_dwl_person_zebulon_whateley,
		earl_sawyer: m.campaign_dwl_person_earl_sawyer
	};

	const hasData = $derived(
		!!dwl &&
			DWL_SACRIFICE_ALLIES.some((a) => {
				const t = dwl.sacrifices[a.id];
				return t && (t.survived > 0 || t.sacrificed > 0);
			})
	);

	const tiles = $derived<LitTile[]>(
		dwl
			? DWL_SACRIFICE_ALLIES.map((a): LitTile => {
					const t = dwl.sacrifices[a.id] ?? { survived: 0, sacrificed: 0 };
					const parts: string[] = [];
					if (t.survived > 0)
						parts.push(m.campaign_dwl_sacrifices_survived({ times: times(t.survived) }));
					if (t.sacrificed > 0)
						parts.push(m.campaign_dwl_sacrifices_sacrificed({ times: times(t.sacrificed) }));
					return {
						id: a.id,
						image: getCardImagePath(a.code, 'square'),
						label: (NAME[a.id] ?? (() => a.id))(),
						count: t.sacrificed,
						detail: parts.length ? parts.join(' · ') : m.campaign_dwl_sacrifices_safe()
					};
				})
			: []
	);
</script>

<ScenarioInfo
	scenarioId="blood_on_the_altar"
	{family}
	{achievements}
	{scenarios}
	{logOnly}
>
	{#snippet stats()}
		{#if hasData}
			<LitTileGrid {tiles} colsClass="grid-cols-3 @3xl:grid-cols-5" />
		{:else}
			<p class="text-primary-500 text-sm">{m.campaign_dwl_sacrifices_empty()}</p>
		{/if}
	{/snippet}
</ScenarioInfo>
