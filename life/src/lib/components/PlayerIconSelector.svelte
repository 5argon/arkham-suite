<script lang="ts">
	import { Button, CardFormSingle, FaIconType } from '@5argon/arkham-life-ui';
	import type { CardFormFilter } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	interface Prop {
		/**
		 * The currently selected card. Bindable — parent stays in sync automatically.
		 */
		selectedCard: Card | null;

		/**
		 * All cards available for search and randomization.
		 */
		cards: Card[];

		/**
		 * Optional filter applied to both the search dropdown and the randomize pool.
		 */
		filter?: CardFormFilter;

		/**
		 * Help text shown in a markdown modal when the label help icon is clicked.
		 */
		helpMd?: string;

		/**
		 * Placeholder text for the search input.
		 */
		placeholder?: string;

		/**
		 * Label for the field. Defaults to "Player Icon".
		 */
		label?: string;
	}

	let {
		selectedCard = $bindable(),
		cards,
		filter,
		helpMd,
		placeholder = 'Start typing a card name…',
		label = 'Player Icon'
	}: Prop = $props();

	const pool = $derived(filter ? cards.filter(filter) : cards);

	function randomize() {
		if (pool.length === 0) return;
		selectedCard = pool[Math.floor(Math.random() * pool.length)];
	}
</script>

<CardFormSingle
	{label}
	{cards}
	{filter}
	{placeholder}
	{helpMd}
	{selectedCard}
	onSelect={(c) => (selectedCard = c)}
/>
<!-- Always available: lets you pick an initial icon at random, not just re-roll. -->
<div class="mt-1 mb-4">
	<Button
		icon={FaIconType.Reset}
		label={selectedCard ? 'Randomize' : 'Random icon'}
		onClick={randomize}
	/>
</div>
