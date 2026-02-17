<script lang="ts">
	import {
		BorderedContainer,
		Button,
		DeckBanner,
		DeckDisplay,
		FaIconType,
		ImportDecksModal,
		MarginFull,
		Modal,
		PageLead
	} from '@5argon/arkham-life-ui';
	import { CardResolver, type Deck } from '@5argon/arkham-kohaku';
	import { getAllCards, loadAllTabooLists } from '$lib/card-data';
	import { browser } from '$app/environment';

	interface Props {
		preLoadedDeck: Deck | null;
	}

	const { preLoadedDeck }: Props = $props();

	const allCards = getAllCards();
	const tabooLists = loadAllTabooLists();
	const cardResolver = new CardResolver(allCards);

	let showImportModal = $state(false);
	let localImportedDeck = $state<Deck | null>(null);
	let deckModalDeck = $state<Deck | null>(null);
	let isExportView = $state(false);

	// Use preLoadedDeck if available, otherwise use the locally imported deck
	let displayDeck = $derived(localImportedDeck ?? preLoadedDeck);

	function handleImportDeck(decks: Deck[]) {
		if (decks.length > 0) {
			localImportedDeck = decks[0];
			// Update URL with deck ID
			if (browser && localImportedDeck) {
				const deckId = localImportedDeck.id.toString();
				const newUrl = `/deck/view?id=${deckId}`;
				// Use history.pushState to update URL without navigation
				window.history.pushState({}, '', newUrl);
			}
		}
		showImportModal = false;
	}
</script>

<svelte:head>
	<title>Deck Viewer - Arkham Starter</title>
</svelte:head>

<MarginFull>
	{#if !isExportView}
		<PageLead
			description="View decks from arkhamdb.com or arkham.build with this site's UI. A shortcut to this tool is by viewing decks on those sites, then replace the site's name with 'arkham-starter.com' in the URL."
			title="Deck Viewer"
		/>
	{/if}

	{#if displayDeck === null}
		<BorderedContainer>
			<div class="flex flex-col items-center gap-4 py-8">
				<Button
					icon={FaIconType.Import}
					label="Import Deck"
					onClick={() => (showImportModal = true)}
				/>
			</div>
		</BorderedContainer>
	{:else}
		{#if !isExportView}
			<div class="flex justify-center mb-4 gap-2">
				<Button label="View Different Deck" onClick={() => (showImportModal = true)} />
			</div>
		{/if}

		<DeckDisplay toolbar deck={displayDeck} {cardResolver} bind:showExportView={isExportView} />
	{/if}
</MarginFull>

<ImportDecksModal
	{cardResolver}
	confirmButtonText="Import Deck"
	isOpen={showImportModal}
	limit={1}
	onClose={() => (showImportModal = false)}
	onConfirm={handleImportDeck}
	taboos={tabooLists}
/>

{#if deckModalDeck !== null}
	<Modal isOpen={true} onClose={() => (deckModalDeck = null)}>
		<DeckBanner deck={deckModalDeck} {cardResolver} />
	</Modal>
{/if}
