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
	import QRCode from 'qrcode';
	import type { CardItem, RecursivelyGroupedCardItem } from './card-item.js';
	import {
		countCards,
		noMoreGroup,
		divideHalf,
		recursivelyGroupCardItems,
		sortRecursivelyGroupedCards,
		deckListMainGrouping,
		deckListMainSorting,
		deckListSideGrouping,
		deckListSideSorting,
		deckListLinkedGrouping,
		deckListLinkedSorting,
		deckListExtraGrouping,
		deckListExtraSorting
	} from './card-item.js';
	import HorizontalCardFrame from './HorizontalCardFrame.svelte';
	import DeckBanner from './DeckBanner.svelte';
	import DeckDisplayList from './DeckDisplayList.svelte';
	import Button from '../button/Button.svelte';
	import Checkbox from '../form/Checkbox.svelte';
	import HelpParagraph from '../typography/HelpParagraph.svelte';
	import { FaIconType } from '../icon/index.js';
	import { getCardColorClassBackground, getCardColorClassBorder } from './coloring.js';
	import clsx from 'clsx';
	import * as m from '../paraglide/messages.js';

	// Height calculation constants
	const CARD_HEIGHT_PX = 28;
	const DIVIDER_HEIGHT_PX = 35;
	const GAP = 8;
	const SECTION_SEPARATOR_HEIGHT_PX = 33;
	const FIRST_CARD_AVAILABLE_SPACE_PX = 360;
	const SECOND_CARD_AVAILABLE_SPACE_PX = 440;

	/**
	 * Calculate the height needed for a single column of grouped cards
	 */
	function calculateColumnHeight(groups: RecursivelyGroupedCardItem[]): number {
		let totalHeight = 0;

		function processGroup(
			group: RecursivelyGroupedCardItem,
			depth: number,
			groupIndex: number,
			totalGroupsAtDepth: number
		): void {
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
		const sorted = recursiveGroups.map((group) =>
			sortRecursivelyGroupedCards(group, deckListMainSorting)
		);
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

		// Gap depends on how many sections we have.
		// Just Side Card : 1 gap.
		// Side and Linked cards: 3 gaps.
		// Each section has its own gap to its cards, between sections one more gap is added.
		const sections = [sideCards, linkedCards, extraCards].filter(
			(section) => section && section.length > 0
		);
		const totalGaps = sections.length > 0 ? (sections.length - 1) * GAP + sections.length * GAP : 0;
		totalHeight += totalGaps;

		// Calculate side deck height (single column with noHalf)
		if (sideCards && sideCards.length > 0) {
			const recursiveGroups = recursivelyGroupCardItems(sideCards, deckListSideGrouping);
			const sorted = recursiveGroups.map((group) =>
				sortRecursivelyGroupedCards(group, deckListSideSorting)
			);

			// Section separator + gap-2 (8px) + column height
			totalHeight += SECTION_SEPARATOR_HEIGHT_PX + calculateColumnHeight(sorted);
		}

		// Calculate linked cards height (single column)
		if (linkedCards && linkedCards.length > 0) {
			const recursiveGroups = recursivelyGroupCardItems(linkedCards, deckListLinkedGrouping);
			const sorted = recursiveGroups.map((group) =>
				sortRecursivelyGroupedCards(group, deckListLinkedSorting)
			);
			// Section separator + gap-2 (8px) + column height
			totalHeight += SECTION_SEPARATOR_HEIGHT_PX + calculateColumnHeight(sorted);
		}

		// Calculate extra deck height (single column)
		if (extraCards && extraCards.length > 0) {
			const recursiveGroups = recursivelyGroupCardItems(extraCards, deckListExtraGrouping);
			const sorted = recursiveGroups.map((group) =>
				sortRecursivelyGroupedCards(group, deckListExtraSorting)
			);
			// Section separator + gap-2 (8px) + column height
			totalHeight += SECTION_SEPARATOR_HEIGHT_PX + calculateColumnHeight(sorted);
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
		/**
		 * Share URL for the deck QR code.
		 * If not provided, QR code will not be generated.
		 */
		shareUrl?: string;
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
		onBack,
		shareUrl
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
	const deckXp = $derived(deckUtility.calculateDeckXp(deckLatestForwarded));

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
	const secondCardScale = $derived(
		isLargeScreen ? calculateSecondCardScale(sideCards, linkedCards, extraCards) : 100
	);

	// Generate QR code for deck sharing
	let qrCodeDataUrl = $state<string>('');
	let showQrCode = $state(false);

	$effect(() => {
		if (shareUrl) {
			QRCode.toDataURL(shareUrl, {
				errorCorrectionLevel: 'L',
				margin: 1,
				width: 500,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			})
				.then((url) => {
					qrCodeDataUrl = url;
				})
				.catch((err) => {
					console.error('Failed to generate QR code:', err);
				});
		}
	});
</script>

<div class="flex flex-col">
	<!-- Back Button -->
	<div class="flex justify-center">
		<Button icon={FaIconType.Back} label="Full Deck View" onClick={onBack} />
	</div>

	<!-- Help Paragraph -->
	<HelpParagraph>
		The Deck-Card attempts to fit any deck inside a fixed frame. This allow you to screencap it to
		save or share the deck as an image of predictable size. While most conventional decks should
		work, I expect some outliers to have some issues. The Side Deck and other cards goes into a
		second card below.
	</HelpParagraph>

	<div class="lg:hidden">
		<HelpParagraph>
			<strong>CURRENTLY THE CARD SHAPE IS RELAXED :</strong> Use a browser with bigger width to show proportionally
			correct card front and back with bleed area.
		</HelpParagraph>
	</div>
	<div class="hidden lg:block">
		<HelpParagraph>
			The shape here is also proportionally correct to the real card size. If for some reason you
			would like to make a physical card out of it, it is recommended to use the light theme and the
			rounded border is intended to be cut lines. Area outside of it are bleeds to discard.
		</HelpParagraph>
	</div>

	<div class="flex flex-col gap-4">
		<!-- Main Card: Banner + Main Deck -->
		<HorizontalCardFrame {borderColorClass} {bgColorClass}>
			{#snippet top()}
				<div
					class={clsx(
						'flex shrink-0 flex-col items-center justify-between gap-1 px-8 py-1 text-base leading-snug font-medium text-black lg:flex-row dark:text-white'
					)}
				>
					<div
						class={clsx(
							'dark:bg-primary-900 w-full flex-1 translate-y-0.5 truncate rounded border bg-white px-2 text-center shadow lg:text-left',
							borderColorClass
						)}
					>
						{deckLatestForwarded.name}
					</div>
					<div
						class={clsx(
							'dark:bg-primary-900 shrink-0 translate-y-0.5 rounded border bg-white px-2 text-sm shadow',
							borderColorClass
						)}
					>
						<span>Deck {mainCardCount}</span>
						{#if sideCardCount > 0}
							<span>· Side {sideCardCount}</span>
						{/if}
						{#if deckXp > 0}
							<span>· XP {deckXp}</span>
						{/if}
					</div>
				</div>
			{/snippet}
			{#snippet bottom()}
				<div class="flex items-center justify-center px-4 py-2">
					<DeckBanner
						small
						hideTitle
						smallSingleLine
						{deck}
						{cardResolver}
						{localizationResolver}
						{languageCode}
						mode="decklist"
					/>
				</div>
				<div class="flex-1 origin-top px-4 pb-2.5" style:transform="scale({mainDeckScale / 100})">
					<DeckDisplayList
						hideDetails
						{mainCards}
						{meta}
						hideTopics
						hideContainer
						centered
						disableInteractions
					/>
				</div>
			{/snippet}
		</HorizontalCardFrame>

		{#if hasSideContent}
			<HorizontalCardFrame {borderColorClass} {bgColorClass}>
				<div class="flex h-full flex-col gap-2 px-8 py-2 lg:flex-row">
					<!-- Left side: DeckDisplayList with noHalf -->
					<div class="origin-top" style:transform="scale({secondCardScale / 100})">
						<DeckDisplayList
							mainCards={[]}
							{sideCards}
							{linkedCards}
							{extraCards}
							{meta}
							hideContainer
							hideDetails
							disableInteractions
							noHalf
						/>
					</div>

					<div class="flex items-center justify-center">
						<!-- Right side: QR Code -->
						{#if qrCodeDataUrl && showQrCode}
							<img
								src={qrCodeDataUrl}
								alt="Deck QR Code"
								class="max-w-50 lg:w-full lg:max-w-full"
							/>
						{/if}
					</div>
				</div>
			</HorizontalCardFrame>
			<!-- QR Code Checkbox -->
			{#if shareUrl}
				<div class="flex items-center justify-center">
					<Checkbox label={m.card_add_qr_code()} bind:checked={showQrCode} />
				</div>
				<div class="flex flex-col gap-1">
					{#if showQrCode}
						<HelpParagraph>
							{m.card_qr_code_explanation()}
						</HelpParagraph>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>
