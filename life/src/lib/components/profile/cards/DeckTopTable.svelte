<!--
@component
A "Top decks" table for the Charisma & Relic Hunter widget: ranks deck entries (already
sorted + sliced), each row showing the rank, the deck's investigator, the slot-card
copies it ran (1× / 2×), and the ally / accessory cards — one CardSquare per copy.
-->
<script lang="ts">
	import { CardSquare } from '@5argon/arkham-life-ui';
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import type { DeckTopEntry } from '$lib/profile/profile-types';
	import WidgetTable, {
		widgetTableCell
	} from '$lib/components/profile/_primitives/WidgetTable.svelte';

	let {
		title,
		rows,
		byCode,
		countLabel,
		itemsLabel
	}: {
		title: string;
		rows: DeckTopEntry[];
		byCode: Map<string, Card>;
		/** Header for the slot-card count column (e.g. "Charisma"). */
		countLabel: string;
		/** Header for the cards column (e.g. "Allies"). */
		itemsLabel: string;
	} = $props();

	const RANK = ['1st', '2nd', '3rd'];
	/** Expand {code, qty} pairs into one code per copy (so each copy is its own square). */
	const expand = (cards: { code: CardCode; qty: number }[]): CardCode[] =>
		cards.flatMap(({ code, qty }) => Array<CardCode>(Math.max(0, qty)).fill(code));
</script>

<div class="flex flex-col gap-1.5">
	<p class="text-primary-500 text-xs font-medium">{title}</p>
	{#if rows.length}
		<WidgetTable
			columns={[
				{ label: '' },
				{ label: 'Investigator' },
				{ label: countLabel },
				{ label: itemsLabel }
			]}
			{rows}
			key={(_, i) => i}
		>
			{#snippet row(r, i)}
				<td class="{widgetTableCell} text-primary-500 text-sm whitespace-nowrap">
					{RANK[i] ?? `${i + 1}th`}
				</td>
				<td class={widgetTableCell}>
					{#if byCode.get(r.inv)}
						<CardSquare card={byCode.get(r.inv)!} />
					{/if}
				</td>
				<td
					class="{widgetTableCell} text-secondary-700 dark:text-secondary-300 font-semibold tabular-nums"
				>
					{r.count}×
				</td>
				<td class={widgetTableCell}>
					<div class="flex flex-wrap gap-1">
						{#each expand(r.cards) as code, j (j)}
							{#if byCode.get(code)}
								<CardSquare card={byCode.get(code)!} />
							{/if}
						{/each}
					</div>
				</td>
			{/snippet}
		</WidgetTable>
	{:else}
		<p class="text-primary-400 text-xs italic">No qualifying decks yet.</p>
	{/if}
</div>
