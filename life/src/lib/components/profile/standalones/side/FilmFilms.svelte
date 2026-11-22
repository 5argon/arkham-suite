<!-- @component Film Fatale: which of the three films each play shot and how often each one wrapped, and the call times made. -->
<script lang="ts">
	import { FILMS } from '$lib/campaign/standalones/side/film-fatale';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './text';

	type Blob = NonNullable<StandaloneBlobs['side.film_fatale']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		FILMS.map((f) => {
			const t = blob?.films[f.id];
			return {
				id: f.id,
				code: f.boss,
				label: standaloneText(`standalone_film_title_${f.id}`),
				count: t?.shot.total ?? 0,
				detail: m.standalone_film_detail({
					shot: t?.shot.total ?? 0,
					wrapped: t?.wrapped.total ?? 0
				})
			};
		})
	);
</script>

{#if tiles.some((t) => t.count > 0)}
	<div class="space-y-4">
		<LitTileGrid {tiles} colsClass="grid-cols-3" />
		<StatNumbers rows={[[{ tally: blob?.callTime, label: m.standalone_film_call_time() }]]} />
	</div>
{:else}
	<WidgetEmpty>{m.standalone_film_empty()}</WidgetEmpty>
{/if}
