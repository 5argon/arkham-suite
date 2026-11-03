<!--
@component
A short list of cards, each with its quantity and an optional note at the right
end, such as when the card arrives.
-->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';

	import CardLine from './CardLine.svelte';

	export interface CardLineNote {
		card: Card;
		quantity: number;
		note?: string;
	}

	interface Prop {
		items: CardLineNote[];
	}
	const { items }: Prop = $props();
</script>

<ul class="flex flex-col gap-0.5">
	{#each items as item, i (item.card.code + i)}
		<li class="flex items-center justify-between gap-2">
			<span class="min-w-0">
				<CardLine card={item.card} quantity={item.quantity} />
			</span>
			{#if item.note}
				<span class="text-primary-700 dark:text-primary-300 shrink-0 text-xs font-semibold">
					{item.note}
				</span>
			{/if}
		</li>
	{/each}
</ul>
