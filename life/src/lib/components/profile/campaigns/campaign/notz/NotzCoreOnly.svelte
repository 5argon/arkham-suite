<!-- @component Core-Set-only clears out of all clears, and the investigators who achieved them. -->
<script lang="ts">
	import type { CampaignNotz } from '$lib/campaign/campaigns/notz';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		StatNumbers,
		WidgetEmpty,
		WidgetNote
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: notz }: CampaignWidgetProps<CampaignNotz> = $props();

	const purist = $derived(notz?.purist);
	const tiles = $derived(
		(purist?.investigators ?? []).map(({ code, clears }) => ({
			id: code,
			code,
			count: clears.total,
			detail: tallyDetail(
				clears,
				() => '',
				(times) => m.campaign_notz_purist_inv_detail({ times })
			)
		}))
	);
</script>

{#if notz?.wins}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				[
					{ tally: purist?.coreOnlyClears, label: m.campaign_notz_purist_clears() },
					{ value: notz.wins, label: m.campaign_notz_purist_total_clears() }
				]
			]}
		/>
		{#if tiles.length}
			<LitTileGrid {tiles} layout="flex" objectTop />
		{/if}
		<WidgetNote>{m.campaign_notz_purist_desc()}</WidgetNote>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_notz_purist_empty()}</WidgetEmpty>
{/if}
