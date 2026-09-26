<!-- @component The mementos found across plays, each tile lit by how many plays found it. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tcu }: CampaignWidgetProps<CampaignTcu> = $props();
	const tiles = $derived<LitTile[]>(
		(tcu?.mementos ?? []).map((mem) => ({
			id: mem.id,
			label: logText(mem.returnTo ? 'rttcu' : 'tcu', `mementos.${mem.id}`),
			count: mem.found.total,
			detail: tallyDetail(mem.found, m.campaign_tcu_memento_undiscovered, (times) =>
				m.campaign_tcu_memento_found({ times })
			)
		}))
	);
</script>

{#if tcu?.mementosCount}
	<div class="space-y-3">
		<SectionLabel variant="heading" align="center"
			>{m.campaign_tcu_mementos_coverage()} — {tcu.mementosCount}</SectionLabel
		>
		<LitTileGrid
			{tiles}
			colsClass="grid-cols-4 @3xl:grid-cols-8"
			countPosition="below"
			showLabel={false}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tcu_mementos_empty()}</WidgetEmpty>
{/if}
