<!--
@component
Use CardScanFullSmallGrid to display cards in the deck. 
It can group these cards for one level, then sort inside the group.
-->
<script lang="ts">
	import * as m from '../paraglide/messages.js';
	import SectionSeparator from '../typography/SectionSeparator.svelte';
	import CardScanFullSmallGrid from './CardScanFullSmallGrid.svelte';
	import Checkbox from '../form/Checkbox.svelte';
	import { fly } from 'svelte/transition';
	import {
		cardCountResolver,
		countCards,
		groupCardItems,
		sortCardItems,
		sortGroupedCards,
		type CardItem,
		type Grouping
	} from './card-item.js';
	import type { SortingType } from '@5argon/arkham-kohaku';
	import GroupingRender from './GroupingRender.svelte';

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
		/**
		 * Display a built in toolbar to change the display.
		 */
		toolbar?: {
			typeGrouped?: boolean;
			spreadCopies?: boolean;
			showCardNames?: boolean;
		};
	}

	const {
		mainCards,
		sideCards,
		extraCards,
		linkedCards,
		typeGrouped = $bindable(),
		spreadCopies = $bindable(),
		showCardNames = $bindable(),
		toolbar
	}: Prop = $props();

	let localTypeGrouped = $state(typeGrouped ?? false);
	let localSpreadCopies = $state(spreadCopies ?? false);
	let localShowCardNames = $state(showCardNames ?? false);

	let grouping = $state<Grouping>('default');
	let sortingOrder = $state<SortingType[]>(['class', 'type', 'name', 'level', 'position']);

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

	function spread(cards: CardItem[]): CardItem[] {
		const spreaded: CardItem[] = [];
		if (!localSpreadCopies) {
			for (const item of cards) {
				spreaded.push({ card: item.card, quantity: item.quantity, id: item.card.code });
			}
			return spreaded;
		} else {
			for (const item of cards) {
				for (let i = 0; i < item.quantity; i++) {
					if (item.quantity > 1) {
						spreaded.push({ card: item.card, quantity: 1, id: item.card.code + i });
					} else {
						spreaded.push({ card: item.card, quantity: 1, id: item.card.code });
					}
				}
			}
			return spreaded;
		}
	}

	const mainCardsSpread = $derived(spread(mainCards));
	const sideCardsSpread = $derived(sideCards ? spread(sideCards) : undefined);
	const extraCardsSpread = $derived(extraCards ? spread(extraCards) : undefined);
	const linkedCardsSpread = $derived(linkedCards ? spread(linkedCards) : undefined);

	const sortedMainCardsSpread = $derived(sortCardItems(mainCardsSpread, sortingOrder));
	const sortedSideCardsSpread = $derived(
		sideCardsSpread ? sortCardItems(sideCardsSpread, sortingOrder) : undefined
	);
	const sortedExtraCardsSpread = $derived(
		extraCardsSpread ? sortCardItems(extraCardsSpread, sortingOrder) : undefined
	);
	const sortedLinkedCardsSpread = $derived(
		linkedCardsSpread ? sortCardItems(linkedCardsSpread, sortingOrder) : undefined
	);

	const deckGroupedCards = $derived(groupCardItems(mainCardsSpread, grouping));
	const sortedDeckGroupedCards = $derived(sortGroupedCards(deckGroupedCards, sortingOrder));
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
{#if localTypeGrouped}
	{#each sortedDeckGroupedCards as group, i (group.name + i)}
		<GroupingRender {group} animationDelayIndex={i} />
		<div in:fly|global={{ duration: 200, x: -30, delay: 50 * i }}>
			<CardScanFullSmallGrid
				groups={[{ name: '', items: group.items }]}
				showCardName={localShowCardNames}
			/>
		</div>
	{/each}
{:else}
	{@render itemsRender(sortedMainCardsSpread, 0)}
{/if}

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
