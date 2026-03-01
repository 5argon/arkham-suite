<!--
@component
EotE bespoke widget — item tiles that light up by a per-item lifetime count. Each
tile is the item's actual CARD art (square crop). One component, two kinds:
  • supplies — "Supplies Recovered": supplies still held, in one centred wrapping row.
  • camped   — "Camped": the 13 camps in their on-sheet ascent tiers (4 / 3 / 3 / 3).
Built on LitTileGrid (`rows` layout). Fed by the shared `eoe` aggregate.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { entryLabel } from '$lib/campaign/campaign-log-source';
	import {
		eoeSupplyIds,
		EOE_CAMP_ROWS,
		EOE_SUPPLY_CARD,
		EOE_CAMP_CARD,
		type CampaignEoe
	} from '$lib/campaign/eoe';
	import { times } from '$lib/profile/plural';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { eoe, kind }: { eoe: CampaignEoe | null; kind: 'supplies' | 'camped' } = $props();

	const log = getCampaignLog('eoe');
	// Camp sheet labels read "Camp - Icy Wastes (4)"; trim to the place name.
	const cleanCamp = (text: string): string =>
		text.replace(/^Camp\s*[-–]\s*/i, '').replace(/\s*\(\d+\)\s*$/, '');

	const rows = $derived.by((): LitTile[][] => {
		if (!eoe || !log) return [];
		if (kind === 'supplies') {
			const tiles = eoeSupplyIds(log).map((id): LitTile => {
				const n = eoe.supplies[id] ?? 0;
				return {
					id,
					image: getCardImagePath(EOE_SUPPLY_CARD[id] ?? '', 'square'),
					label: entryLabel(log, `supplies_recovered.${id}`),
					count: n,
					detail:
						n > 0
							? m.campaign_eote_item_recovered({ times: times(n) })
							: m.campaign_eote_item_never_recovered()
				};
			});
			return tiles.length ? [tiles] : [];
		}
		return EOE_CAMP_ROWS.map((row) =>
			row.map((id): LitTile => {
				const n = eoe.camped[id] ?? 0;
				return {
					id,
					image: getCardImagePath(EOE_CAMP_CARD[id] ?? '', 'square'),
					label: cleanCamp(entryLabel(log, `campaign_notes.${id}`)),
					count: n,
					detail:
						n > 0
							? m.campaign_eote_item_camped({ times: times(n) })
							: m.campaign_eote_item_never_camped()
				};
			})
		);
	});
</script>

{#if eoe && rows.length}
	<LitTileGrid {rows} />
{/if}
