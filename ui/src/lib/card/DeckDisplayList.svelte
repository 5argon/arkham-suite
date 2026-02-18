<script lang="ts">
	import { CardType, type DecodedMeta, type Card } from '@5argon/arkham-kohaku';
	import {
		divideHalf,
		recursivelyGroupCardItems,
		sortRecursivelyGroupedCards,
		countCards,
		type CardItem,
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
	import BorderedContainer from '../container/BorderedContainer.svelte';

	interface Prop {
		mainCards: CardItem[];
		sideCards?: CardItem[];
		extraCards?: CardItem[];
		linkedCards?: CardItem[];
		/**
		 * Deck metadata for calculating customizable card XP levels
		 */
		meta?: DecodedMeta;

		/**
		 * When true, hides all section separators (Deck, Side Deck, etc.)
		 */
		hideTopics?: boolean;

		hideContainer?: boolean;

		/**
		 * When true, centers the content horizontally
		 */
		centered?: boolean;

		hideDetails?: boolean;

		/**
		 * When true, disables card hover effects and click interactions
		 */
		disableInteractions?: boolean;

		/**
		 * When true, disables dividing cards into left/right halves (shows single column)
		 */
		noHalf?: boolean;
	}

	const {
		mainCards,
		sideCards,
		extraCards,
		linkedCards,
		meta,
		hideTopics = false,
		hideContainer = false,
		centered = false,
		hideDetails = false,
		disableInteractions = false,
		noHalf = false
	}: Prop = $props();

	const recursiveGroups = $derived(recursivelyGroupCardItems(mainCards, deckListMainGrouping));
	const sorted = $derived(
		recursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListMainSorting))
	);
	const halved = $derived(noHalf ? null : divideHalf(sorted));

	const sideRecursiveGroups = $derived(
		sideCards ? recursivelyGroupCardItems(sideCards, deckListSideGrouping) : []
	);
	const sideSorted = $derived(
		sideRecursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListSideSorting))
	);
	const sideHalved = $derived(noHalf ? null : divideHalf(sideSorted));

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
	{#if !hideDetails}
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
	{/if}
{/snippet}

{#snippet content()}
	<div class="flex flex-col flex-wrap gap-2" class:justify-center={centered}>
		<!-- Main Deck - Single or Two columns -->
		{#if mainCards && mainCards.length > 0}
			<div class="flex flex-col gap-2">
				{#if !hideTopics}
					<div in:fly|global={{ duration: 150, x: -20, delay: 150 }}>
						<SectionSeparator
							title={m.card_deck_with_count({
								cardCountText: cardCountResolver.resolve(mainCardCount)
							})}
							inner
						/>
					</div>
				{/if}
				{#if halved}
					<!-- Two column layout -->
					<div class="flex flex-wrap gap-4">
						<div in:fly|global={{ duration: 150, x: -20, delay: 150 }}>
							<TableCardList
								groups={halved.left}
								afterRenders={[cardDetail]}
								{meta}
								onClick={disableInteractions ? undefined : handleCardClick}
								hideCardTypeIcon={hideDetails}
							/>
						</div>
						<div in:fly|global={{ duration: 150, x: -20, delay: 200 }}>
							<TableCardList
								groups={halved.right}
								afterRenders={[cardDetail]}
								{meta}
								onClick={disableInteractions ? undefined : handleCardClick}
								hideCardTypeIcon={hideDetails}
							/>
						</div>
					</div>
				{:else}
					<!-- Single column layout -->
					<div in:fly|global={{ duration: 150, x: -20, delay: 150 }}>
						<TableCardList
							groups={sorted}
							afterRenders={[cardDetail]}
							{meta}
							onClick={disableInteractions ? undefined : handleCardClick}
							hideCardTypeIcon={hideDetails}
						/>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Side Deck - Single or Two columns -->
		{#if sideCards && sideCards.length > 0}
			<div in:fly|global={{ duration: 150, x: -20, delay: 250 }} class="flex flex-col gap-2">
				{#if !hideTopics}
					<SectionSeparator
						title={m.card_side_deck_with_count({
							cardCountText: cardCountResolver.resolve(sideCardCount)
						})}
						inner
					/>
				{/if}
				{#if sideHalved}
					<!-- Two column layout -->
					<div class="flex flex-wrap gap-4">
						<div>
							<TableCardList
								groups={sideHalved.left}
								afterRenders={[cardDetail]}
								{meta}
								onClick={disableInteractions ? undefined : handleCardClick}
								hideCardTypeIcon={hideDetails}
							/>
						</div>
						<div>
							<TableCardList
								groups={sideHalved.right}
								afterRenders={[cardDetail]}
								{meta}
								onClick={disableInteractions ? undefined : handleCardClick}
								hideCardTypeIcon={hideDetails}
							/>
						</div>
					</div>
				{:else}
					<!-- Single column layout -->
					<div>
						<TableCardList
							groups={sideSorted}
							afterRenders={[cardDetail]}
							{meta}
							onClick={disableInteractions ? undefined : handleCardClick}
							hideCardTypeIcon={hideDetails}
						/>
					</div>
				{/if}
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
						onClick={disableInteractions ? undefined : handleCardClick}
						hideCardTypeIcon={hideDetails}
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
						onClick={disableInteractions ? undefined : handleCardClick}
						hideCardTypeIcon={hideDetails}
					/>
				</div>
			</div>
		{/if}
	</div>
{/snippet}

<div class="flex" class:justify-center={centered}>
	{#if hideContainer}
		{@render content()}
	{:else}
		<BorderedContainer>
			{@render content()}
		</BorderedContainer>
	{/if}
</div>

<CardMagnifiedModal card={magnifiedCard} isShowing={isModalShowing} onClose={handleModalClose} />
