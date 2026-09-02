<!--
@component
TCU bespoke widget — "Lodge vs Coven", the campaign spine. Three signature runs (Most
Lodge-aligned / Most Coven-aligned / Least committed), each with its finale outcome and its exact
allegiance chain, then a per-decision breakdown of the five decision points and a Price of Progress
footnote (deceiving the Lodge + Josef Meiger's fate).
-->
<script lang="ts">
	import type { CampaignTcu, TcuAllegianceRun } from '$lib/campaign/campaigns/tcu';
	import SignatureRunsTable, {
		type SignatureSide
	} from '$lib/components/profile/campaigns/campaign/SignatureRunsTable.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';
	import TcuAllegianceChain from './TcuAllegianceChain.svelte';
	import TcuAllegianceSourceTable from './TcuAllegianceSourceTable.svelte';
	import {
		ALLEGIANCE_TINT,
		allegianceOutcomeKind,
		allegianceOutcomeLabel,
		allegianceSignatureRows
	} from './tcu-allegiance-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { tcu }: { tcu: CampaignTcu | null } = $props();
	const runs = $derived((tcu?.allegianceRuns ?? []).filter((r) => r.beads.length > 0));
	const sources = $derived(tcu?.allegianceSources ?? []);
	const a = $derived(tcu?.allegiance ?? null);
	const tableRows = $derived(allegianceSignatureRows(runs));

	const sides: [SignatureSide<TcuAllegianceRun>, SignatureSide<TcuAllegianceRun>] = [
		{ abbr: m.campaign_tcu_alleg_lodge_abbr(), tint: ALLEGIANCE_TINT.lodge, value: (r) => r.lodge },
		{ abbr: m.campaign_tcu_alleg_coven_abbr(), tint: ALLEGIANCE_TINT.coven, value: (r) => r.coven }
	];

	const footRows = $derived<Stat[][]>(
		a && (a.deceivingLodge > 0 || a.rescuedJosef > 0 || a.josefAlive > 0 || a.josefLostToMist > 0)
			? [
					[
						{ value: a.deceivingLodge, label: m.campaign_tcu_alleg_deceiving() },
						{ value: a.rescuedJosef, label: m.campaign_tcu_alleg_josef_rescued() },
						{ value: a.josefAlive, label: m.campaign_tcu_alleg_josef_alive() },
						{ value: a.josefLostToMist, label: m.campaign_tcu_alleg_josef_mist() }
					]
				]
			: []
	);

	const sourcesHaveData = $derived(
		sources.some(
			(s) =>
				Object.keys(s.lodge).length || Object.keys(s.coven).length || Object.keys(s.neutral).length
		)
	);
	const hasData = $derived(tableRows.length > 0 || sourcesHaveData);
</script>

{#if hasData}
	<div class="space-y-5">
		{#if tableRows.length}
			<SignatureRunsTable
				rows={tableRows}
				chainLabel={m.campaign_tcu_alleg_col_chain()}
				resultLabel={m.campaign_tcu_alleg_col_result()}
				{sides}
				outcomeKind={allegianceOutcomeKind}
				outcomeLabel={allegianceOutcomeLabel}
			>
				{#snippet chain(run)}
					<TcuAllegianceChain beads={run.beads} />
				{/snippet}
			</SignatureRunsTable>
		{/if}
		<TcuAllegianceSourceTable {sources} />
		{#if footRows.length}
			<StatNumbers rows={footRows} />
		{/if}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tcu_alleg_empty()}</WidgetEmpty>
{/if}
