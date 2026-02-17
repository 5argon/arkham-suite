<script lang="ts">
	import { CardType, type SortingType, type DecodedMeta, type Card } from '@5argon/arkham-kohaku';
	import {
		divideHalf,
		recursivelyGroupCardItems,
		sortRecursivelyGroupedCards,
		countCards,
		type CardItem,
		type Grouping,
		deckListMainGrouping,
		deckListMainSorting,
		deckListSideGrouping,
		deckListSideSorting,
		deckListLinkedGrouping,
		deckListLinkedSorting,
		deckListExtraGrouping,
		deckListExtraSorting
	} from './card-item.js';
	import TableCardList from './TableCardList.svelte';
	import CardExtraInfo from './CardExtraInfo.svelte';
	import CardMagnifiedModal from './CardMagnifiedModal.svelte';
	import SectionSeparator from '../typography/SectionSeparator.svelte';
	import { cardCountResolver } from './card-item.js';
	import * as m from '../paraglide/messages.js';
	import { fly } from 'svelte/transition';

	interface Prop {
		mainCards: CardItem[];
		sideCards?: CardItem[];
		extraCards?: CardItem[];
		linkedCards?: CardItem[];
		/**
		 * Deck metadata for calculating customizable card XP levels
		 */
		meta?: DecodedMeta;
	}

	const { mainCards, sideCards, extraCards, linkedCards, meta }: Prop = $props();

	// Main cards - divided in half for two columns
	const recursiveGroups = $derived(recursivelyGroupCardItems(mainCards, deckListMainGrouping));
	const sorted = $derived(
		recursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListMainSorting))
	);
	const halved = $derived(divideHalf(sorted));

	const sideRecursiveGroups = $derived(
		sideCards ? recursivelyGroupCardItems(sideCards, deckListSideGrouping) : []
	);
	const sideSorted = $derived(
		sideRecursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListSideSorting))
	);

	const extraRecursiveGroups = $derived(
		extraCards ? recursivelyGroupCardItems(extraCards, deckListExtraGrouping) : []
	);
	const extraSorted = $derived(
		extraRecursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListExtraSorting))
	);

	// Linked cards - single column, not grouped
	const linkedRecursiveGroups = $derived(
		linkedCards ? recursivelyGroupCardItems(linkedCards, deckListLinkedGrouping) : []
	);
	const linkedSorted = $derived(
		linkedRecursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListLinkedSorting))
	);

	const mainCardCount = $derived(countCards(mainCards));
	const sideCardCount = $derived(countCards(sideCards));
	const extraCardCount = $derived(countCards(extraCards));
	const linkedCardCount = $derived(countCards(linkedCards));

	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);

	function handleCardClick(card: Card) {
		magnifiedCard = card;
		isModalShowing = true;
	}

	function handleModalClose(): void {
		isModalShowing = false;
		magnifiedCard = null;
	}
</script>

{#snippet cardDetail(card: CardItem)}
	<!-- Deck display list has dynamic details depending on card type. -->
	{#if card.card.cardType === CardType.Asset && card.card.permanent !== true}
		<CardExtraInfo card={card.card} extraInfo={['cost', 'slot', 'commit', 'soak']} />
	{/if}
	{#if card.card.cardType === CardType.Event}
		<CardExtraInfo card={card.card} extraInfo={['cost', 'commit']} />
	{/if}
	{#if card.card.cardType === CardType.Skill}
		<CardExtraInfo card={card.card} extraInfo={['commit']} />
	{/if}
{/snippet}

<div class="flex flex-wrap gap-4">
	<!-- Main Deck - Two columns -->
	<div class="flex flex-col gap-2">
		<div in:fly|global={{ duration: 150, x: -20, delay: 150 }}>
			<SectionSeparator
				title={m.card_deck_with_count({ cardCountText: cardCountResolver.resolve(mainCardCount) })}
				inner
			/>
		</div>
		<div class="flex flex-wrap gap-4">
			<div in:fly|global={{ duration: 150, x: -20, delay: 150 }}>
				<TableCardList
					groups={halved.left}
					afterRenders={[cardDetail]}
					{meta}
					onClick={handleCardClick}
				/>
			</div>
			<div in:fly|global={{ duration: 150, x: -20, delay: 200 }}>
				<TableCardList
					groups={halved.right}
					afterRenders={[cardDetail]}
					{meta}
					onClick={handleCardClick}
				/>
			</div>
		</div>
	</div>

	<!-- Side Deck - Single column -->
	{#if sideCards && sideCards.length > 0}
		<div in:fly|global={{ duration: 150, x: -20, delay: 250 }} class="flex flex-col gap-2">
			<SectionSeparator
				title={m.card_side_deck_with_count({
					cardCountText: cardCountResolver.resolve(sideCardCount)
				})}
				inner
			/>
			<div>
				<TableCardList
					groups={sideSorted}
					afterRenders={[cardDetail]}
					{meta}
					onClick={handleCardClick}
				/>
			</div>
		</div>
	{/if}

	<!-- Extra Deck - Single column -->
	{#if extraCards && extraCards.length > 0}
		<div in:fly|global={{ duration: 150, x: -20, delay: 300 }} class="flex flex-col gap-2">
			<SectionSeparator
				title={m.card_extra_deck_with_count({
					cardCountText: cardCountResolver.resolve(extraCardCount)
				})}
				inner
			/>
			<div>
				<TableCardList
					groups={extraSorted}
					afterRenders={[cardDetail]}
					{meta}
					onClick={handleCardClick}
				/>
			</div>
		</div>
	{/if}

	<!-- Linked Cards - Single column -->
	{#if linkedCards && linkedCards.length > 0}
		<div in:fly|global={{ duration: 150, x: -20, delay: 300 }} class="flex flex-col gap-2">
			<SectionSeparator
				title={m.card_linked_cards_with_count({
					cardCountText: cardCountResolver.resolve(linkedCardCount)
				})}
				inner
			/>
			<div>
				<TableCardList
					groups={linkedSorted}
					afterRenders={[cardDetail]}
					{meta}
					onClick={handleCardClick}
				/>
			</div>
		</div>
	{/if}
</div>

<CardMagnifiedModal card={magnifiedCard} isShowing={isModalShowing} onClose={handleModalClose} />
