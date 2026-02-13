<script lang="ts">
	import {
		applyGroupingSorting,
		BorderedContainer,
		Button,
		type CardItem,
		CardLineList,
		CardScanFullSmallGrid,
		Checkbox,
		DeckBanner,
		DeckDisplay,
		FaIconType,
		ImportDecksModal,
		MarginFull,
		Modal,
		PageLead,
		Tabs
	} from '@5argon/arkham-life-ui';
	import {
		type Card,
		CardClass,
		CardResolver,
		type Deck,
		deck as deckUtility,
		type TabooLists
	} from '@5argon/arkham-kohaku';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards, loadAllTabooLists } from '$lib/card-data';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const { data }: PageProps = $props();

	const tabooLists: TabooLists = loadAllTabooLists();
	const allCards: Card[] = getAllCards();
	const preLoadedDecks: Deck[] = $derived(data.preLoadedDecks ?? []);
	const cardResolver = new CardResolver(allCards);

	let showImportModal = $state(false);
	let importedDecks = $state<Deck[]>([]);
	let activeTeamSize = $state<2 | 3 | 4>(2);
	let useScanView = $state(false);
	let zeroOverlapOnly = $state(false);
	let deckModalDeck = $state<Deck | null>(null);

	// Load pre-loaded decks when available
	$effect(() => {
		if (preLoadedDecks.length > 0 && importedDecks.length === 0) {
			importedDecks = preLoadedDecks;
		}
	});

	function handleImportDecks(decks: Deck[]) {
		importedDecks = decks;
		showImportModal = false;

		// Update URL with deck IDs
		const deckIds = decks.map((deck) => String(deck.id));
		if (deckIds.length > 0) {
			const params = new SvelteURLSearchParams();
			deckIds.forEach((id, index) => {
				params.set(`p${index + 1}`, id);
			});
			goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
		}
	}

	function handleClearDecks() {
		importedDecks = [];
		// Clear URL parameters
		goto('?', { replaceState: true, noScroll: true });
	}

	function handleOpenDeckGather(combo: { decks: Deck[] }) {
		const deckIds = combo.decks.map((deck) => String(deck.id));
		const params = new SvelteURLSearchParams();
		deckIds.forEach((id, index) => {
			params.set(`p${index + 1}`, id);
		});
		const url = `/tool/gather?${params.toString()}`;
		window.open(url, '_blank');
	}

	// Forward decks to revised core if enabled
	const decksForOverlapDetection = $derived.by(() => {
		return importedDecks.map((d) => {
			return deckUtility.forwardDefault(d, cardResolver).deck;
		});
	});

	// Generate all combinations for each team size
	const twoPlayerCombinations = $derived.by(() => {
		if (decksForOverlapDetection.length < 2) return [];
		return deckUtility.findTeamOverlaps(decksForOverlapDetection, 2);
	});

	const threePlayerCombinations = $derived.by(() => {
		if (decksForOverlapDetection.length < 3) return [];
		return deckUtility.findTeamOverlaps(decksForOverlapDetection, 3);
	});

	const fourPlayerCombinations = $derived.by(() => {
		if (decksForOverlapDetection.length < 4) return [];
		return deckUtility.findTeamOverlaps(decksForOverlapDetection, 4);
	});

	// Convert overlaps to CardItems for display
	function overlapToCardItems(combo: {
		decks: Deck[];
		overlaps: deckUtility.DeckOverlapInfo[];
	}): CardItem[] {
		const items: CardItem[] = [];

		combo.overlaps.forEach((overlap, overlapIndex) => {
			// Create a separate CardItem for each deck that uses this overlapping card
			overlap.deckQuantities.forEach((quantity, deckId) => {
				const deck = combo.decks.find((d) => d.id === deckId);
				if (deck) {
					items.push({
						card: overlap.card,
						quantity: quantity, // Individual deck's quantity
						id: `overlap-${overlapIndex}-${overlap.cardCode}-${deckId}`,
						owner: deck.investigator,
						labels: [
							{
								text: `${overlap.totalQuantity}/${overlap.cardLimit}`,
								color: CardClass.Survivor
							}
						]
					});
				}
			});
		});

		return items;
	}

	// Convert to RecursivelyGroupedCardItem for CardLineList/CardScanFullSmallGrid
	function overlapToGroupedCardItems(combo: {
		decks: Deck[];
		overlaps: deckUtility.DeckOverlapInfo[];
	}) {
		const cardItems = overlapToCardItems(combo);
		return applyGroupingSorting(cardItems, { grouping: [], sortingOrder: [] });
	}

	// Filtered counts for tab labels
	const twoPlayerFilteredCount = $derived(
		zeroOverlapOnly
			? twoPlayerCombinations.filter((combo) => combo.overlaps.length === 0).length
			: twoPlayerCombinations.length
	);

	const threePlayerFilteredCount = $derived(
		zeroOverlapOnly
			? threePlayerCombinations.filter((combo) => combo.overlaps.length === 0).length
			: threePlayerCombinations.length
	);

	const fourPlayerFilteredCount = $derived(
		zeroOverlapOnly
			? fourPlayerCombinations.filter((combo) => combo.overlaps.length === 0).length
			: fourPlayerCombinations.length
	);

	// Tab labels with conditional format
	const twoPlayerLabel = $derived(
		zeroOverlapOnly
			? `2 Players (${twoPlayerFilteredCount}/${twoPlayerCombinations.length})`
			: `2 Players (${twoPlayerCombinations.length})`
	);

	const threePlayerLabel = $derived(
		zeroOverlapOnly
			? `3 Players (${threePlayerFilteredCount}/${threePlayerCombinations.length})`
			: `3 Players (${threePlayerCombinations.length})`
	);

	const fourPlayerLabel = $derived(
		zeroOverlapOnly
			? `4 Players (${fourPlayerFilteredCount}/${fourPlayerCombinations.length})`
			: `4 Players (${fourPlayerCombinations.length})`
	);

	const currentCombinations = $derived.by(() => {
		const combos =
			activeTeamSize === 2
				? twoPlayerCombinations
				: activeTeamSize === 3
					? threePlayerCombinations
					: fourPlayerCombinations;

		if (zeroOverlapOnly) {
			return combos.filter((combo) => combo.overlaps.length === 0);
		}
		return combos;
	});
