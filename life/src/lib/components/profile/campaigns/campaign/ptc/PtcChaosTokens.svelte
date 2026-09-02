<!--
@component
PtC bespoke widget — "Chaos Tokens". Each scenario is played with the special-token mix (cultist /
tablet / elder-thing) that the previous scenario's resolution (or Curtain Call's Act 2b) fed into
the bag, so a run is a chain of mixes. The same three signature runs as Doubt & Conviction are
shown as token routes (each scenario's icon with the mix beneath it), then a per-scenario coverage
table of every mix played. Only completed runs (a win or a loss) count.
-->
<script lang="ts">
	import type { CampaignPtc, DcRun } from '$lib/campaign/campaigns/ptc';
	import SignatureRunsTable, {
		type SignatureSide
	} from '$lib/components/profile/campaigns/campaign/SignatureRunsTable.svelte';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';
	import PtcTokenChain from './PtcTokenChain.svelte';
	import PtcTokenCoverageTable from './PtcTokenCoverageTable.svelte';
	import { DC_TINT, dcOutcomeKind, dcOutcomeLabel, dcSignatureRows } from './ptc-dc-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc }: { ptc: CampaignPtc | null } = $props();
	const runs = $derived(
		(ptc?.doubtConvictionRuns ?? []).filter(
			(r) => r.tokenRoute.length > 0 && r.outcome !== 'abandoned'
		)
	);
	const coverage = $derived(ptc?.tokenScenarioMixes ?? []);
	const tableRows = $derived(dcSignatureRows(runs));

	const sides: [SignatureSide<DcRun>, SignatureSide<DcRun>] = [
		{ abbr: m.campaign_ptc_dc_conviction_abbr(), tint: DC_TINT.conviction, value: (r) => r.conviction },
		{ abbr: m.campaign_ptc_dc_doubt_abbr(), tint: DC_TINT.doubt, value: (r) => r.doubt }
	];

	const coverageHasData = $derived(coverage.some((s) => s.mixes.some((mm) => mm.total > 0)));
	const hasData = $derived(tableRows.length > 0 || coverageHasData);
</script>

{#if hasData}
	<div class="space-y-5">
		{#if tableRows.length}
			<SignatureRunsTable
				rows={tableRows}
				chainLabel={m.campaign_ptc_tokens_col_route()}
				resultLabel={m.campaign_ptc_dc_col_result()}
				{sides}
				outcomeKind={dcOutcomeKind}
				outcomeLabel={dcOutcomeLabel}
			>
				{#snippet chain(run)}
					<PtcTokenChain route={run.tokenRoute} />
				{/snippet}
			</SignatureRunsTable>
		{/if}
		<PtcTokenCoverageTable scenarios={coverage} />
	</div>
{:else}
	<WidgetEmpty>{m.campaign_ptc_tokens_empty()}</WidgetEmpty>
{/if}
