<!-- @component The three kidnapped scholars, lit by how often their fate was settled at their own scenario. -->
<script lang="ts">
	import { DWL_PERSONS, type CampaignDwl } from '$lib/campaign/campaigns/dwl';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, WidgetEmpty, type LitTile } from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import { dwlPersonName } from './dwl-labels';

	let { blob: dwl }: CampaignWidgetProps<CampaignDwl> = $props();

	const tiles = $derived<LitTile[]>(
		DWL_PERSONS.map(({ id, code }) => {
			const rescued = dwl?.persons[id]?.rescued ?? 0;
			const left = dwl?.persons[id]?.leftKidnapped ?? 0;
			const detail = [
				rescued ? m.campaign_dwl_persons_rescued({ times: times(rescued) }) : '',
				left ? m.campaign_dwl_persons_kidnapped({ times: times(left) }) : ''
			]
				.filter(Boolean)
				.join(' · ');
			return {
				id,
				code,
				label: dwlPersonName(id),
				count: rescued + left,
				detail: detail || m.campaign_dwl_persons_empty_tile()
			};
		})
	);
</script>

{#if tiles.some((t) => t.count > 0)}
	<LitTileGrid {tiles} colsClass="grid-cols-3" />
{:else}
	<WidgetEmpty>{m.campaign_dwl_persons_empty()}</WidgetEmpty>
{/if}
