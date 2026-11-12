<!--
@component
The second column of DeckBanner showing XP, deck utilization, interesting cards, and permanents.
-->
<script lang="ts">
	import type { Deck, Card } from '@5argon/arkham-kohaku';
	import { card } from '@5argon/arkham-kohaku';
	import { calculateDeckXp } from '@5argon/arkham-kohaku/src/utility/deck';
	import CardSquare from './CardSquare.svelte';
	import CardStrip from './CardStrip.svelte';
	import DeckUtilization from './DeckUtilization.svelte';
	import EnvironmentPoint from '../environment/EnvironmentPoint.svelte';
	import type { EnvironmentDisplay } from '../environment/environment.js';
	import { findLeftSideSplashes } from './DeckSpecificInformation.svelte';

	interface Prop {
		deck: Deck;
		allowSideDeck?: boolean;
		/**
		 * The point in time the deck is based on, shown after the cards it uses.
		 */
		environment?: EnvironmentDisplay;
		onCardHover?: (card: Card, event: MouseEvent) => void;
		onCardLeave?: () => void;
	}

	const { deck, allowSideDeck = false, environment, onCardHover, onCardLeave }: Prop = $props();

	const deckXp = $derived(calculateDeckXp(deck));
	const visibleOnLeftSide = $derived(findLeftSideSplashes(deck).visibleCards.map((x) => x.code));
	const interestingCards = $derived(
		card.getInterestingCards(deck, 5, allowSideDeck, visibleOnLeftSide)
	);
	const interestingPermanents = $derived(
		card.getInterestingPermanentCards(deck, 3, allowSideDeck, visibleOnLeftSide)
	);
</script>

<div class="flex flex-col items-center gap-1 @min-[500px]:basis-60">
	<!-- The environment keeps to the right; the icons center in what's left. -->
	<div class="flex w-full items-center">
		<div class="flex min-w-0 flex-1 items-center justify-center">
			{#if deckXp > 0}
				<div
					class="bg-primary-100 text-primary-900 mr-1 flex flex-col items-center justify-center rounded p-1 text-sm"
				>
					<span class="text-[0.5rem] leading-none">XP</span><span class="leading-none"
						>{deckXp}</span
					>
				</div>
			{/if}
			<DeckUtilization {deck} {allowSideDeck} />
		</div>
		{#if environment}
			<span class="ml-2 shrink-0"><EnvironmentPoint {environment} subject="deck" /></span>
		{/if}
	</div>
	<div class="flex justify-center gap-1">
		{#each interestingCards as card, i (i)}
			<div
				class="shrink-0"
				onmouseenter={(e) => onCardHover?.(card, e)}
				onmouseleave={onCardLeave}
				role="button"
				tabindex="0"
			>
				<CardSquare {card} meta={deck.meta} />
			</div>
		{/each}
	</div>
	{#if interestingPermanents.length > 0}
		<div class="flex justify-center gap-1">
			{#each interestingPermanents as card, i (i)}
				<div
					class="shrink-0"
					onmouseenter={(e) => onCardHover?.(card, e)}
					onmouseleave={onCardLeave}
					role="button"
					tabindex="0"
				>
					<CardStrip {card} />
				</div>
			{/each}
		</div>
	{/if}
</div>
