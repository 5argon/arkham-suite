<!--
@component
EotE bespoke widget — "Memories Banished" (Fatal Mirage). Two card-art walls of
the memories you've banished across your plays (lit when banished, greyed when
not, hover = how many times):
  • Locations — the nine mirage LOCATIONS whose memory you put to rest.
  • Enemies   — the nine memory ENEMIES ("Memory of …") you've banished.
Layout: 3×3 at narrow width, 5+4 (grid-cols-5 wraps 9 items into rows of 5 then 4)
at wider containers. Both read `memories_banished` logs; fed by the `eoe` aggregate.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { entryLabel } from '$lib/campaign/campaign-log-source';
	import { EOE_MEMORY_LOCATIONS, EOE_MEMORY_ENEMIES, type CampaignEoe } from '$lib/campaign/eoe';
	import { times } from '$lib/profile/plural';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { eoe }: { eoe: CampaignEoe | null } = $props();
	const log = getCampaignLog('eoe');

	const banishDetail = (n: number): string =>
		n > 0
			? m.campaign_eote_memory_banished({ times: times(n) })
			: m.campaign_eote_memory_never_banished();

	const locations = $derived<LitTile[]>(
		eoe && log
			? EOE_MEMORY_LOCATIONS.map((l) => {
					const n = eoe.memoriesBanishedLocations?.[l.id] ?? 0;
					return {
						id: l.id,
						image: getCardImagePath(l.code, 'square'),
						label: entryLabel(log, `memories_banished.${l.id}`),
						count: n,
						detail: banishDetail(n)
					};
				})
			: []
	);
	const enemies = $derived<LitTile[]>(
		eoe && log
			? EOE_MEMORY_ENEMIES.map((e) => {
					const n = eoe.memoriesBanishedEnemies?.[e.id] ?? 0;
					return {
						id: e.id,
						image: getCardImagePath(e.code, 'square'),
						label: entryLabel(log, `memories_banished.${e.id}`),
						count: n,
						detail: banishDetail(n)
					};
				})
			: []
	);
	// Coverage counts are precomputed on the eoe blob (see compiled-profile.ts).
	const seenLocations = $derived(eoe?.memoriesBanishedLocationsCount ?? 0);
	const seenEnemies = $derived(eoe?.memoriesBanishedEnemiesCount ?? 0);
</script>

{#if eoe}
	<div class="space-y-4">
		<div>
			<h4 class="text-primary-500 mb-2 text-xs font-semibold tracking-wide uppercase">
				{m.campaign_eote_memory_locations({ seen: seenLocations, total: locations.length })}
			</h4>
			<LitTileGrid tiles={locations} colsClass="grid-cols-3 @md:grid-cols-5" />
		</div>
		<div>
			<h4 class="text-primary-500 mb-2 text-xs font-semibold tracking-wide uppercase">
				{m.campaign_eote_memory_enemies({ seen: seenEnemies, total: enemies.length })}
			</h4>
			<LitTileGrid tiles={enemies} colsClass="grid-cols-3 @md:grid-cols-5" />
		</div>
	</div>
{/if}
