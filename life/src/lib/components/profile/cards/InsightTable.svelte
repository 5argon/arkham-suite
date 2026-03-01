<!--
@component
The "insight rows" table shared by the neutral-card spotlight widgets. Each row is a
labelled condition over your decks: its qualifying deck count plus up to three of the
investigators whose decks qualify (CardSquare art) — so a "Used Knife" row shows who, not
just how many. A row that sets `total` shows a percentage — `count Decks (pct%)` — with the
denominator revealed on hover; set `showTotal: true` to print it inline instead
(`count / total Decks (pct%)`), for when the denominator is meaningful (e.g. "of the decks
that can use it"). The count and investigator columns are fixed-width so rows line up across
every widget that uses this table.
-->
<script lang="ts">
	import { CardSquare, HoverTooltip } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';

	let {
		rows
	}: {
		rows: {
			label: string;
			count: number;
			investigators: CardCode[];
			/** When set, the count shows a percentage of this denominator (revealed on hover). */
			total?: number;
			/** With `total` set, `true` prints the denominator inline (`count / total Decks (pct%)`)
			 *  rather than only on hover — for non-obvious denominators worth seeing at a glance. */
			showTotal?: boolean;
		}[];
	} = $props();
	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));

	const plural = (n: number): string => (n === 1 ? 'Deck' : 'Decks');
	const pct = (count: number, total: number): string =>
		total > 0 ? `${((count / total) * 100).toFixed(2)}%` : '—';
	/** A bare percentage row (`X Decks (Y%)`) reveals its denominator on hover. Rows that print
	 *  the denominator inline (`showTotal`) don't need the tooltip. */
	const totalTip = (r: { total?: number; showTotal?: boolean }): string | null =>
		r.total !== undefined && !r.showTotal ? `Out of total ${r.total} ${plural(r.total)}` : null;

	// Which row's denominator tooltip is showing, and its anchor element.
	let tipText = $state<string | null>(null);
	let tipRef = $state<HTMLElement | null>(null);
</script>

<!-- table-fixed + colgroup: the count and investigator columns are a strict, shared width so
	rows line up across every widget; the label column flexes to fill the rest. -->
<table class="w-full table-fixed border-collapse">
	<colgroup>
		<col />
		<col class="w-40" />
		<col class="w-36" />
	</colgroup>
	<tbody>
		{#each rows as r (r.label)}
			{@const tip = totalTip(r)}
			<tr class="border-primary-100 dark:border-primary-800/60 border-b last:border-0">
				<td class="text-primary-700 dark:text-primary-200 py-2 pr-3 text-sm">{r.label}</td>
				<td
					class="text-secondary-700 dark:text-secondary-300 py-2 pr-4 text-right whitespace-nowrap tabular-nums"
				>
					<span class="text-sm font-semibold">{r.count}</span>
					{#if tip}
						<span
							class="cursor-help text-xs font-normal opacity-70"
							role="img"
							aria-label="{r.count} {plural(r.count)} ({pct(r.count, r.total ?? 0)}) — {tip}"
							onmouseenter={(e) => {
								tipRef = e.currentTarget as HTMLElement;
								tipText = tip;
							}}
							onmouseleave={() => {
								tipRef = null;
								tipText = null;
							}}
						>
							{plural(r.count)} ({pct(r.count, r.total ?? 0)})
						</span>
					{:else if r.total !== undefined}
						<span class="text-xs font-normal opacity-70">
							/{r.total} {plural(r.total)} ({pct(r.count, r.total)})
						</span>
					{:else}
						<span class="text-xs font-normal opacity-70">{plural(r.count)}</span>
					{/if}
				</td>
				<td class="py-2">
					<div class="flex min-h-9 items-center justify-end gap-1">
						{#if r.investigators.length}
							{#each r.investigators as code (code)}
								{@const c = byCode.get(code)}
								{#if c}
									<span class="shrink-0" title={c.name}><CardSquare card={c} /></span>
								{/if}
							{/each}
						{:else}
							<span class="text-primary-400 text-xs">—</span>
						{/if}
					</div>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<!-- Always mounted so toggling `visible` plays HoverTooltip's fly transition (mounting it
	already-visible would animate from the wrong position). -->
<HoverTooltip visible={tipText !== null} referenceElement={tipRef}>
	<span class="block py-1 text-xs text-neutral-600 dark:text-neutral-300">{tipText}</span>
</HoverTooltip>
