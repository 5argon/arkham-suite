<!-- 
 @component
 Popup component that displays filtered and fuzzy-searched card results.
 Intelligently positions itself to avoid viewport clipping.
 -->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';
	import clsx from 'clsx';
	import { SvelteMap } from 'svelte/reactivity';

	import CardLine from '../../card/CardLine.svelte';
	import type { CardFormFilter } from './types.js';
	import { createKeyboardNavigationHandler } from '../keyboard-navigation.js';

	interface Prop {
		/**
		 * All available cards.
		 */
		cards: Card[];

		/**
		 * Fuzzy search text.
		 */
		fuzzySearch: string;

		/**
		 * Optional filter to exclude cards.
		 */
		filter?: CardFormFilter;

		/**
		 * Currently selected index for keyboard navigation.
		 */
		selectedIndex: number;

		/**
		 * Callback when selected index changes.
		 */
		onIndexChange: (newIndex: number) => void;

		/**
		 * Callback when a card is selected.
		 */
		onSelect: (card: Card) => void;

		/**
		 * Element to anchor the popup to.
		 */
		anchorElement?: HTMLElement;

		/**
		 * Maximum number of results to display.
		 */
		maxResults?: number;
	}

	let {
		cards,
		fuzzySearch,
		filter,
		selectedIndex,
		onIndexChange,
		onSelect,
		anchorElement,
		maxResults = 50
	}: Prop = $props();

	let popupElement: HTMLDivElement;
	let scrollContainer: HTMLDivElement;
	let itemRefs = new SvelteMap<number, HTMLButtonElement>();
	let positionStyle = $state('');

	// Svelte action to set element references
	function setRef(node: HTMLButtonElement, index: number) {
		itemRefs.set(index, node);
		return {
			destroy() {
				itemRefs.delete(index);
			}
		};
	}

	// Fuzzy search configuration
	const fuse = $derived(
		new Fuse(cards, {
			keys: ['name', 'subname'],
			threshold: 0.2,
			isCaseSensitive: false,
			ignoreDiacritics: true,
			shouldSort: true,
		})
	);

	// Filtered and searched cards
	const filteredCardsResult = $derived.by(() => {
		let result = fuzzySearch ? fuse.search(fuzzySearch).map((x) => x.item) : cards;

		if (filter) {
			result = result.filter(filter);
		}

		const totalCount = result.length;
		const limited = result.slice(0, maxResults);

		return { cards: limited, totalCount, hasMore: totalCount > maxResults };
	});

	const filteredCards = $derived(filteredCardsResult.cards);

	// Calculate positioning
	onMount(() => {
		calculatePosition();
		window.addEventListener('resize', calculatePosition);
		return () => window.removeEventListener('resize', calculatePosition);
	});

	function calculatePosition() {
		if (!anchorElement || !popupElement) return;

		const anchorRect = anchorElement.getBoundingClientRect();
		const popupHeight = 300; // Approximate height of popup
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - anchorRect.bottom;
		const spaceAbove = anchorRect.top;

		// Prefer showing below, but if not enough space, show above
		if (spaceBelow >= popupHeight || spaceBelow > spaceAbove) {
			positionStyle = `top: 100%; margin-top: 0.25rem;`;
		} else {
			positionStyle = `bottom: 100%; margin-bottom: 0.25rem;`;
		}
	}

	// Auto-scroll to selected item - keeps it centered
	$effect(() => {
		if (scrollContainer && selectedIndex !== null && selectedIndex >= 0) {
			const selectedElement = itemRefs.get(selectedIndex);
			if (!selectedElement) return;

			const containerRect = scrollContainer.getBoundingClientRect();
			const itemRect = selectedElement.getBoundingClientRect();

			// Calculate positions relative to the container
			const itemRelativeTop = itemRect.top - containerRect.top + scrollContainer.scrollTop;
			const itemRelativeBottom = itemRelativeTop + itemRect.height;
			const containerHeight = scrollContainer.clientHeight;
			const currentScroll = scrollContainer.scrollTop;
			const containerMiddle = currentScroll + containerHeight / 2;

			// Scroll to keep item centered
			const itemMiddle = (itemRelativeTop + itemRelativeBottom) / 2;

			// Only scroll if item is not near the center
			const threshold = itemRect.height * 2; // Allow 2 items worth of drift before centering
			if (Math.abs(itemMiddle - containerMiddle) > threshold) {
				const targetScroll = itemMiddle - containerHeight / 2;
				scrollContainer.scrollTop = Math.max(0, targetScroll);
			}
		}
	});

	// Handle keyboard navigation
	const handleKeyDown = $derived(
		createKeyboardNavigationHandler({
			selectedIndex,
			items: filteredCards,
			isPopupVisible: true,
			onIndexChange,
			onSelect,
			onEscape: () => {}, // CardFormPopup doesn't handle escape, CardForm does
		})
	);
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
	bind:this={popupElement}
	class="bg-primary-50 dark:bg-primary-950 border-primary-300 dark:border-primary-700 absolute left-0 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded border shadow-lg"
	style={positionStyle}
>
	<div bind:this={scrollContainer} class="max-h-80 overflow-y-auto scroll-smooth">
		{#if filteredCards.length === 0}
			<div class="text-primary-600 dark:text-primary-400 p-4 text-center text-sm">
				No cards found
			</div>
		{:else}
			{#each filteredCards as card, i (card.code)}
				<button
					use:setRef={i}
					type="button"
					class={clsx(
						'hover:bg-primary-100 dark:hover:bg-primary-800 w-full p-2 text-left transition-colors',
						selectedIndex === i &&
							'bg-primary-200 dark:bg-primary-700'
					)}
					onmousedown={() => onSelect(card)}
					onmouseenter={() => onIndexChange(i)}
				>
					<CardLine {card} />
				</button>
			{/each}
		{/if}
	</div>

	{#if filteredCards.length > 0}
		<div
			class="border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 border-t px-3 py-1 text-right text-xs"
		>
			{#if filteredCardsResult.hasMore}
				{maxResults}+ results
			{:else}
				{filteredCardsResult.totalCount} result{filteredCardsResult.totalCount !== 1 ? 's' : ''}
			{/if}
		</div>
	{/if}
</div>
