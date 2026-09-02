<!--
@component
PtC bespoke widget — "Doubt & Conviction", the campaign's spine. Three signature runs (Most
Conviction / Most Doubt / Least Combined), each with its campaign outcome and its exact mark
chain, then a per-source breakdown of the seven decision points.
-->
<script lang="ts">
	import type { CampaignPtc, DcRun } from '$lib/campaign/campaigns/ptc';
	import SignatureRunsTable, {
		type SignatureSide
	} from '$lib/components/profile/campaigns/campaign/SignatureRunsTable.svelte';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';
	import PtcDcChain from './PtcDcChain.svelte';
	import PtcDcSourceTable from './PtcDcSourceTable.svelte';
	import { DC_TINT, dcOutcomeKind, dcOutcomeLabel, dcSignatureRows } from './ptc-dc-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc }: { ptc: CampaignPtc | null } = $props();
	const runs = $derived((ptc?.doubtConvictionRuns ?? []).filter((r) => r.beads.length > 0));
	const sources = $derived(ptc?.dcSources ?? []);
	const tableRows = $derived(dcSignatureRows(runs));

	const sides: [SignatureSide<DcRun>, SignatureSide<DcRun>] = [
		{ abbr: m.campaign_ptc_dc_conviction_abbr(), tint: DC_TINT.conviction, value: (r) => r.conviction },
		{ abbr: m.campaign_ptc_dc_doubt_abbr(), tint: DC_TINT.doubt, value: (r) => r.doubt }
	];

	const sourcesHaveData = $derived(
		sources.some(
			(s) =>
				Object.keys(s.conviction).length || Object.keys(s.doubt).length || Object.keys(s.neutral).length
		)
	);
	const hasData = $derived(tableRows.length > 0 || sourcesHaveData);
</script>

{#if hasData}
	<div class="space-y-5">
		{#if tableRows.length}
			<SignatureRunsTable
				rows={tableRows}
				chainLabel={m.campaign_ptc_dc_col_changes()}
				resultLabel={m.campaign_ptc_dc_col_result()}
				{sides}
				outcomeKind={dcOutcomeKind}
				outcomeLabel={dcOutcomeLabel}
			>
				{#snippet chain(run)}
					<PtcDcChain beads={run.beads} />
				{/snippet}
			</SignatureRunsTable>
		{/if}
		<PtcDcSourceTable {sources} />
	</div>
{:else}
	<WidgetEmpty>{m.campaign_ptc_dc_empty()}</WidgetEmpty>
{/if}
