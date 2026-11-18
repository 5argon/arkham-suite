<!-- @component Insight rows: a condition, how many decks meet it, and up to three of their investigators. -->
<script lang="ts">
	import { CardSquare } from '@5argon/arkham-life-ui';
	import { resolveCards, type InsightRow } from '$lib/campaign/utils/card-filters';
	import { HoverTip, HoverTipState, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { rows }: { rows: InsightRow[] } = $props();

	const pct = (count: number, total: number): string =>
		total > 0 ? `${((count / total) * 100).toFixed(2)}%` : '—';

	const tip = new HoverTipState();
</script>

<WidgetTable
	columns={[
		{ label: m.cards_insight_col_condition() },
		{ label: m.cards_insight_col_decks(), align: 'right' },
		{ label: m.cards_insight_col_investigators(), align: 'right' }
	]}
	{rows}
	key={(r) => r.label}
>
	{#snippet row(r)}
		<td class="{widgetTableCell} text-primary-700 dark:text-primary-200">{r.label}</td>
		<td
			class="{widgetTableCell} text-secondary-700 dark:text-secondary-300 w-40 text-right whitespace-nowrap tabular-nums"
		>
			<span class="font-semibold">{r.count}</span>
			{#if r.total === undefined}
				<span class="text-xs opacity-70">{m.cards_insight_decks({ count: r.count })}</span>
			{:else if r.showTotal}
				<span class="text-xs opacity-70">
					/{r.total}
					{m.cards_insight_decks({ count: r.total })} ({pct(r.count, r.total)})
				</span>
			{:else}
				{@const outOf = m.cards_insight_out_of({ count: r.total })}
				<span
					role="img"
					aria-label="{r.count} {m.cards_insight_decks({ count: r.count })} ({pct(r.count, r.total)}) — {outOf}"
					class="cursor-help text-xs opacity-70"
					onmouseenter={(e) => tip.showText(outOf, e)}
					onmouseleave={tip.hide}
				>
					{m.cards_insight_decks({ count: r.count })} ({pct(r.count, r.total)})
				</span>
			{/if}
		</td>
		<td class="{widgetTableCell} w-36">
			<div class="flex min-h-9 items-center justify-end gap-1">
				{#each resolveCards(r.investigators) as c (c.code)}
					<span
						class="shrink-0"
						role="img"
						aria-label={c.name}
						onmouseenter={(e) => tip.showText(c.name, e)}
						onmouseleave={tip.hide}><CardSquare card={c} /></span
					>
				{:else}
					<span class="text-primary-400 text-xs">—</span>
				{/each}
			</div>
		</td>
	{/snippet}
</WidgetTable>

<HoverTip {tip} />
