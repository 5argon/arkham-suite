<!-- @component The Labyrinths of Lunacy: which group each play read, how many escaped, and how many groups escaped together at best. -->
<script lang="ts">
	import { LOL_GROUPS } from '$lib/campaign/standalones/side/epic-multiplayer';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetNote,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './text';

	type Blob = NonNullable<StandaloneBlobs['side.in_the_labyrinths_of_lunacy']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		LOL_GROUPS.map((g) => {
			const t = blob?.groups[g.id];
			return {
				id: g.id,
				code: g.code,
				label: standaloneText(`standalone_lol_${g.id}`),
				count: t?.plays.total ?? 0,
				detail: m.standalone_lol_group_detail({
					plays: t?.plays.total ?? 0,
					escaped: t?.escaped.total ?? 0
				})
			};
		})
	);
</script>

<div class="space-y-4">
	<StatNumbers
		rows={[
			{
				keepEmpty: true,
				stats: [
					{ value: `${blob?.mostEscaped ?? 0} / 3`, label: m.standalone_lol_most_escaped() },
					{ tally: blob?.epic, label: m.standalone_lol_epic() }
				]
			}
		]}
	/>
	{#if tiles.some((t) => t.count > 0)}<LitTileGrid {tiles} colsClass="grid-cols-3" />{/if}
	<WidgetNote>{m.standalone_lol_note()}</WidgetNote>
</div>
