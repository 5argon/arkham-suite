<!-- @component Machinations Through Time: the Machination and Plot drawn at setup each play. -->
<script lang="ts">
	import { MTT_MACHINATIONS, MTT_PLOTS } from '$lib/campaign/standalones/side/epic-multiplayer';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import type { Tally } from '$lib/campaign/utils/tally';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	type Blob = NonNullable<StandaloneBlobs['side.machinations_through_time']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const toTiles = (
		list: readonly { id: string; code: string }[],
		tallies: Record<string, Tally> | undefined
	) =>
		list.map((x): LitTile => ({
			id: x.id,
			code: x.code,
			count: tallies?.[x.id]?.total ?? 0,
			detail: m.campaigns_plays({ count: tallies?.[x.id]?.total ?? 0 })
		}));
	const machinations = $derived(toTiles(MTT_MACHINATIONS, blob?.machinations));
	const plots = $derived(toTiles(MTT_PLOTS, blob?.plots));
</script>

{#if [...machinations, ...plots].some((t) => t.count > 0)}
	<div class="space-y-4">
		<div>
			<SectionLabel variant="heading" align="center">{m.standalone_mtt_machination()}</SectionLabel>
			<LitTileGrid tiles={machinations} colsClass="grid-cols-3" />
		</div>
		<div>
			<SectionLabel variant="heading" align="center">{m.standalone_mtt_plot()}</SectionLabel>
			<LitTileGrid tiles={plots} colsClass="grid-cols-3" />
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.standalone_mtt_variants_empty()}</WidgetEmpty>
{/if}
