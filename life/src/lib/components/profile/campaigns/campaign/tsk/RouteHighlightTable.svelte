<!-- @component Highlight rows, each ending in the route that achieved it; `cells` fills the columns between. -->
<script lang="ts" module>
	import type { TskRoute } from '$lib/campaign/campaigns/tsk/profile';

	export interface RouteHighlightRow {
		id: string;
		label: string;
		route: TskRoute | null;
		/** Dims the label when false. */
		lit?: boolean;
		/** Hovering the label shows it (Arkham markup). */
		description?: string;
	}
</script>

<script lang="ts" generics="T extends RouteHighlightRow">
	import type { Snippet } from 'svelte';
	import {
		HoverTip,
		HoverTipState,
		WidgetTable,
		type WidgetTableColumn
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import RoutingTrack from './RoutingTrack.svelte';

	let {
		rows,
		columns,
		cells,
		highlight
	}: {
		rows: T[];
		/** The label column, one per `cells` column, then the route column. */
		columns: WidgetTableColumn[];
		cells?: Snippet<[T]>;
		/** The scenario to emphasise in each route. */
		highlight?: string;
	} = $props();

	const tip = new HoverTipState();
</script>

<WidgetTable {columns} {rows} key={(r) => r.id}>
	{#snippet row(r)}
		<td
			class="{widgetTableCell} whitespace-nowrap {(r.lit ?? true)
				? 'font-semibold text-black dark:text-white'
				: 'text-primary-400'}"
		>
			{#if r.description}
				{@const description = r.description}
				<span
					role="note"
					class="cursor-help decoration-dotted underline-offset-2 hover:underline"
					onmouseenter={(e) => tip.showText(description, e)}
					onmouseleave={tip.hide}>{r.label}</span
				>
			{:else}
				{r.label}
			{/if}
		</td>
		{@render cells?.(r)}
		<td class={widgetTableCell}><RoutingTrack route={r.route} {highlight} /></td>
	{/snippet}
</WidgetTable>

<HoverTip {tip} markup />
