<!-- @component The table look for widgets; cells come from the `row` snippet, styled with `widgetTableCell`. When the table would scroll sideways, its rows stack: each row's first cell on a line of its own, the other cells after it under their column labels (unlabelled when there is only one). -->
<script lang="ts" module>
	export interface WidgetTableColumn {
		label: string;
		align?: 'left' | 'center' | 'right';
	}
	/** Apply to each `<td>` rendered in the `row` snippet for consistent styling. */
	export const widgetTableCell = 'py-2 pr-3 align-top';
</script>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { stackWhenTooWide } from './stack-when-too-wide';

	let {
		columns,
		rows,
		row,
		key,
		compact = false,
	}: {
		columns: WidgetTableColumn[];
		rows: T[];
		/** Renders one row's `<td>` cells (use the {@link widgetTableCell} class). */
		row: Snippet<[T, number]>;
		/** Stable key per row (defaults to index). */
		key?: (item: T, i: number) => string | number;
		/** Tighter font + cell padding for long/dense tables (overrides `widgetTableCell` spacing). */
		compact?: boolean;
	} = $props();

	const alignClass = (a?: string) =>
		a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';
</script>

<div
	class="overflow-x-auto"
	class:wt-compact={compact}
	use:stackWhenTooWide={{
		className: 'wt-stacked',
		labels: columns.length > 2 ? columns.map((c) => c.label) : []
	}}
>
	<table class="w-full border-collapse {compact ? 'text-xs' : 'text-sm'}">
		<thead>
			<tr class="text-primary-500 dark:text-primary-400 tracking-wide uppercase {compact ? 'text-[0.65rem]' : 'text-xs'}">
				{#each columns as c, i (i)}
					<th class="{compact ? 'py-0.5 pr-2' : 'py-1 pr-3'} font-semibold {alignClass(c.align)}">{c.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as item, i (key ? key(item, i) : i)}
				<tr class="border-primary-100 dark:border-primary-800 border-t">
					{@render row(item, i)}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- `compact` tightens the consumer's own `<td>` cells (which carry the fixed `widgetTableCell`
     spacing) via a higher-specificity descendant rule, so callers need no change. -->
<style>
	.wt-compact :global(td) {
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
		padding-right: 0.5rem;
	}

	/* Stacked rows: the first cell is the row's heading; the rest flow after it, labelled. */
	:global(.wt-stacked > table),
	:global(.wt-stacked > table > tbody) {
		display: block;
	}
	:global(.wt-stacked > table > thead) {
		display: none;
	}
	:global(.wt-stacked > table > tbody > tr) {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		column-gap: 1.25rem;
		row-gap: 0.375rem;
		padding: 0.5rem 0;
	}
	:global(.wt-stacked > table > tbody > tr > td) {
		display: block;
		padding: 0;
		text-align: start;
	}
	:global(.wt-stacked > table > tbody > tr > td:first-child) {
		flex-basis: 100%;
	}
	:global(.wt-stacked > table > tbody > tr > td:not(:first-child)[data-label]:not([data-label=''])::before) {
		content: attr(data-label);
		display: block;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-primary-500);
	}
</style>
