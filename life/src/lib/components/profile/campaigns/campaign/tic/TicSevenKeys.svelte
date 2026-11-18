<!-- @component The four keys earned before Into the Maelstrom, and the plays that held all four for its secret ending. -->
<script lang="ts">
	import { TIC_KEYS, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		WidgetNote
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { tallyTile } from './tic-tiles';

	let { blob: tic }: CampaignWidgetProps<CampaignTic> = $props();

	const LABEL: Record<string, () => string> = {
		blue: m.campaign_tic_key_blue,
		red: m.campaign_tic_key_red,
		green: m.campaign_tic_key_green,
		yellow: m.campaign_tic_key_yellow
	};
	const tiles = $derived(
		TIC_KEYS.map((key) =>
			tallyTile(
				{ id: key.id, label: LABEL[key.id]?.() ?? key.id },
				tic?.keys.each[key.id],
				m.campaign_tic_key_not_yet,
				(times) => m.campaign_tic_key_secured({ times })
			)
		)
	);
</script>

{#if tiles.some((t) => t.count > 0)}
	<div class="space-y-3">
		<LitTileGrid {tiles} colsClass="grid-cols-2 @3xl:grid-cols-4" />
		{#if tic?.keys.all.total}
			<StatNumbers rows={[[{ tally: tic.keys.all, label: m.campaign_tic_keys_reachable_label() }]]} />
		{:else}
			<WidgetNote>{m.campaign_tic_keys_unreachable()}</WidgetNote>
		{/if}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tic_keys_empty()}</WidgetEmpty>
{/if}
