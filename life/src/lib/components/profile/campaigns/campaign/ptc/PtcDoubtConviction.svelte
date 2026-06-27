<!--
@component
PtC bespoke widget — "Doubt & Conviction", the campaign's spine. A table of three signature runs
— Most Conviction / Most Doubt / Least Combined — each with its campaign outcome (the shared
OutcomeFace; a dash for an abandoned run) and its exact mark chain (PtcDcChain), so you can see
what that run looked like. Below it, a per-source breakdown: each of the 7 decision points and
how often it went Conviction / Doubt / Neutral (PtcDcSourceTable). Built on WidgetTable.
-->
<script lang="ts">
	import type { CampaignPtc, DcRun } from '$lib/campaign/campaigns/ptc';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { endingText, type EndingKind } from '$lib/campaign/outcomes/clear-status';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import OutcomeFace from '$lib/components/profile/_primitives/OutcomeFace.svelte';
	import PtcDcChain from './PtcDcChain.svelte';
	import PtcDcSourceTable from './PtcDcSourceTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc }: { ptc: CampaignPtc | null } = $props();
	const runs = $derived((ptc?.doubtConvictionRuns ?? []).filter((r) => r.beads.length > 0));
	const sources = $derived(ptc?.dcSources ?? []);

	// Three signature runs (a run can win more than one topic).
	const pick = (better: (a: DcRun, b: DcRun) => DcRun): DcRun | null =>
		runs.length ? runs.reduce(better) : null;
	const mostConviction = $derived(pick((a, b) => (b.conviction > a.conviction ? b : a)));
	const mostDoubt = $derived(pick((a, b) => (b.doubt > a.doubt ? b : a)));
	const leastCombined = $derived(
		pick((a, b) => (b.conviction + b.doubt < a.conviction + a.doubt ? b : a))
	);

	interface TopicRow {
		topic: string;
		run: DcRun;
	}
	const tableRows = $derived<TopicRow[]>(
		(
			[
				{ topic: m.campaign_ptc_dc_row_most_conviction(), run: mostConviction },
				{ topic: m.campaign_ptc_dc_row_most_doubt(), run: mostDoubt },
				{ topic: m.campaign_ptc_dc_row_least_combined(), run: leastCombined }
			] as { topic: string; run: DcRun | null }[]
		).filter((r): r is TopicRow => r.run !== null)
	);
	const columns = [
		{ label: '' },
		{ label: m.campaign_ptc_dc_col_changes() },
		{ label: m.campaign_ptc_dc_col_result(), align: 'right' as const }
	];

	const ptcLog = getCampaignLog('ptc');
	const outcomeKind = (r: DcRun): EndingKind | null =>
		r.outcome === 'win' ? 'win' : r.outcome === 'loss' ? 'loss' : null;
	// Hover text = the ACTUAL ending log text (the shared `endingText`, same source as the Campaign
	// Overview faces) — e.g. "The realm of Carcosa merged with our own…" — not a generic "Lost".
	const outcomeLabel = (r: DcRun) =>
		r.outcomeKey && ptcLog
			? capitalizeFirst(endingText(ptcLog, r.outcomeKey))
			: m.campaign_ptc_outcome_abandoned();

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
			<WidgetTable {columns} rows={tableRows} key={(r) => r.topic}>
				{#snippet row(r)}
					<td
						class="{widgetTableCell} font-semibold whitespace-nowrap text-black dark:text-white"
						>{r.topic}</td
					>
					<td class={widgetTableCell}><PtcDcChain beads={r.run.beads} /></td>
					<td class="{widgetTableCell} text-right tabular-nums whitespace-nowrap">
						<span class="inline-flex items-center justify-end gap-2">
							<OutcomeFace kind={outcomeKind(r.run)} label={outcomeLabel(r.run)} />
							<span>
								<span class="font-semibold text-amber-600 dark:text-amber-400"
									>{m.campaign_ptc_dc_conviction_abbr()}{r.run.conviction}</span
								>
								<span class="text-primary-400"> · </span>
								<span class="font-semibold text-violet-600 dark:text-violet-400"
									>{m.campaign_ptc_dc_doubt_abbr()}{r.run.doubt}</span
								>
							</span>
						</span>
					</td>
				{/snippet}
			</WidgetTable>
		{/if}
		<PtcDcSourceTable {sources} />
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_ptc_dc_empty()}</p>
{/if}
