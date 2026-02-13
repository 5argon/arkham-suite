<script lang="ts">
	import type { Deck, Card, TabooLists, CardResolver } from '@5argon/arkham-kohaku';
	import { Button, ImportDecksModal, FaIconType } from '@5argon/arkham-life-ui';
	import type { CardWithQuantity } from '$lib/tool/script/export/proto-string-restore';

	import CardBlockPlaceholder from './CardBlockPlaceholder.svelte';
	import StagingAreaSingle from './StagingAreaSingle.svelte';

	interface Props {
		editMode?: boolean;
		onToggleEditMode?: () => void;
		cardResolver: CardResolver;
		allCards?: Card[];
		taboos?: TabooLists;
		stagingCards1?: CardWithQuantity[];
		stagingCards2?: CardWithQuantity[];
		onAddToLeftSide?: (cardId: string) => void;
		onAddToRightSide?: (cardId: string) => void;
		onRemoveFromStaging?: (stage: number, cardId: string) => void;
	}

	let {
		editMode = false,
		onToggleEditMode = () => {},
		cardResolver,
		allCards = [],
		taboos = [],
		stagingCards1 = $bindable([]),
		stagingCards2 = $bindable([]),
		onAddToLeftSide = () => {},
		onAddToRightSide = () => {},
		onRemoveFromStaging = () => {}
	}: Props = $props();

	let showImportModal = $state(false);

	function handleImportDecks(decks: Deck[]) {
		if (decks.length > 0) {
			const deck = decks[0];
			// Create card-to-quantity maps for main and side decks
			const mainMap = new Map<string, number>();
			const sideMap = new Map<string, number>();

			// Aggregate quantities from deck
			for (const cq of deck.mainDeck) {
				const existing = mainMap.get(cq.card.code) ?? 0;
				mainMap.set(cq.card.code, existing + cq.quantity);
			}
			for (const cq of deck.sideDeck) {
				const existing = sideMap.get(cq.card.code) ?? 0;
				sideMap.set(cq.card.code, existing + cq.quantity);
			}

			// Convert maps to CardWithQuantity arrays
			stagingCards1 = Array.from(mainMap.entries()).map(([cardId, quantity]) => ({
				cardId,
				quantity
			}));
			stagingCards2 = Array.from(sideMap.entries()).map(([cardId, quantity]) => ({
				cardId,
				quantity
			}));
		}
		showImportModal = false;
	}

	function handleClearCards() {
		stagingCards1 = [];
		stagingCards2 = [];
	}
</script>

{#if !editMode}
	<CardBlockPlaceholder {onAddToLeftSide} {onAddToRightSide} />
{/if}

<div class="my-2 flex flex-col gap-2">
	<Button
		icon={editMode ? FaIconType.Back : FaIconType.Edit}
		label={editMode ? 'End Edit' : 'Edit Cards'}
		onClick={onToggleEditMode}
	/>
	{#if editMode}
		<Button
			label="Import Deck"
			icon={FaIconType.Import}
			onClick={() => (showImportModal = true)}
			highlighted
		/>
		<Button label="Clear Cards" icon={FaIconType.Delete} onClick={handleClearCards} />
	{/if}
</div>

<ImportDecksModal
	isOpen={showImportModal}
	limit={1}
	onClose={() => (showImportModal = false)}
	confirmButtonText="Replace All Staging Cards"
	onConfirm={handleImportDecks}
	{cardResolver}
	{taboos}
/>

<div class="staging-areas">
	<StagingAreaSingle
		{editMode}
		label="Staging #1"
		{cardResolver}
		{allCards}
		stagingCards={stagingCards1}
		{onAddToLeftSide}
		{onAddToRightSide}
		onAddCard={(code) => {
			// Check if card already exists
			const existing = stagingCards1.find((c) => c.cardId === code);
			if (!existing) {
				// Get max quantity from card's deck_limit
				try {
					const card = cardResolver.resolve(code);
					const maxQty = card.deckLimit ?? 2;
					stagingCards1 = [...stagingCards1, { cardId: code, quantity: maxQty }];
				} catch {
					// If card not found, default to 2
					stagingCards1 = [...stagingCards1, { cardId: code, quantity: 2 }];
				}
			}
		}}
		onRemoveCard={(code) => onRemoveFromStaging(1, code)}
	/>
	<StagingAreaSingle
		{editMode}
		label="Staging #2"
		{cardResolver}
		{allCards}
		stagingCards={stagingCards2}
		{onAddToLeftSide}
		{onAddToRightSide}
		onAddCard={(code) => {
			// Check if card already exists
			const existing = stagingCards2.find((c) => c.cardId === code);
			if (!existing) {
				// Get max quantity from card's deck_limit
				try {
					const card = cardResolver.resolve(code);
					const maxQty = card.deckLimit ?? 2;
					stagingCards2 = [...stagingCards2, { cardId: code, quantity: maxQty }];
				} catch {
					// If card not found, default to 2
					stagingCards2 = [...stagingCards2, { cardId: code, quantity: 2 }];
				}
			}
		}}
		onRemoveCard={(code) => onRemoveFromStaging(2, code)}
	/>
</div>

<style>
	.staging-areas {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* On smaller screens, display staging areas side by side */
	@media (max-width: 1450px) {
		.staging-areas {
			flex-direction: row;
			gap: 1rem;
		}

		.staging-areas :global(> *) {
			flex: 1;
			min-width: 0;
		}
	}
</style>
