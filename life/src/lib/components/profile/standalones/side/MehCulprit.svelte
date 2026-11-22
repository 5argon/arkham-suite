<!-- @component Murder at the Excelsior Hotel: which of the ten True Culprits each play uncovered, by its two Lead assets, and which were solved. -->
<script lang="ts">
	import { MEH_CULPRITS } from '$lib/campaign/standalones/side/excelsior';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import { cardByCode } from '$lib/card-data';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.murder_at_the_excelsior_hotel']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		MEH_CULPRITS.map((c) => {
			const t = blob?.culprits[c.id];
			return {
				id: c.id,
				code: c.boss,
				label: m.standalone_meh_version({ version: c.id }),
				count: t?.plays.total ?? 0,
				detail: m.standalone_meh_culprit_detail({
					boss: cardByCode(c.boss)?.name ?? c.boss,
					leads: c.leads.map((l) => cardByCode(l)?.name ?? l).join(' + '),
					plays: t?.plays.total ?? 0,
					solved: t?.solved.total ?? 0
				})
			};
		})
	);
	const uncovered = $derived(tiles.filter((t) => t.count > 0).length);
	const solved = $derived(
		MEH_CULPRITS.filter((c) => (blob?.culprits[c.id].solved.total ?? 0) > 0).length
	);
</script>

{#if uncovered}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				[
					{ value: `${uncovered} / 10`, label: m.standalone_meh_uncovered() },
					{ value: `${solved} / 10`, label: m.standalone_meh_solved() }
				]
			]}
		/>
		<LitTileGrid {tiles} colsClass="grid-cols-5" />
	</div>
{:else}
	<WidgetEmpty>{m.standalone_meh_culprit_empty()}</WidgetEmpty>
{/if}
