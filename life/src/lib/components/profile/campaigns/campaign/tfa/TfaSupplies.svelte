<!-- @component The provisions the subject's investigators packed, lit by how often, and the plays they set out with nothing. -->
<script lang="ts">
	import { TFA_PROVISIONS, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import { itemLabel, loadCampaignLog } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tfa }: CampaignWidgetProps<CampaignTfa> = $props();

	const log = loadCampaignLog('tfa');
	const tiles = $derived<LitTile[]>(
		TFA_PROVISIONS.map((id) => {
			const count = tfa?.supplies[id] ?? 0;
			return {
				id,
				label: log ? itemLabel(log, id) : id,
				count,
				detail: count
					? m.campaign_tfa_supplies_took({ times: times(count) })
					: m.campaign_tfa_supplies_never()
			};
		})
	);
</script>

{#if tfa?.suppliesRuns}
	<div class="space-y-3">
		<LitTileGrid {tiles} layout="flex" countPosition="below" />
		<StatNumbers
			rows={[[{ value: tfa.suppliesEmptyRuns, label: m.campaign_tfa_supplies_light() }]]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tfa_supplies_empty()}</WidgetEmpty>
{/if}
