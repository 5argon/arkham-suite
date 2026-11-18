<!-- @component The Fold: which way the expeditions headed at Expedition to R'lyeh. -->
<script lang="ts">
	import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers, WidgetNote } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: tdc }: CampaignWidgetProps<CampaignTdc> = $props();

	const f = $derived(tdc?.fold);
</script>

<StatNumbers
	empty={m.campaign_tdc_fold_empty()}
	rows={[
		[
			{ value: f?.west, label: m.campaign_tdc_fold_west() },
			{ value: f?.east, label: m.campaign_tdc_fold_east() }
		]
	]}
/>
{#if f && f.west + f.east > 0}
	<WidgetNote>{m.campaign_tdc_fold_note()}</WidgetNote>
{/if}
