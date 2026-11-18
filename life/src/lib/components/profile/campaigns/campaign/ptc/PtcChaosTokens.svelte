<!-- @component Chaos Tokens: the signature runs as token routes and every special-token mix each scenario was played with. -->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { WidgetEmpty } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import SignatureRunsTable from '../SignatureRunsTable.svelte';
	import PtcTokenChain from './PtcTokenChain.svelte';
	import PtcTokenCoverageTable from './PtcTokenCoverageTable.svelte';
	import { ptcDcSpec } from './ptc-spine';

	let { blob: ptc }: CampaignWidgetProps<CampaignPtc> = $props();
	const spec = $derived(ptcDcSpec());
	const hasMixes = $derived(!!ptc?.tokenMixes.some((s) => s.mixes.some((mix) => mix.plays.total)));
</script>

{#if ptc && (ptc.tokenRuns.mostA || hasMixes)}
	<div class="space-y-5">
		{#if ptc.tokenRuns.mostA}
			<SignatureRunsTable
				{spec}
				runs={ptc.tokenRuns}
				chainColumn={m.campaign_ptc_tokens_col_route()}
			>
				{#snippet chain(run)}
					<PtcTokenChain route={run.tokenRoute} />
				{/snippet}
			</SignatureRunsTable>
		{/if}
		<PtcTokenCoverageTable scenarios={ptc.tokenMixes} />
	</div>
{:else}
	<WidgetEmpty>{m.campaign_ptc_tokens_empty()}</WidgetEmpty>
{/if}
