<!--
@component
TSK — Dead Heat. The shared scenario passport — with the rescued/slain civilian stat
numbers folded into the passport's stat block (via `extraStats`, beside Succeed/Failed):
runs where rescued beat slain (and doubled it), the mirror (slain beat rescued, and
doubled it), single-run best (most rescued) / worst (fewest slain), plus how many plays
reunited the lovers (Amaranth's resolution). Then the bespoke section below:
  • Two "best run per player count" tables. Total civilians scale with player count
    ((players + 1) × 5 locations), so the rows are keyed by it; the two tables differ
    only in which run wins each row — by net saved (rescued − slain) vs by surplus over
    twice slain (rescued − 2 × slain).
All civilian data is precomputed on the tsk blob (see compiled-profile.ts).
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();

	/** Dead Heat places (players + 1) civilians at each of its 5 locations. */
	const LOCATIONS = 5;

	const dh = $derived(props.tsk?.deadHeat ?? null);
	// Show the stat block once any civilian count OR a lovers-reunited play has been recorded.
	const hasData = $derived(
		!!dh && (dh.mostRescued !== null || dh.leastSlain !== null || dh.loversReunited > 0)
	);

	const statRows = $derived<Stat[][]>(
		dh
			? [
					[
						{ value: dh.rescuedOverSlain, label: m.campaign_tsk_deadheat_rescued_over_slain() },
						{
							value: dh.rescuedOverDoubleSlain,
							label: m.campaign_tsk_deadheat_rescued_over_double()
						},
						{ value: dh.slainOverRescued, label: m.campaign_tsk_deadheat_slain_over_rescued() },
						{ value: dh.slainOverDoubleRescued, label: m.campaign_tsk_deadheat_slain_over_double() }
					],
					[
						{ value: dh.mostRescued ?? '—', label: m.campaign_tsk_deadheat_most_rescued() },
						{ value: dh.leastSlain ?? '—', label: m.campaign_tsk_deadheat_least_slain() },
						{ value: dh.loversReunited, label: m.campaign_tsk_deadheat_lovers_reunited() }
					]
				]
			: []
	);

	interface CivRow {
		pc: number;
		total: number;
		rescued: number;
		slain: number;
		net: number; // rescued − slain
		double: number; // rescued − 2 × slain
	}
	const toRows = (best: Record<number, { rescued: number; slain: number }> | undefined): CivRow[] =>
		Object.entries(best ?? {})
			.map(([pc, v]) => {
				const players = Number(pc);
				return {
					pc: players,
					total: (players + 1) * LOCATIONS,
					rescued: v.rescued,
					slain: v.slain,
					net: v.rescued - v.slain,
					double: v.rescued - 2 * v.slain
				};
			})
			.sort((a, b) => a.pc - b.pc);
	const netRows = $derived(toRows(dh?.bestByNet));
	const doubleRows = $derived(toRows(dh?.bestByDouble));

	// Each table carries only its own ranking column: the net table drops the "double"
	// column and vice versa, so the surplus metric never competes with the one being ranked.
	const baseColumns = [
		{ label: m.campaign_tsk_deadheat_col_players() },
		{ label: m.campaign_tsk_deadheat_col_total() },
		{ label: m.campaign_tsk_deadheat_col_rescued() },
		{ label: m.campaign_tsk_deadheat_col_slain() }
	];
	const netColumns = [...baseColumns, { label: m.campaign_tsk_deadheat_col_net() }];
	const doubleColumns = [...baseColumns, { label: m.campaign_tsk_deadheat_col_double() }];
	const signed = (n: number): string => (n > 0 ? `+${n}` : String(n));
	// Positive (saved more than lost) stands out in gold; non-positive is de-emphasized in the
	// muted primary tone (harder to read) rather than a jarring red.
	const diffClass = (n: number): string =>
		n > 0 ? 'text-secondary-700 dark:text-secondary-300 font-semibold' : 'text-primary-400';
</script>

{#snippet civCells(r: CivRow, rankKey: 'net' | 'double')}
	<td class="{widgetTableCell} font-semibold text-black tabular-nums dark:text-white">
		{m.campaign_tsk_deadheat_players_n({ count: r.pc })}
	</td>
	<td class="{widgetTableCell} text-primary-500 tabular-nums">{r.total}</td>
	<td class="{widgetTableCell} text-secondary-700 dark:text-secondary-300 tabular-nums"
		>{r.rescued}</td
	>
	<td class="{widgetTableCell} text-primary-700 dark:text-primary-300 tabular-nums">{r.slain}</td>
	<td class="{widgetTableCell} tabular-nums {diffClass(r[rankKey])}">
		{signed(r[rankKey])}
	</td>
{/snippet}

<div class="flex flex-col gap-4">
	<TskScenarioInfo scenarioId="dead_heat" {...props}>
		{#snippet extraStats()}
			<!-- Civilian rescued/slain stat numbers, grouped with the passport's Succeed/Failed row. -->
			{#if hasData && !props.logOnly}
				<StatNumbers rows={statRows} />
			{/if}
		{/snippet}
	</TskScenarioInfo>

	{#if netRows.length && !props.logOnly}
		<div>
			<p class="text-primary-500 mb-1 text-xs font-medium">
				{m.campaign_tsk_deadheat_best_net_title()}
			</p>
			<WidgetTable columns={netColumns} rows={netRows} key={(r) => r.pc}>
				{#snippet row(r)}{@render civCells(r, 'net')}{/snippet}
			</WidgetTable>
		</div>
	{/if}

	{#if doubleRows.length && !props.logOnly}
		<div>
			<p class="text-primary-500 mb-1 text-xs font-medium">
				{m.campaign_tsk_deadheat_best_double_title()}
			</p>
			<WidgetTable columns={doubleColumns} rows={doubleRows} key={(r) => r.pc}>
				{#snippet row(r)}{@render civCells(r, 'double')}{/snippet}
			</WidgetTable>
		</div>
	{/if}
</div>
