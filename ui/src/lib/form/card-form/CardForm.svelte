<!-- 
 @component
 A text input with fuzzy search dropdown for selecting cards.
 Supports keyboard navigation (up/down/enter/escape) and mouse interaction.
 The dropdown can position itself intelligently to avoid clipping.
 -->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import type { Snippet } from 'svelte';

	import SearchableDropdown from '../SearchableDropdown.svelte';
	import CardLine from '../../card/CardLine.svelte';
	import type { CardFormFilter } from './types.js';

	interface Prop {
		/**
		 * Label for the text input.
		 */
		label: string;

		/**
		 * Array of all cards to search from.
		 */
		cards: Card[];

		/**
		 * Placeholder text for the input.
		 */
		placeholder?: string;

		/**
		 * Optional filter function to exclude certain cards from search results.
		 */
		filter?: CardFormFilter;

		/**
		 * Callback when a card is selected from the dropdown.
		 */
		onSelect: (card: Card) => void;

		/**
		 * Optional snippet to render after the text input, useful for showing selected cards.
		 */
		selectedItems?: Snippet;
	}

	let { label, cards, placeholder, filter, onSelect, selectedItems }: Prop = $props();
</script>

<SearchableDropdown
	{label}
	{placeholder}
	items={cards}
	searchKeys={['name', 'subname']}
	{filter}
	{onSelect}
	fuzzyThreshold={0.2}
	maxResults={50}
	width="400px"
	{selectedItems}
>
	{#snippet renderItem(card: Card)}
		<CardLine {card} />
	{/snippet}
</SearchableDropdown>
