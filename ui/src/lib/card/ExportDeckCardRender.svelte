<!--
@component
Export view showing deck cards in horizontal card format suitable for printing or sharing.
Shows two horizontal cards: one for main deck with banner, another for side/linked/extra cards.
-->
<script lang="ts">
	import type {
		Deck,
		CardResolver,
		LocalizationResolver,
		DecodedMeta
	} from '@5argon/arkham-kohaku';
	import { deck as deckUtility } from '@5argon/arkham-kohaku';
	import type { CardItem, RecursivelyGroupedCardItem } from './card-item.js';
	import { countCards, noMoreGroup, divideHalf, recursivelyGroupCardItems, sortRecursivelyGroupedCards, deckListMainGrouping, deckListMainSorting, deckListSideGrouping, deckListSideSorting, deckListLinkedGrouping, deckListLinkedSorting, deckListExtraGrouping, deckListExtraSorting } from './card-item.js';
	import HorizontalCardFrame from './HorizontalCardFrame.svelte';
	import DeckBanner from './DeckBanner.svelte';
	import DeckDisplayList from './DeckDisplayList.svelte';
	import DeckBannerSecondColumn from './DeckBannerSecondColumn.svelte';
	import CardSquare from './CardSquare.svelte';
	import Button from '../button/Button.svelte';
	import HelpParagraph from '../typography/HelpParagraph.svelte';
	import { FaIconType } from '../icon/index.js';
	import { getCardColorClassBackground, getCardColorClassBorder } from './coloring.js';
	import clsx from 'clsx';

	// Height calculation constants
	const CARD_HEIGHT_PX = 28;
	const DIVIDER_HEIGHT_PX = 35;
	const SECTION_SEPARATOR_HEIGHT_PX = 35;
	const FIRST_CARD_AVAILABLE_SPACE_PX = 500;
	const SECOND_CARD_AVAILABLE_SPACE_PX = 650;

	/**
	 * Calculate the height needed for a single column of grouped cards
	 */
	function calculateColumnHeight(groups: RecursivelyGroupedCardItem[]): number {
		let totalHeight = 0;
		
		function processGroup(group: RecursivelyGroupedCardItem, depth: number, groupIndex: number, totalGroupsAtDepth: number): void {
			// Add divider height if the group has a name and is at appropriate depth
			// Matches TableCardList logic: layer === 0 || (layer > 0 && layer < 2 && !onlyGroup)
			const onlyGroup = totalGroupsAtDepth === 1;
			if (group.name.length > 0 && (depth === 0 || (depth > 0 && depth < 2 && !onlyGroup))) {
				totalHeight += DIVIDER_HEIGHT_PX;
			}
			
			// Add 12px spacing between groups at depth >= 2 (after first group)
			// Matches TableCardList: {#if layer >= 2 && groupIdx > 0}
			if (depth >= 2 && groupIndex > 0) {
				totalHeight += 12;
			}
			
			// Process items
			const nestedGroups = group.items.filter((item) => !noMoreGroup(item));
			for (let i = 0; i < group.items.length; i++) {
				const item = group.items[i];
				if (noMoreGroup(item)) {
					// This is a card item
					totalHeight += CARD_HEIGHT_PX;
				} else {
					// This is a nested group
					const nestedGroupIndex = nestedGroups.indexOf(item);
					processGroup(item, depth + 1, nestedGroupIndex, nestedGroups.length);
				}
			}
		}
		
		for (let i = 0; i < groups.length; i++) {
			processGroup(groups[i], 0, i, groups.length);
		}
		
		return totalHeight;
	}

	/**
	 * Calculate the scale factor needed to fit content within available space
	 */
	function calculateScaleFactor(requiredHeight: number, availableSpace: number): number {
		if (requiredHeight <= availableSpace) {
			return 100; // No scaling needed
		}
		// Calculate scale percentage, round to 2 decimal places
		return Math.round((availableSpace / requiredHeight) * 10000) / 100;
	}

	/**
	 * Calculate the optimal scale for the main deck card
	 */
	function calculateMainDeckScale(mainCards: CardItem[]): number {
		if (!mainCards || mainCards.length === 0) return 100;
		
		const recursiveGroups = recursivelyGroupCardItems(mainCards, deckListMainGrouping);
		const sorted = recursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListMainSorting));
		const halved = divideHalf(sorted);
		
		const leftHeight = calculateColumnHeight(halved.left);
		const rightHeight = calculateColumnHeight(halved.right);
		const maxHeight = Math.max(leftHeight, rightHeight);
		
		return calculateScaleFactor(maxHeight, FIRST_CARD_AVAILABLE_SPACE_PX);
	}

	/**
	 * Calculate the optimal scale for the side/linked/extra deck card
	 * All sections stack vertically, so heights are added together
	 */
	function calculateSecondCardScale(
		sideCards?: CardItem[],
		linkedCards?: CardItem[],
		extraCards?: CardItem[]
	): number {
		let totalHeight = 0;
		
		// Calculate side deck height (two columns)
		if (sideCards && sideCards.length > 0) {
			const recursiveGroups = recursivelyGroupCardItems(sideCards, deckListSideGrouping);
			const sorted = recursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListSideSorting));
			const halved = divideHalf(sorted);
			
			const leftHeight = calculateColumnHeight(halved.left);
			const rightHeight = calculateColumnHeight(halved.right);
			// Section separator + gap-2 (8px) + max column height
			totalHeight += SECTION_SEPARATOR_HEIGHT_PX + 8 + Math.max(leftHeight, rightHeight);
		}
		
		// Calculate linked cards height (single column)
		if (linkedCards && linkedCards.length > 0) {
			const recursiveGroups = recursivelyGroupCardItems(linkedCards, deckListLinkedGrouping);
			const sorted = recursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListLinkedSorting));
			// Section separator + gap-2 (8px) + column height
			totalHeight += SECTION_SEPARATOR_HEIGHT_PX + 8 + calculateColumnHeight(sorted);
		}
		
		// Calculate extra deck height (single column)
		if (extraCards && extraCards.length > 0) {
			const recursiveGroups = recursivelyGroupCardItems(extraCards, deckListExtraGrouping);
			const sorted = recursiveGroups.map((group) => sortRecursivelyGroupedCards(group, deckListExtraSorting));
			// Section separator + gap-2 (8px) + column height
			totalHeight += SECTION_SEPARATOR_HEIGHT_PX + 8 + calculateColumnHeight(sorted);
		}
		
		if (totalHeight === 0) return 100;
		
		return calculateScaleFactor(totalHeight, SECOND_CARD_AVAILABLE_SPACE_PX);
	}

	interface Prop {
		deck: Deck;
		cardResolver: CardResolver;
		mainCards: CardItem[];
		sideCards?: CardItem[];
		linkedCards?: CardItem[];
		extraCards?: CardItem[];
		meta?: DecodedMeta;
		localizationResolver?: LocalizationResolver;
		languageCode?: string;
		onBack: () => void;
	}

	const {
		deck,
		cardResolver,
		mainCards,
		sideCards,
		linkedCards,
		extraCards,
		meta,
		localizationResolver,
		languageCode,
		onBack
	}: Prop = $props();

	const hasSideContent = $derived(
		(sideCards && sideCards.length > 0) ||
			(linkedCards && linkedCards.length > 0) ||
			(extraCards && extraCards.length > 0)
	);

	const forwardResult = $derived.by(() => {
		const latestDeck = deckUtility.forwardToLatest(deck);
		const forwarded = deckUtility.forwardDefault(latestDeck, cardResolver);
		return forwarded;
	});
	const deckLatestForwarded = $derived(forwardResult.deck);

	const bgColorClass = $derived(
		getCardColorClassBackground(deckLatestForwarded.investigator.cardClass)
	);
	const borderColorClass = $derived(getCardColorClassBorder(deckLatestForwarded.investigator));

	const mainCardCount = $derived(countCards(mainCards));
	const sideCardCount = $derived(countCards(sideCards ?? []));

	const frontInvestigator = $derived(
		deckLatestForwarded.meta.alternateFront ?? deckLatestForwarded.investigator
	);

	// Track if we're at lg breakpoint or above (where card proportions are maintained)
	let isLargeScreen = $state(false);
	
	$effect(() => {
		// Tailwind's lg breakpoint is 1024px
		const mediaQuery = window.matchMedia('(min-width: 1024px)');
		isLargeScreen = mediaQuery.matches;
		
		const handler = (e: MediaQueryListEvent) => {
			isLargeScreen = e.matches;
		};
		
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	});

	const mainDeckScale = $derived(isLargeScreen ? calculateMainDeckScale(mainCards) : 100);
	const secondCardScale = $derived(isLargeScreen ? calculateSecondCardScale(sideCards, linkedCards, extraCards) : 100);
