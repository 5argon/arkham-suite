<!--
@component
Use CardScanFullSmallGrid to display cards in the deck. 
It can group these cards for one level, then sort inside the group.
-->
<script lang="ts">
	import * as m from '../paraglide/messages.js';
	import SectionSeparator from '../typography/SectionSeparator.svelte';
	import CardScanFullSmallGrid from './CardScanFullSmallGrid.svelte';
	import { fly } from 'svelte/transition';
	import {
		cardCountResolver,
		countCards,
		sortCardItems,
		type CardItem,
		deckGridMainSorting,
		deckGridSideSorting,
		deckGridExtraSorting,
		deckGridLinkedSorting
	} from './card-item.js';
	import type { SortingType } from '@5argon/arkham-kohaku';

	interface Prop {
		mainCards: CardItem[];
		sideCards?: CardItem[];
		extraCards?: CardItem[];
		linkedCards?: CardItem[];

		/**
		 * Bindable, toolbar can change this.
		 */
		typeGrouped?: boolean;
		/**
		 * Bindable, toolbar can change this.
		 */
		spreadCopies?: boolean;
		/**
		 * Bindable, toolbar can change this.
		 */
		showCardNames?: boolean;
	}

	const {
		mainCards,
		sideCards,
		extraCards,
		linkedCards,
		typeGrouped = $bindable(),
		spreadCopies = $bindable(),
		showCardNames = $bindable(),
	}: Prop = $props();

	const deckCardCountText = $derived(cardCountResolver.resolve(countCards(mainCards)));
	const sideCardCountText = $derived(cardCountResolver.resolve(countCards(sideCards)));
	const extraCardCountText = $derived(cardCountResolver.resolve(countCards(extraCards)));
	const linkedCardCountText = $derived(cardCountResolver.resolve(countCards(linkedCards)));

	const deckSectionText = $derived(m.card_deck_with_count({ cardCountText: deckCardCountText }));
	const sideDeckSectionText = $derived(
		m.card_side_deck_with_count({ cardCountText: sideCardCountText })
	);
	const extraDeckSectionText = $derived(
		m.card_extra_deck_with_count({
			cardCountText: extraCardCountText
		})
	);
	const linkedDeckSectionText = $derived(
		m.card_linked_cards_with_count({
			cardCountText: linkedCardCountText
		})
	);

	const sortedMainCardsSpread = $derived(sortCardItems(mainCards, deckGridMainSorting));
	const sortedSideCardsSpread = $derived(
		sideCards ? sortCardItems(sideCards, deckGridSideSorting) : undefined
	);
	const sortedExtraCardsSpread = $derived(
		extraCards ? sortCardItems(extraCards, deckGridExtraSorting) : undefined
	);
	const sortedLinkedCardsSpread = $derived(
		linkedCards ? sortCardItems(linkedCards, deckGridLinkedSorting) : undefined
	);
</script>

{#snippet itemsRender(cards: CardItem[], animationDelayIndex: number)}
	<div in:fly|global={{ duration: 200, x: -30, delay: 50 * animationDelayIndex }}>
		<CardScanFullSmallGrid groups={[{ name: '', items: cards }]} showCardName={true} />
	</div>
{/snippet}

{#snippet sectionSeparator(text: string)}
	<SectionSeparator title={text} inner />
{/snippet}

{@render sectionSeparator(deckSectionText)}
{@render itemsRender(sortedMainCardsSpread, 0)}

{#if sortedSideCardsSpread && sortedSideCardsSpread.length > 0}
	{@render sectionSeparator(sideDeckSectionText)}
	{@render itemsRender(sortedSideCardsSpread, 1)}
{/if}

{#if sortedExtraCardsSpread && sortedExtraCardsSpread.length > 0}
	{@render sectionSeparator(extraDeckSectionText)}
	{@render itemsRender(sortedExtraCardsSpread, 2)}
{/if}

{#if sortedLinkedCardsSpread && sortedLinkedCardsSpread.length > 0}
	{@render sectionSeparator(linkedDeckSectionText)}
	{@render itemsRender(sortedLinkedCardsSpread, 3)}
{/if}
