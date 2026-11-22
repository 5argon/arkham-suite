<!-- @component Fortune and Folly's stakeout: the Part I tasks done before the heist, and how often the cell needed time to rest. -->
<script lang="ts">
	import { FOF_STAKEOUT_TASKS } from '$lib/campaign/standalones/side/fortune-and-folly';
	import type { StandaloneBlobs } from '$lib/campaign/standalones/registry';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { standaloneText } from './text';

	type Blob = NonNullable<StandaloneBlobs['side.fortune_and_folly_part_1']>;
	let { blob }: CampaignWidgetProps<Blob> = $props();

	const tiles = $derived<LitTile[]>(
		FOF_STAKEOUT_TASKS.map((t) => {
			const tally = blob?.stakeout[t];
			return {
				id: t,
				label: standaloneText(`standalone_fof_task_${t}`),
				count: tally?.total ?? 0,
				detail: tallyDetail(tally, m.standalones_cards_never, (times) =>
					m.standalone_fof_task_times({ times })
				)
			};
		})
	);
</script>

{#if tiles.some((t) => t.count > 0)}
	<div class="space-y-4">
		<LitTileGrid {tiles} colsClass="grid-cols-3" />
		<StatNumbers rows={[[{ tally: blob?.needTimeToRest, label: m.standalone_fof_rest() }]]} />
	</div>
{:else}
	<WidgetEmpty>{m.standalone_fof_stakeout_empty()}</WidgetEmpty>
{/if}
