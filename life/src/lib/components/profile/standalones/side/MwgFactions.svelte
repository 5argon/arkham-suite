<!-- @component The Midwinter Gala: which faction asked for your help each play, and how often you escaped with the Jewel for them. -->
<script lang="ts">
	import { MWG_FACTIONS } from '$lib/campaign/standalones/side/midwinter-gala';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, WidgetEmpty, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './text';

	type Blob = NonNullable<StandaloneBlobs['side.the_midwinter_gala']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		MWG_FACTIONS.map((f) => {
			const t = blob?.factions[f.id];
			return {
				id: f.id,
				code: f.leader,
				label: standaloneText(`standalone_mwg_faction_${f.id}`),
				count: t?.plays.total ?? 0,
				detail: m.standalone_mwg_faction_detail({
					plays: t?.plays.total ?? 0,
					escaped: t?.escaped.total ?? 0
				})
			};
		})
	);
</script>

{#if tiles.some((t) => t.count > 0)}
	<LitTileGrid {tiles} colsClass="grid-cols-3 @lg:grid-cols-5" />
{:else}
	<WidgetEmpty>{m.standalone_mwg_factions_empty()}</WidgetEmpty>
{/if}
