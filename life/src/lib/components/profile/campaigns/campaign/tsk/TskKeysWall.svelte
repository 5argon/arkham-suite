<!--
@component
TSK bespoke widget — the Scarlet Keys vault, in two modes (one catalogue widget each):
  • `obtained` — a Key lights when the CELL obtained it in a recorded play, even if a
    teammate (another player in your shared campaign) was the bearer.
  • `bearer`   — a Key lights only when one of the SUBJECT'S OWN investigators bore it.
Each Key is its real card art; the count badge is how many plays obtained/bore it, the
hover breaks that down per difficulty, and the bearer investigator's card square is inset
at the bottom-right corner. A Key only ever borne by a Red Coterie NPC stays greyed.
Reads the `keys` collection roster + the `tsk` aggregate's per-key tallies.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignCollections } from '$lib/campaign/collections';
	import { difficultyBreakdown, times } from '$lib/campaign/difficulty';
	import type { CampaignTsk } from '$lib/campaign/tsk-profile';
	import { keyCardCodeForName } from '$lib/campaign/tsk-solver';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';

	let {
		collections,
		tsk,
		mode,
		hideWellspring = false
	}: {
		collections: CampaignCollections[];
		tsk: CampaignTsk | null;
		/** `obtained` = the cell got it (any bearer); `bearer` = your own investigator bore it. */
		mode: 'obtained' | 'bearer';
		hideWellspring?: boolean;
	} = $props();

	const keysCol = $derived(
		collections.flatMap((c) => c.collections).find((col) => col.sectionId === 'keys')
	);

	const tiles = $derived<LitTile[]>(
		(keysCol?.items ?? [])
			.filter((it) => !(hideWellspring && it.id === 'wellspring_of_fortune'))
			.map((it) => {
				const stat = tsk?.keys[it.id];
				const tally = mode === 'bearer' ? stat?.borne : stat?.obtained;
				const bearer = mode === 'bearer' ? stat?.borneBearer : stat?.obtainedBearer;
				const count = tally?.total ?? 0;
				const code = keyCardCodeForName(it.label);
				return {
					id: it.id,
					image: code ? getCardImagePath(code, 'square') : '',
					label: it.label,
					count,
					detail:
						count > 0 && tally
							? difficultyBreakdown(tally.byTier, times) || times(count)
							: m.campaign_tsk_keys_never(),
					cornerCode: bearer ?? undefined
				};
			})
	);
	const shownCount = $derived(tiles.filter((t) => t.count > 0).length);

	function splitRows<T>(arr: T[], counts: number[]): T[][] {
		const out: T[][] = [];
		let i = 0;
		for (const n of counts) {
			if (i >= arr.length) break;
			out.push(arr.slice(i, i + n));
			i += n;
		}
		if (i < arr.length) out.push(arr.slice(i));
		return out;
	}
	// Balanced, centred rows. The odd-count splits keep every row centred under the one
	// above it: 11 keys → 5+3+3 (narrow) / 6+5 (wide); 10 keys → 5+5 either way.
	const narrowRows = $derived(splitRows(tiles, tiles.length === 11 ? [5, 3, 3] : [5, 5]));
	const wideRows = $derived(splitRows(tiles, tiles.length === 11 ? [6, 5] : [5, 5]));
</script>

{#if keysCol}
	<div>
		<p class="text-primary-500 mb-2 text-xs">
			{mode === 'bearer' ? m.campaign_tsk_keys_bearer_heading() : m.campaign_tsk_keys_obtained_heading()}
			<span class="text-primary-400">{m.campaign_tsk_keys_held_count({ shown: shownCount, total: tiles.length })}</span>
		</p>
		<div class="@container">
			<div class="@2xl:hidden"><LitTileGrid rows={narrowRows} /></div>
			<div class="hidden @2xl:block"><LitTileGrid rows={wideRows} /></div>
		</div>
	</div>
{/if}
