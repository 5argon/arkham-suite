<!-- @component The Scarlet Keys the cell obtained (`obtained`) or the subject's own investigators bore (`bearer`), with the latest bearer inset. -->
<script lang="ts">
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import { scarletKeyCardCode } from '$lib/campaign/campaigns/tsk/solver';
	import { difficultyBreakdown, nTimes } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tsk, ctx, mode }: CampaignWidgetProps<CampaignTsk> & { mode: 'obtained' | 'bearer' } = $props();

	const tiles = $derived<LitTile[]>(
		(tsk?.keys ?? [])
			.filter((k) => !(ctx.config.hideWellspring === true && k.id === 'wellspring_of_fortune'))
			.map((k) => {
				const tally = mode === 'bearer' ? k.borne : k.obtained;
				return {
					id: k.id,
					code: scarletKeyCardCode(k.id) ?? undefined,
					count: tally.total,
					detail: tally.total ? difficultyBreakdown(tally.byTier) || nTimes(tally.total) : m.campaign_tsk_keys_never(),
					cornerCode: (mode === 'bearer' ? k.borneBearer : k.obtainedBearer) ?? undefined
				};
			})
	);
	const held = $derived(tiles.filter((t) => t.count > 0).length);

	const splitRows = (counts: number[]): LitTile[][] => {
		const out: LitTile[][] = [];
		let i = 0;
		for (const n of counts) {
			if (i >= tiles.length) break;
			out.push(tiles.slice(i, i + n));
			i += n;
		}
		if (i < tiles.length) out.push(tiles.slice(i));
		return out;
	};
	// Centred rows: 11 Keys as 5+3+3 (narrow) or 6+5 (wide), 10 as 5+5.
	const narrowRows = $derived(splitRows(tiles.length === 11 ? [5, 3, 3] : [5, 5]));
	const wideRows = $derived(splitRows(tiles.length === 11 ? [6, 5] : [5, 5]));
</script>

{#if tiles.length}
	<SectionLabel>
		{mode === 'bearer' ? m.campaign_tsk_keys_bearer_heading() : m.campaign_tsk_keys_obtained_heading()}
		<span class="text-primary-400">{m.campaign_tsk_keys_held_count({ shown: held, total: tiles.length })}</span>
	</SectionLabel>
	<div class="@container">
		<div class="@2xl:hidden"><LitTileGrid rows={narrowRows} /></div>
		<div class="hidden @2xl:block"><LitTileGrid rows={wideRows} /></div>
	</div>
{/if}
