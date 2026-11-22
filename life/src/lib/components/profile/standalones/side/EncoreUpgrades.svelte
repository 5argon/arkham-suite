<!-- @component Enthralling Encore: the parallel investigators who upgraded their signature card after a win, and whose weakness turned advanced after a loss. -->
<script lang="ts">
	import { ENCORE_INVESTIGATORS } from '$lib/campaign/standalones/side/challenges';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, WidgetEmpty, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.enthralling_encore']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		ENCORE_INVESTIGATORS.map((inv) => {
			const u = blob?.upgrades[inv.base];
			return {
				id: inv.base,
				code: inv.parallel,
				count: u?.signature.total ?? 0,
				detail: m.standalone_enc_detail({
					signature: u?.signature.total ?? 0,
					weakness: u?.weakness.total ?? 0
				})
			};
		})
	);
</script>

{#if ENCORE_INVESTIGATORS.some((inv) => (blob?.upgrades[inv.base]?.signature.total ?? 0) + (blob?.upgrades[inv.base]?.weakness.total ?? 0) > 0)}
	<LitTileGrid {tiles} colsClass="grid-cols-4 @lg:grid-cols-7" />
{:else}
	<WidgetEmpty>{m.standalone_enc_empty()}</WidgetEmpty>
{/if}
