<!-- @component The top decks by ally or accessory count: investigator, slot-card copies, and one square per card copy. -->
<script lang="ts">
	import { CardSquare } from '@5argon/arkham-life-ui';
	import { resolveCards } from '$lib/campaign/utils/card-filters';
	import type { DeckTopEntry } from '$lib/profile/profile-types';
	import { SectionLabel, WidgetEmpty, WidgetTable } from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let {
		title,
		rows,
		countLabel,
		itemsLabel
	}: {
		title: string;
		rows: DeckTopEntry[];
		countLabel: string;
		itemsLabel: string;
	} = $props();

	const copies = (cards: DeckTopEntry['cards']) =>
		resolveCards(cards.flatMap(({ code, qty }) => Array<string>(Math.max(0, qty)).fill(code)));
</script>

<div>
	<SectionLabel>{title}</SectionLabel>
	{#if rows.length}
		<WidgetTable
			columns={[
				{ label: '' },
				{ label: m.cards_top_col_investigator() },
				{ label: countLabel },
				{ label: itemsLabel }
			]}
			{rows}
		>
			{#snippet row(r, i)}
				<td class="{widgetTableCell} text-primary-500 whitespace-nowrap">{m.cards_top_rank({ n: i + 1 })}</td>
				<td class={widgetTableCell}>
					{#each resolveCards([r.inv]) as inv (inv.code)}<CardSquare card={inv} />{/each}
				</td>
				<td
					class="{widgetTableCell} text-secondary-700 dark:text-secondary-300 font-semibold tabular-nums"
				>
					{r.count}×
				</td>
				<td class={widgetTableCell}>
					<div class="flex flex-wrap gap-1">
						{#each copies(r.cards) as card, j (j)}<CardSquare {card} />{/each}
					</div>
				</td>
			{/snippet}
		</WidgetTable>
	{:else}
		<WidgetEmpty>{m.cards_top_empty()}</WidgetEmpty>
	{/if}
</div>
