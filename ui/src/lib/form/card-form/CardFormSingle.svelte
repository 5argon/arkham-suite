<!-- 
 @component
 CardForm variant for selecting a single card.
 Shows the currently selected card as a CardLine below the input.
 Picking a new card replaces the selection — no explicit delete button.
 -->
<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';

	import CardLine from '../../card/CardLine.svelte';
	import CardForm from './CardForm.svelte';
	import type { CardFormFilter } from './types.js';

	interface Prop {
		/**
		 * Label for the search input.
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
		 * The currently selected card to display below the input.
		 * When provided, a CardLine is shown beneath the search field.
		 */
		selectedCard?: Card | null;

		/**
		 * Longer help text as raw markdown displayed in a modal.
		 */
		helpMd?: string;
	}

	let { label, cards, placeholder, filter, onSelect, selectedCard, helpMd }: Prop = $props();
</script>

<CardForm {label} {cards} {placeholder} {filter} {onSelect} {helpMd}>
	{#snippet selectedItems()}
		{#if selectedCard}
			<div
				class="bg-primary-100 dark:bg-primary-800 flex items-center gap-2 rounded p-1 transition-colors"
			>
				<CardLine card={selectedCard} />
			</div>
		{/if}
	{/snippet}
</CardForm>