</script>

<div class="flex flex-col gap-4">
	<!-- Back Button -->
	<div class="flex justify-center">
		<Button icon={FaIconType.Back} label="Full Deck View" onClick={onBack} />
	</div>

	<!-- Help Paragraph -->
	<HelpParagraph>
		<span class="lg:hidden"
			>A browser with bigger width is required to show proportionally correct card front and back.</span
		>
		<span class="hidden lg:inline"
			>The rendering below is proportionally correct to the card's size. You can screen capture to
			share or make a physical card.</span
		>
	</HelpParagraph>

	<!-- Main Card: Banner + Main Deck -->
	<HorizontalCardFrame {borderColorClass}>
		<div class="-m-2.5 flex h-[calc(100%+20px)] flex-col overflow-hidden">
			<!-- Colored Title Bar with Card Counts -->
			<div
				class={clsx(
					'flex shrink-0 items-center justify-between rounded-t-lg border-b-2 px-4 py-1 text-base leading-snug font-medium text-black dark:text-white',
					bgColorClass,
					borderColorClass
				)}
			>
				<div class="translate-y-0.5 truncate">{deckLatestForwarded.name}</div>
				<div class="ml-8 shrink-0 translate-y-0.5 py-0.5 text-sm">
					<span>Deck {mainCardCount}</span>
					{#if sideCardCount > 0}
						<span>· Side {sideCardCount}</span>
					{/if}
				</div>
			</div>

			<!-- Banner + Investigator CardSquare + Second Column -->
			<div class="flex shrink-0 items-center justify-center gap-4 px-4 py-2">
				<div class="hidden scale-180 lg:block">
					<CardSquare card={frontInvestigator} meta={deck.meta} />
				</div>
				<DeckBanner
					small
					hideTitle
					{deck}
					{cardResolver}
					{localizationResolver}
					{languageCode}
					mode="decklist"
				/>
				<div class="hidden lg:block">
					<DeckBannerSecondColumn deck={deckLatestForwarded} allowSideDeck />
				</div>
			</div>

			<div class="flex flex-1 items-center justify-center px-4 pb-2.5 origin-top" style:transform="scale({mainDeckScale / 100})">
				<DeckDisplayList {mainCards} {meta} hideTopics hideContainer />
			</div>
		</div>
	</HorizontalCardFrame>

	{#if hasSideContent}
		<HorizontalCardFrame {borderColorClass}>
			<div class="flex origin-top" style:transform="scale({secondCardScale / 100})">
				<DeckDisplayList
					mainCards={[]}
					{sideCards}
					{linkedCards}
					{extraCards}
					{meta}
					hideContainer
				/>
			</div>
		</HorizontalCardFrame>
	{/if}
</div>
