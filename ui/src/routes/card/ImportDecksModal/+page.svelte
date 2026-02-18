<script lang="ts">
	import { CardResolver, ahdbTabooToTaboo, type Taboo, type Deck } from '@5argon/arkham-kohaku';
	import ImportDecksModal from '../../../lib/card/ImportDecksModal.svelte';
	import { allCards, allAhdbTaboos } from '../card-data';

	const resolver = new CardResolver(allCards);
	const allTaboo: Taboo[] = allAhdbTaboos.map((t) => ahdbTabooToTaboo(t));

	let isModalOpen = $state(false);
	let importedDecks = $state<Deck[]>([]);

	function handleOpenModal() {
		isModalOpen = true;
	}

	function handleCloseModal() {
		isModalOpen = false;
	}

	function handleConfirm(decks: Deck[]) {
		importedDecks = decks;
		isModalOpen = false;
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<h1 class="text-3xl font-bold text-black dark:text-white">Import Decks Modal Demo</h1>
	<p class="text-black dark:text-white">
		This demo shows the ImportDecksModal component that allows importing multiple decks from URLs
		or deck IDs.
	</p>

	<button
		type="button"
		onclick={handleOpenModal}
		class="w-fit rounded bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400"
	>
		Open Import Modal
	</button>

	{#if importedDecks.length > 0}
		<div class="mt-4">
			<h2 class="mb-2 text-2xl font-bold text-black dark:text-white">
				Imported Decks ({importedDecks.length})
			</h2>
			<div class="space-y-2">
				{#each importedDecks as deck}
					<div class="rounded border border-primary-300 bg-white p-3 dark:border-primary-700 dark:bg-primary-900">
						<div class="font-bold text-black dark:text-white">{deck.name}</div>
						<div class="text-sm text-black/70 dark:text-white/70">
							Investigator: {deck.investigator.name}
						</div>
						<div class="text-sm text-black/70 dark:text-white/70">
							Cards: {deck.mainDeck.reduce((sum, cq) => sum + cq.quantity, 0)}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<ImportDecksModal
	isOpen={isModalOpen}
	onClose={handleCloseModal}
	confirmButtonText="Import Selected Decks"
	onConfirm={handleConfirm}
	cardResolver={resolver}
	taboos={allTaboo}
/>
