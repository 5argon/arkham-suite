<!-- @component The Meddling of Meowlathotep: where each play's nose led it, by the two scents followed, and how often that ended with the dog people winning. -->
<script lang="ts">
	import { MOM_DISTRICTS } from '$lib/campaign/standalones/side/challenges';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, WidgetEmpty, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './text';

	type Blob = NonNullable<StandaloneBlobs['side.meddling_of_meowlathotep']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		MOM_DISTRICTS.map((d) => {
			const t = blob?.districts[d];
			return {
				id: d,
				label: standaloneText(`standalone_mom_${d}`),
				count: t?.plays.total ?? 0,
				detail: m.standalone_mom_detail({ plays: t?.plays.total ?? 0, won: t?.won.total ?? 0 })
			};
		})
	);
</script>

{#if tiles.some((t) => t.count > 0)}
	<LitTileGrid {tiles} colsClass="grid-cols-2" />
{:else}
	<WidgetEmpty>{m.standalone_mom_empty()}</WidgetEmpty>
{/if}
