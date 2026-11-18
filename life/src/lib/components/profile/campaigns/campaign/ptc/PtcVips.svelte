<!-- @component The dinner-party VIPs across every scenario: who was interviewed and who was slain. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import PtcVipGrid from './PtcVipGrid.svelte';

	let { blob: ptc }: CampaignWidgetProps<CampaignPtc> = $props();
</script>

{#if ptc && (Object.keys(ptc.vipsInterviewed).length || Object.keys(ptc.vipsSlain).length)}
	<PtcVipGrid
		interviewed={ptc.vipsInterviewed}
		slain={ptc.vipsSlain}
		slainLabel={m.campaign_ptc_vips_slain_row()}
	/>
{:else}
	<WidgetEmpty>{m.campaign_ptc_vips_empty()}</WidgetEmpty>
{/if}
