<!-- @component The six eldritch artifacts, lit by plays that recovered each. -->
<script lang="ts">
	import { TDC_ARTIFACTS, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tdc }: CampaignWidgetProps<CampaignTdc> = $props();

	const tiles = $derived<LitTile[]>(
		TDC_ARTIFACTS.map((id) => {
			const count = tdc?.artifacts.earned[id] ?? 0;
			const kept = tdc?.artifacts.kept[id] ?? 0;
			return {
				id,
				label: logText('tdc', `artifacts_earned.${id}`),
				count,
				detail: !count
					? m.campaign_tdc_artifact_not_yet()
					: kept
						? m.campaign_tdc_artifact_earned_kept({ times: times(count), kept: times(kept) })
						: m.campaign_tdc_artifact_earned({ times: times(count) })
			};
		})
	);
</script>

{#if tdc?.artifacts.everEarned}
	<div class="space-y-4">
		<LitTileGrid {tiles} colsClass="grid-cols-3 @3xl:grid-cols-6" />
		<StatNumbers
			rows={[
				[
					{
						value: tdc.artifacts.allSix,
						label: m.campaign_tdc_artifacts_all({ total: TDC_ARTIFACTS.length })
					}
				]
			]}
		/>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tdc_artifacts_empty()}</WidgetEmpty>
{/if}
