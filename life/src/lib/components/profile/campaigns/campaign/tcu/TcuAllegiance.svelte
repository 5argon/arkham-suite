<!--
@component
TCU bespoke widget — "Lodge vs Coven", the campaign spine. A table of three signature runs — Most
Lodge-aligned / Most Coven-aligned / Least committed — each with its finale outcome (the shared
OutcomeFace; a dash for an unfinished run) and its exact allegiance chain (TcuAllegianceChain), so
you can see what that run looked like. Below it, a per-decision breakdown: each of the five
allegiance decision points and how often it leaned Lodge / Coven / Neutral (TcuAllegianceSourceTable),
then a Price of Progress footnote (deceiving the Lodge + Josef Meiger's fate). Built on WidgetTable.
-->
<script lang="ts">
	import { TCU_FINALE_ENDINGS, type CampaignTcu, type TcuAllegianceRun } from '$lib/campaign/campaigns/tcu';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { endingText, type EndingKind } from '$lib/campaign/outcomes/clear-status';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import TcuAllegianceChain from './TcuAllegianceChain.svelte';
	import TcuAllegianceSourceTable from './TcuAllegianceSourceTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tcu }: { tcu: CampaignTcu | null } = $props();
	const runs = $derived((tcu?.allegianceRuns ?? []).filter((r) => r.beads.length > 0));
	const sources = $derived(tcu?.allegianceSources ?? []);
	const a = $derived(tcu?.allegiance ?? null);

	// Three signature runs (a run can win more than one topic).
	const pick = (better: (a: TcuAllegianceRun, b: TcuAllegianceRun) => TcuAllegianceRun) =>
		runs.length ? runs.reduce(better) : null;
	const mostLodge = $derived(pick((x, y) => (y.lodge > x.lodge ? y : x)));
	const mostCoven = $derived(pick((x, y) => (y.coven > x.coven ? y : x)));
	const leastCommitted = $derived(pick((x, y) => (y.lodge + y.coven < x.lodge + x.coven ? y : x)));

	interface TopicRow {
		topic: string;
		run: TcuAllegianceRun;
	}
	const tableRows = $derived<TopicRow[]>(
		(
			[
				{ topic: m.campaign_tcu_alleg_row_most_lodge(), run: mostLodge },
				{ topic: m.campaign_tcu_alleg_row_most_coven(), run: mostCoven },
				{ topic: m.campaign_tcu_alleg_row_least(), run: leastCommitted }
			] as { topic: string; run: TcuAllegianceRun | null }[]
		).filter((r): r is TopicRow => r.run !== null)
	);
	const columns = [
		{ label: '' },
		{ label: m.campaign_tcu_alleg_col_chain() },
		{ label: m.campaign_tcu_alleg_col_result(), align: 'right' as const }
	];

	const tcuLog = getCampaignLog('tcu');
	// Finale ending note → outcome-face kind, from the same source the precompute classifies endings by.
	const FINALE_KIND: Record<string, EndingKind> = Object.fromEntries(
		TCU_FINALE_ENDINGS.map((e) => [e.note, e.kind])
	);
	const noteOf = (key: string | null) => key?.replace('campaign_notes.', '') ?? '';
	const outcomeKind = (r: TcuAllegianceRun): EndingKind | null =>
		r.outcomeKey ? (FINALE_KIND[noteOf(r.outcomeKey)] ?? null) : null;
	const outcomeLabel = (r: TcuAllegianceRun) =>
		r.outcomeKey && tcuLog
			? capitalizeFirst(endingText(tcuLog, r.outcomeKey))
			: m.campaign_tcu_outcome_abandoned();

	// Price of Progress footnote (deceiving + Josef) — only when something happened.
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
			<WidgetTable {columns} rows={tableRows} key={(r) => r.topic}>
				{#snippet row(r)}
					<td class="{widgetTableCell} font-semibold whitespace-nowrap text-black dark:text-white"
						>{r.topic}</td
					>
					<td class={widgetTableCell}><TcuAllegianceChain beads={r.run.beads} /></td>
					<td class="{widgetTableCell} text-right tabular-nums whitespace-nowrap">
						<span class="inline-flex items-center justify-end gap-2">
							<OutcomeFace kind={outcomeKind(r.run)} label={outcomeLabel(r.run)} />
							<span>
								<span class="font-semibold text-sky-600 dark:text-sky-400"
									>{m.campaign_tcu_alleg_lodge_abbr()}{r.run.lodge}</span
								>
								<span class="text-primary-400"> · </span>
								<span class="font-semibold text-emerald-600 dark:text-emerald-400"
									>{m.campaign_tcu_alleg_coven_abbr()}{r.run.coven}</span
								>
							</span>
						</span>
					</td>
				{/snippet}
			</WidgetTable>
		{/if}
		<TcuAllegianceSourceTable {sources} />
		{#if footRows.length}
			<StatNumbers rows={footRows} />
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tcu_alleg_empty()}</p>
{/if}
