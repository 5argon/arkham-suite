<!-- @component The Essex County Express: the Necronomicon stolen and rescued scholars taken again. -->
<script lang="ts">
	import { DWL_PERSONS, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { dwlPersonName } from './dwl-labels';

	let { blob: dwl, ctx }: CampaignWidgetProps<CampaignDwl> = $props();

	const stolen = $derived(dwl?.necronomicon.stolen ?? 0);
	const tiles = $derived<LitTile[]>(
		DWL_PERSONS.map(({ id, code }) => {
			const n = dwl?.persons[id]?.snatchedAgain ?? 0;
			return {
				id,
				code,
				label: dwlPersonName(id),
				count: n,
				detail: n ? m.campaign_dwl_persons_snatched({ times: times(n) }) : m.campaign_dwl_essex_safe()
			};
		})
	);
	const snatched = $derived(tiles.some((t) => t.count > 0));
</script>

<ScenarioInfo {ctx} empty={stolen || snatched ? null : m.campaign_dwl_essex_empty()}>
	{#snippet stats()}
		<StatNumbers rows={[[{ value: stolen, label: m.campaign_dwl_necronomicon_stolen() }]]} />
		{#if snatched}
			<div>
				<SectionLabel>{m.campaign_dwl_essex_snatched_heading()}</SectionLabel>
				<LitTileGrid {tiles} colsClass="grid-cols-3" />
			</div>
		{/if}
	{/snippet}
</ScenarioInfo>
