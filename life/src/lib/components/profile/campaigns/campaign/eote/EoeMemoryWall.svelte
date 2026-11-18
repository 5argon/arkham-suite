<!-- @component Fatal Mirage: the memory locations and memory enemies banished, as two card walls. -->
<script lang="ts">
	import {
		EOE_MEMORY_ENEMIES,
		EOE_MEMORY_LOCATIONS,
		type CampaignEoe
	} from '$lib/campaign/campaigns/eoe';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { entryText, litTiles, timesDetail } from './eote-tiles';

	let { blob: eoe }: CampaignWidgetProps<CampaignEoe> = $props();

	const banished = timesDetail(
		m.campaign_eote_memory_banished,
		m.campaign_eote_memory_never_banished
	);

	const walls = $derived([
		{
			label: m.campaign_eote_memory_locations({
				seen: eoe?.memoriesBanishedLocationsCount ?? 0,
				total: EOE_MEMORY_LOCATIONS.length
			}),
			tiles: litTiles(
				EOE_MEMORY_LOCATIONS,
				eoe?.memoriesBanishedLocations,
				banished,
				entryText('memories_banished')
			)
		},
		{
			label: m.campaign_eote_memory_enemies({
				seen: eoe?.memoriesBanishedEnemiesCount ?? 0,
				total: EOE_MEMORY_ENEMIES.length
			}),
			tiles: litTiles(
				EOE_MEMORY_ENEMIES,
				eoe?.memoriesBanishedEnemies,
				banished,
				entryText('memories_banished')
			)
		}
	]);
</script>

<div class="space-y-4">
	{#each walls as wall, i (i)}
		<div>
			<SectionLabel>{wall.label}</SectionLabel>
			<LitTileGrid tiles={wall.tiles} colsClass="grid-cols-3 @md:grid-cols-5" />
		</div>
	{/each}
</div>