</script>

<OpenGraph
	description="Import as many decks as you want, then view all possible 2, 3, or 4 player combinations sorted by the fewest overlaps."
	image="image/resource/assembler.webp"
	title="Team Assembler"
	url="/tool/assembler"
/>

<MarginFull>
	<PageLead
		description="Find the best team combinations by analyzing card overlaps across all imported decks. Import as many decks as you want, then view all possible 2, 3, or 4 player combinations sorted by fewest overlaps."
		title={m.tool_assembler_title()}
	/>

	{#if importedDecks.length === 0}
		<BorderedContainer>
			<div class="flex flex-col items-center gap-4 p-8">
				<Button
					label="Import Decks"
					icon={FaIconType.Import}
					onClick={() => (showImportModal = true)}
				/>
			</div>
		</BorderedContainer>
	{:else}
		<div class="flex flex-col gap-4">
			<BorderedContainer>
				<!-- Actions -->
				<div class="flex flex-wrap items-center gap-2">
					<Button
						label="Change Decks"
						icon={FaIconType.Import}
						onClick={() => (showImportModal = true)}
					/>
					<Button label="Clear All" icon={FaIconType.Delete} onClick={handleClearDecks} />
					<Checkbox label="Zero Overlap Only" bind:checked={zeroOverlapOnly} />
					<Checkbox label="Scans" bind:checked={useScanView} />
					<div class="ml-auto text-sm text-primary-700 dark:text-primary-300">
						{importedDecks.length} deck{importedDecks.length === 1 ? '' : 's'} imported
					</div>
				</div>
			</BorderedContainer>

			<!-- Team Size Tabs -->
			<Tabs
				direction="horizontal"
				activeTabIndex={activeTeamSize === 2 ? 0 : activeTeamSize === 3 ? 1 : 2}
				onTabChange={(index) =>
					(activeTeamSize = (index === 0 ? 2 : index === 1 ? 3 : 4) as 2 | 3 | 4)}
				tabs={[
					{
						label: twoPlayerLabel
					},
					{
						label: threePlayerLabel
					},
					{
						label: fourPlayerLabel
					}
				]}
			/>

			<!-- Combinations Display -->
			{#if currentCombinations.length === 0}
				<BorderedContainer>
					<p class="p-4 text-center text-muted">
						Not enough decks for {activeTeamSize} player combinations. Import at least {activeTeamSize}
						decks.
					</p>
				</BorderedContainer>
			{:else}
				<div class="flex flex-col gap-4">
					{#each currentCombinations as combo, comboIndex (comboIndex)}
						<BorderedContainer>
							<div class="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-4">
								<!-- Left: Deck Banners & Actions -->
								<div class="flex flex-col gap-2">
									{#each combo.decks as deck (deck.id)}
										<DeckBanner
											{cardResolver}
											{deck}
											mode="decklist"
											small
											onClick={() => (deckModalDeck = deck)}
										/>
									{/each}
									<Button
										label="Open Deck Gather"
										icon={FaIconType.Export}
										onClick={() => handleOpenDeckGather(combo)}
									/>
								</div>

								<!-- Right: Overlaps -->
								<div class="flex flex-col gap-2">
									{#if combo.overlaps.length === 0}
										<div class="flex items-center justify-center h-full">
											<p class="text-rogue-600 dark:text-rogue-400 font-semibold text-lg">
												✓ No overlaps!
											</p>
										</div>
									{:else}
										<div class="mb-2">
											<h3 class="text-lg font-semibold text-primary-800 dark:text-primary-200">
												{combo.overlaps.length} Overlap{combo.overlaps.length === 1 ? '' : 's'}
											</h3>
										</div>
										{#if useScanView}
											<CardScanFullSmallGrid
												groups={overlapToGroupedCardItems(combo)}
												showCardName={true}
											/>
										{:else}
											<CardLineList groups={overlapToGroupedCardItems(combo)} />
										{/if}
									{/if}
								</div>
							</div>
						</BorderedContainer>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</MarginFull>

<ImportDecksModal
	batchImport={true}
	{cardResolver}
	confirmButtonText="Import Decks"
	initialDeckIds={importedDecks.map((deck) => String(deck.id))}
	isOpen={showImportModal}
	onClose={() => (showImportModal = false)}
	onConfirm={handleImportDecks}
	taboos={tabooLists}
/>

<Modal
	isOpen={deckModalDeck != null}
	maxWidth="full"
	onClose={() => (deckModalDeck = null)}
	title="Deck Details"
>
	<DeckDisplay {cardResolver} deck={deckModalDeck!} mode="decklist" />
</Modal>
