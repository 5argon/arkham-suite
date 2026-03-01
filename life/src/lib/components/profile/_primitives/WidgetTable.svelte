<!--
@component
Shared table chrome for widgets, so every in-widget table looks the same: a thin
uppercase header (bold `th`, per-column alignment) and bordered rows. The consumer
renders each row's cells in the `row` snippet using the exported `widgetTableCell`
class for consistent padding/alignment (cells can hold rich content — icons,
chips, routing tracks — so cells aren't data-driven). Used by City of the Elder
Things, the per-scenario tier tables, etc.
-->
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

<div class="overflow-x-auto" class:wt-compact={compact}>
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
</style>
