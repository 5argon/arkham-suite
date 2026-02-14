<!-- 
 @component
 A reusable searchable dropdown component with keyboard navigation.
 Supports fuzzy search, filtering, and intelligent positioning.
 -->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import clsx from 'clsx';
	import Fuse from 'fuse.js';
	import { SvelteMap } from 'svelte/reactivity';

	import TextInput from './TextInput.svelte';
	import { createKeyboardNavigationHandler } from './keyboard-navigation.js';

	interface Prop<T> {
		/**
		 * Label for the search input.
		 */
		label: string;

		/**
		 * Placeholder text for search input.
		 */
		placeholder?: string;

		/**
		 * All available items to search from.
		 */
		items: T[];

		/**
		 * Keys to search in for fuzzy search (e.g., ['name', 'description']).
		 */
		searchKeys: string[];

		/**
		 * Optional filter function to exclude items from search results.
		 */
		filter?: (item: T) => boolean;

		/**
		 * Callback when an item is selected.
		 */
		onSelect: (item: T) => void;

		/**
		 * Snippet to render each item in the dropdown.
		 */
		renderItem: Snippet<[T]>;

		/**
		 * Optional snippet to render selected items below the input.
		 */
		selectedItems?: Snippet;

		/**
		 * Maximum number of results to display.
		 */
		maxResults?: number;

		/**
		 * Fuzzy search threshold (0.0 = perfect match, 1.0 = match anything).
		 */
		fuzzyThreshold?: number;

		/**
		 * Optional fixed width for the dropdown (e.g., '400px', '500px').
		 * Text that exceeds this width will be clipped with ellipsis.
		 */
		width?: string;
	}

	let {
		label,
		placeholder,
		items,
		searchKeys,
		filter,
		onSelect,
		renderItem,
		selectedItems,
		maxResults = 50,
		fuzzyThreshold = 0.2,
		width
	}: Prop<T> = $props();

	let searchText = $state('');
	let showPopup = $state(false);
	let selectedIndex = $state(0);
	let isKeyboardNavigation = $state(false);
	let inputRef = $state<HTMLDivElement>();
	let popupElement = $state<HTMLDivElement>();
	let scrollContainer = $state<HTMLDivElement>();
	let itemRefs = new SvelteMap<number, HTMLButtonElement>();
	let positionStyle = $state('');

	// Fuzzy search configuration
	const fuse = $derived(
		new Fuse(items, {
			keys: searchKeys,
			threshold: fuzzyThreshold,
			isCaseSensitive: false,
			ignoreDiacritics: true,
			shouldSort: true,
		})
	);

	// Filtered and searched items
	const filteredItemsResult = $derived.by(() => {
		let result = searchText ? fuse.search(searchText).map((x) => x.item) : items;

		if (filter) {
			result = result.filter(filter);
		}

		const totalCount = result.length;
		const limited = result.slice(0, maxResults);

		return { items: limited, totalCount, hasMore: totalCount > maxResults };
	});

	const filteredItems = $derived(filteredItemsResult.items);

	// Svelte action to set element references
	function setRef(node: HTMLButtonElement, index: number) {
		itemRefs.set(index, node);
		return {
			destroy() {
				itemRefs.delete(index);
			}
		};
	}

	// Calculate positioning
	onMount(() => {
		calculatePosition();
		window.addEventListener('resize', calculatePosition);
		return () => window.removeEventListener('resize', calculatePosition);
	});

	function calculatePosition() {
		if (!inputRef || !popupElement) return;

		const anchorRect = inputRef.getBoundingClientRect();
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

	// Auto-scroll to selected item (only during keyboard navigation)
	$effect(() => {
		if (isKeyboardNavigation && scrollContainer && selectedIndex >= 0 && filteredItems.length > 0) {
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
			const threshold = itemRect.height * 2;
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
			items: filteredItems,
			isPopupVisible: showPopup,
			onIndexChange: (newIndex) => {
				isKeyboardNavigation = true;
				selectedIndex = newIndex;
			},
			onSelect: handleSelect,
			onEscape: closePopup,
		})
	);

	function handleSelect(item: T) {
		onSelect(item);
		closePopup();
	}

	function closePopup() {
		showPopup = false;
		searchText = '';
		selectedIndex = 0;
	}

	// Update showPopup when searchText changes
	$effect(() => {
		if (searchText.length > 0) {
			showPopup = true;
			selectedIndex = 0;
		} else {
			showPopup = false;
		}
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="space-y-2" bind:this={inputRef} onkeydown={handleKeyDown}>
	<div class="relative">
		<TextInput
			bind:value={searchText}
			{label}
			{placeholder}
			onblur={() => {
				// Small delay to allow click events to fire
				setTimeout(() => {
					closePopup();
				}, 150);
			}}
		/>

		{#if showPopup && searchText && filteredItems.length > 0}
			<div
				bind:this={popupElement}
				class="bg-primary-50 dark:bg-primary-950 border-primary-300 dark:border-primary-700 absolute left-0 z-50 overflow-hidden rounded border shadow-lg"
				class:w-full={!width}
				style="{positionStyle}{width ? ` width: ${width};` : ''}"
			>
				<div bind:this={scrollContainer} class="max-h-96 overflow-y-auto scroll-smooth">
					{#each filteredItems as item, index (index)}
						<button
							use:setRef={index}
							type="button"
							class={clsx(
								'hover:bg-primary-100 dark:hover:bg-primary-800 flex w-full items-center gap-2 p-2 text-left transition-colors',
								width && 'overflow-hidden text-ellipsis whitespace-nowrap',
								index === selectedIndex &&
									'bg-primary-200 dark:bg-primary-700'
							)}
							onmousedown={() => handleSelect(item)}
							onmouseenter={() => {
								isKeyboardNavigation = false;
								selectedIndex = index;
							}}
						>
							{@render renderItem(item)}
						</button>
					{/each}
				</div>

				{#if filteredItemsResult.totalCount > 0}
					<div
						class="border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 border-t bg-primary-100 dark:bg-primary-900 px-3 py-1 text-right text-xs"
					>
						{#if filteredItemsResult.hasMore}
							{maxResults}+ results
						{:else}
							{filteredItemsResult.totalCount} result{filteredItemsResult.totalCount !== 1
								? 's'
								: ''}
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if selectedItems}
		{@render selectedItems()}
	{/if}
</div>
