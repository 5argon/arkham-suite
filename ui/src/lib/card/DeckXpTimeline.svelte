<script lang="ts">
	import { linearizeDeck, type Deck } from '@5argon/arkham-kohaku';
	import { deck as deckUtil } from '@5argon/arkham-kohaku';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		deck: Deck;
	}
	const { deck }: Prop = $props();
	const linearized = $derived(linearizeDeck(deck));
</script>

{#snippet deckXpNode(deck: Deck)}
	{@const deckXp = deckUtil.calculateDeckXp(deck)}
	<span
		class="dark:bg-primary-800 bg-primary-100 flex w-6 flex-col items-center justify-center rounded leading-none"
	>
		<div class="deck-xp">{deckXp}</div>
		<div class="available-xp whitespace-nowrap">
			<span>{(deck.xp ?? 0) + (deck.xpAdjustment ?? 0)}</span>
			{#if deck.xpSpent}
				<span> - {deck.xpSpent}</span>
			{/if}
		</div>
	</span>
{/snippet}

{#snippet arrow(gainedXp: number)}
	<div class="flex flex-col items-center justify-center">
		<div class="text-primary-200 dark:text-primary-800 arrow">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M 2 12 h 14" />
				<path d="M 18 7 l 5 5 -5 5" />
			</svg>
		</div>
		<div
			class="text-primary-300 dark:text-primary-600 arrow-gain-xp cursor-default leading-none select-none"
		>
			+{gainedXp}
		</div>
	</div>
{/snippet}

<div class="flex h-full items-center justify-center gap-1 text-black dark:text-white">
	<span
		class="dark:bg-primary-800 bg-primary-100 hidden flex-col items-center justify-center rounded px-2 leading-none sm:flex"
	>
		<div class="deck-xp text-nowrap">{m.card_deck_experience()}</div>
		<div class="available-xp">
			{m.card_xp_available() + ' - ' + m.card_xp_spent()}
		</div>
	</span>
	{#each linearized as d, i (i)}
		{@render deckXpNode(d)}
		{#if i < linearized.length - 1}
			{@const nextDeck = linearized[i + 1]}
			{@const gainedXp =
				(nextDeck.xp ?? 0) +
				(nextDeck.xpAdjustment ?? 0) -
				((d.xp ?? 0) + (d.xpAdjustment ?? 0) - (d.xpSpent ?? 0))}
			{@render arrow(gainedXp)}
		{/if}
	{/each}
</div>

<style>
	.deck-xp {
		font-size: 0.75rem;
	}

	.available-xp {
		font-size: 0.4rem;
	}

	.arrow svg {
		width: 10px;
	}

	.arrow-gain-xp {
		font-size: 0.4rem;
	}
</style>
