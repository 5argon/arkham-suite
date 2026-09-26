<!-- @component Doubt & Conviction: the signature runs' mark chains and the marks per decision point. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import { sourcePlays } from '$lib/campaign/campaigns/two-sided';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import SignatureRunsTable from '../SignatureRunsTable.svelte';
	import TwoSidedSourceTable from '../TwoSidedSourceTable.svelte';
	import { ptcDcSpec } from './ptc-spine';

	let { blob: ptc }: CampaignWidgetProps<CampaignPtc> = $props();
	const spec = $derived(ptcDcSpec());
</script>

{#if ptc && (ptc.dcRuns.mostA || ptc.dcSources.some(sourcePlays))}
	<div class="space-y-5">
		<SignatureRunsTable {spec} runs={ptc.dcRuns} />
		<TwoSidedSourceTable {spec} sources={ptc.dcSources} />
	</div>
{:else}
	<WidgetEmpty>{m.campaign_ptc_dc_empty()}</WidgetEmpty>
{/if}
