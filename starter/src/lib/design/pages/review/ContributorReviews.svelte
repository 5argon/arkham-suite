<!--
@component
Everything one person has said about cards. Picking a card narrows it down, and typing only searches
for that card, since there can be hundreds of rows. Only the newest are on the page at first, the
rest a press away, since every row is a lot of page.
-->
<script lang="ts">
	import { snapshot } from '$app/navigation';
	import type { Card } from '@5argon/arkham-kohaku';
	import { Button, CardFormSingle, CardLine, ReviewList, ReviewRow } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import type { ContributorReviewRow } from '$lib/server/reviews';

	interface Prop {
		rows: ContributorReviewRow[];
	}
	const { rows }: Prop = $props();

	const cards = $derived.by(() => {
		const byCode: Record<string, Card> = {};
		for (const { card } of rows) if (card) byCode[card.code] ??= card;
		return Object.values(byCode);
	});

	let pickedCode = $state<string | null>(null);
	snapshot({
		id: 'contributor-review-card',
		capture: () => pickedCode,
		restore: (value) => (pickedCode = value)
	});

	/**
	 * How many rows each press of the button adds.
	 */
	const pageSize = 50;
	let shownCount = $state(pageSize);
	snapshot({
		id: 'contributor-review-shown',
		capture: () => shownCount,
		restore: (value) => (shownCount = value)
	});

	const picked = $derived(cards.find((card) => card.code === pickedCode) ?? null);
	const matching = $derived(picked ? rows.filter((row) => row.card?.code === picked.code) : rows);
	const shown = $derived(matching.slice(0, shownCount));
</script>

<div class="mb-3 flex flex-wrap items-end gap-2">
	<CardFormSingle
		{cards}
		label={m.review_search_label()}
		onSelect={(card) => (pickedCode = card.code)}
		selectedCard={picked}
	/>
	{#if picked}
		<Button label={m.review_search_clear()} onClick={() => (pickedCode = null)} />
	{/if}
</div>

{#if shown.length > 0}
	<ReviewList>
		{#each shown as row, i (`${row.href ?? row.entry.id}-${i}`)}
			{#if row.card}
				{@const card = row.card}
				<ReviewRow entry={row.entry} href={row.href}>
					{#snippet lead()}
						<CardLine {card} hideQuantity />
					{/snippet}
				</ReviewRow>
			{:else}
				<ReviewRow entry={row.entry} href={row.href} />
			{/if}
		{/each}
	</ReviewList>
	{#if matching.length > shown.length}
		<div class="mt-2 flex justify-center">
			<Button
				label={m.review_show_more({ count: Math.min(pageSize, matching.length - shown.length) })}
				onClick={() => (shownCount += pageSize)}
			/>
		</div>
	{/if}
{/if}
