<!--
@component
PtC bespoke widget — "Chaos Tokens", the campaign's signature quirk. Each scenario is played
with a mix of special non-skull tokens (cultist / tablet / elder-thing) that the PREVIOUS
scenario's resolution (or Curtain Call's Act 2b) fed into the bag — so a run is a chain of
token mixes. This pictures three signature runs (the same Most Conviction / Most Doubt / Least
Combined picks as the Doubt & Conviction widget) as token routes: each scenario's icon with the
mix it was played with beneath it (PtcTokenChain). A different lens on the run than the D/C beads.
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
	import PtcTokenChain from './PtcTokenChain.svelte';
	import PtcTokenCoverageTable from './PtcTokenCoverageTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc }: { ptc: CampaignPtc | null } = $props();
	// Only completed runs (a win or a loss) — like the Doubt & Conviction widget, an abandoned run
	// (no ending reached) doesn't count here.
	const runs = $derived(
		(ptc?.doubtConvictionRuns ?? []).filter(
			(r) => r.tokenRoute.length > 0 && r.outcome !== 'abandoned'
		)
	);
	const coverage = $derived(ptc?.tokenScenarioMixes ?? []);

	// Same three signature runs as Doubt & Conviction (a run can win more than one topic).
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
		{ label: m.campaign_ptc_tokens_col_route() },
		{ label: m.campaign_ptc_dc_col_result(), align: 'right' as const }
	];

	const ptcLog = getCampaignLog('ptc');
	const outcomeKind = (r: DcRun): EndingKind | null =>
		r.outcome === 'win' ? 'win' : r.outcome === 'loss' ? 'loss' : null;
	const outcomeLabel = (r: DcRun) =>
		r.outcomeKey && ptcLog
			? capitalizeFirst(endingText(ptcLog, r.outcomeKey))
			: m.campaign_ptc_outcome_abandoned();

	const coverageHasData = $derived(coverage.some((s) => s.mixes.some((mm) => mm.total > 0)));
	const hasData = $derived(tableRows.length > 0 || coverageHasData);
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
					<td class={widgetTableCell}><PtcTokenChain route={r.run.tokenRoute} /></td>
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
		<PtcTokenCoverageTable scenarios={coverage} />
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_ptc_tokens_empty()}</p>
{/if}
