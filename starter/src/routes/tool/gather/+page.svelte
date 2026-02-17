<script lang="ts">
	import {
		BorderedContainer,
		Button,
		type CardItem,
		Checkbox,
		DeckBanner,
		DeckDisplay,
		FaIconType,
		findLinkedCardsSpecial,
		FlexibleCardDisplay,
		ImportDecksModal,
		MarginFull,
		Modal,
		PageLead,
		Tabs,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import {
		type Card,
		CardClass,
		CardResolver,
		CardType,
		type Deck,
		deck as deckUtility,
		service,
		type TabooLists
	} from '@5argon/arkham-kohaku';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards, loadAllTabooLists } from '$lib/card-data';
	import type { PageProps } from './$types';
	import { SvelteSet } from 'svelte/reactivity';
	import { resolve } from '$app/paths';

	const { data }: PageProps = $props();

	const tabooLists: TabooLists = loadAllTabooLists();
	const allCards: Card[] = getAllCards();
	const cardResolver = new CardResolver(allCards);

	let showImportModal = $state(false);
	let preLoadedDecks = $derived(data.preLoadedDecks);
	let importedDecksNotForwarded = $derived<Deck[]>(preLoadedDecks ?? []);
	let displayMode = $state<'all' | 'overlaps'>('all');
	let deckModalDeck = $state<Deck | null>(null);
	let excludeSideDecks = $state(false);
	let importedDecks = $derived.by(() => {
		return importedDecksNotForwarded.map(
			(deck) => deckUtility.forwardDefault(deck, cardResolver).deck
		);
	});

	// Convert imported decks to browser URLs for modal pre-filling
	const existingDeckIds = $derived(
		importedDecks.map((deck) => {
			const predicted = service.predictDeckInput(deck.id);
			return predicted.browserUrl;
		})
	);

	// Combine all cards from all decks
	const combinedCardItems = $derived.by(() => {
		const items: CardItem[] = [];
		const linkedCardCodes = new SvelteSet<string>(); // Track linked cards we've already added

		importedDecks.forEach((deck, deckIndex) => {
			const investigator = deck.investigator;

			// Process main deck
			deck.mainDeck.forEach((cq) => {
				const cardCode = cq.card.code;
				const card = cardResolver.resolve(cardCode);
				items.push({
					card: card,
					quantity: cq.quantity,
					id: `deck${deckIndex}-main-${card.code}`,
					owner: investigator
				});

				// Add linked cards (bonded and customizable upgrades)
				const linked = findLinkedCardsSpecial(card, cardResolver);
				linked.forEach((linkedCard) => {
					if (!linkedCardCodes.has(linkedCard.code)) {
						linkedCardCodes.add(linkedCard.code);
						items.push({
							card: linkedCard,
							quantity: linkedCard.cardType === CardType.Upgrade ? 1 : linkedCard.quantity,
							id: `deck${deckIndex}-linked-${linkedCard.code}`,
							owner: investigator,
							quantityColor: CardClass.Seeker,
							labels: [{ text: 'Linked', color: CardClass.Seeker }]
						});
					}
				});
			});

			// Process side deck (only if not excluded)
			if (!excludeSideDecks) {
				deck.sideDeck.forEach((cq) => {
					const cardCode = cq.card.code;
					let card = cq.card;

					// Try to resolve the forwarded card code
					if (cardCode !== cq.card.code) {
						try {
							card = cardResolver.resolve(cardCode);
						} catch {
							// If forwarding fails, use original
						}
					}

					items.push({
						card: card,
						quantity: cq.quantity,
						id: `deck${deckIndex}-side-${card.code}`,
						owner: investigator,
						quantityColor: CardClass.Survivor,
						labels: [{ text: 'Side', color: CardClass.Survivor }]
					});

					// Add linked cards from side deck
					const linked = findLinkedCardsSpecial(card, cardResolver);
					linked.forEach((linkedCard) => {
						if (!linkedCardCodes.has(linkedCard.code)) {
							linkedCardCodes.add(linkedCard.code);
							items.push({
								card: linkedCard,
								quantity: linkedCard.cardType === CardType.Upgrade ? 1 : linkedCard.quantity,
								id: `deck${deckIndex}-linked-side-${linkedCard.code}`,
								owner: investigator,
								quantityColor: CardClass.Seeker,
								labels: [{ text: 'Linked', color: CardClass.Seeker }]
							});
						}
					});
				});
			}

			if (deck.meta.extraDeck !== undefined) {
				deck.meta.extraDeck.forEach((cq) => {
					const cardCode = cq.card.code;
					const card = cardResolver.resolve(cardCode);
					items.push({
						card: card,
						quantity: cq.quantity,
						id: `deck${deckIndex}-extra-${card.code}`,
						owner: investigator,
						quantityColor: CardClass.Mystic,
						labels: [{ text: 'Extra', color: CardClass.Mystic }]
					});

					// Add linked cards from extra deck
					const linked = findLinkedCardsSpecial(card, cardResolver);
					linked.forEach((linkedCard) => {
						if (!linkedCardCodes.has(linkedCard.code)) {
							linkedCardCodes.add(linkedCard.code);
							items.push({
								card: linkedCard,
								quantity: linkedCard.cardType === CardType.Upgrade ? 1 : linkedCard.quantity,
								id: `deck${deckIndex}-linked-extra-${linkedCard.code}`,
								owner: investigator,
								quantityColor: CardClass.Seeker,
								labels: [{ text: 'Linked', color: CardClass.Seeker }]
							});
						}
					});
				});
			}
		});

		return items;
	});

	const decksForOverlapDetection = $derived.by(() => {
		return importedDecks.map((d) => {
			const forwarded = deckUtility.forwardDefault(d, cardResolver).deck;
			if (excludeSideDecks) {
				// Create a copy without side deck for overlap detection
				return { ...forwarded, sideDeck: [] };
			}
			return forwarded;
		});
	});

	const overlaps = $derived.by(() => {
		const deckOverlaps = deckUtility.findDeckOverlaps(decksForOverlapDetection);
		return deckOverlaps.map((overlap) => ({
			cardCode: overlap.cardCode,
			totalQuantity: overlap.totalQuantity,
			cardLimit: overlap.cardLimit
		}));
	});

	// Card items with overlap indicators
	const cardItemsWithOverlaps = $derived.by(() => {
		if (overlaps.length === 0) {
			return combinedCardItems;
		}

		return combinedCardItems.map((item) => {
			const overlap = overlaps.find((ov) => ov.cardCode === item.card.code);
			if (overlap) {
				return {
					...item,
					labels: [
						...(item.labels ?? []),
						{
							text: `${overlap.totalQuantity}/${overlap.cardLimit}`,
							color: CardClass.Survivor
						}
					]
				};
			}
			return item;
		});
	});

	// Filter to show only overlapping cards
	const overlappingCardItems = $derived.by(() => {
		const overlapCodes = new Set(overlaps.map((ov) => ov.cardCode));
		return cardItemsWithOverlaps.filter((item) => overlapCodes.has(item.card.code));
	});

	// Calculate total card count (including quantities)
	const totalCardCount = $derived(combinedCardItems.reduce((sum, item) => sum + item.quantity, 0));

	// Calculate overlapping card count (including quantities)
	const overlappingCardCount = $derived(
		overlappingCardItems.reduce((sum, item) => sum + item.quantity, 0)
	);

	function handleImportDecks(decks: Deck[]) {
		importedDecks = decks;
		showImportModal = false;
		updateUrl();
	}

	function handleClearDecks() {
		importedDecks = [];
		updateUrl();
	}

	function updateUrl() {
		// Update URL with deck IDs for sharing
		const searchParams: string[] = [];
		importedDecks.forEach((deck, i) => {
			searchParams.push(`p${i + 1}=${deck.id}`);
		});

		const newUrl =
			searchParams.length > 0 ? `/tool/gather?${searchParams.join('&')}` : '/tool/gather';
		goto(resolve(newUrl, {}), { replaceState: true });
	}

	const sharingUrl = $derived.by(() => {
		if (importedDecks.length === 0) {
			return 'https://arkham-starter.com/tool/gather';
		}
		const searchParams: string[] = [];
		importedDecks.forEach((deck, i) => {
			searchParams.push(`p${i + 1}=${deck.id}`);
		});
		return `https://arkham-starter.com/tool/gather?${searchParams.join('&')}`;
	});

	const displayedCards = $derived(
		displayMode === 'overlaps' ? overlappingCardItems : cardItemsWithOverlaps
	);
</script>

<OpenGraph
	description="Collect all required cards of multiple decks into one freely sortable list."
	image="image/resource/gather.webp"
	title="Deck Gather"
	url="/tool/gather"
/>

<MarginFull>
	<PageLead
		description="Collect all required cards of multiple decks into one freely sortable list. You can go through your collection just once to gather cards for everyone. It has a deck overlap analyzer that also checks the Side Deck."
		title={m.tool_gather_title()}
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
						label="Add More Decks"
						icon={FaIconType.Plus}
						onClick={() => (showImportModal = true)}
					/>
					<Button label="Clear All" icon={FaIconType.Delete} onClick={handleClearDecks} />
					<Button
						label="Copy Sharing URL"
						onClick={() => navigator.clipboard.writeText(sharingUrl)}
					/>
				</div>
			</BorderedContainer>

			<BorderedContainer>
				<!-- Deck Banners -->
				<div class="flex flex-wrap justify-center">
					{#each importedDecks as deck (deck.id)}
						<div class="p-1">
							<DeckBanner
								{cardResolver}
								{deck}
								mode="decklist"
								onClick={() => (deckModalDeck = deck)}
							/>
						</div>
					{/each}
				</div>
			</BorderedContainer>

			<!-- Exclude Side Decks Checkbox -->
			<div class="flex justify-center">
				<Checkbox label="Exclude Side Decks" bind:checked={excludeSideDecks} />
			</div>

			<!-- Display Mode Tabs -->
			<Tabs
				direction="horizontal"
				activeTabIndex={displayMode === 'all' ? 0 : 1}
				onTabChange={(index) => (displayMode = index === 0 ? 'all' : 'overlaps')}
				tabs={[
					{ label: m.tool_gather_all_cards({ count: totalCardCount }) },
					{ label: m.tool_gather_overlaps_only({ count: overlappingCardCount }) }
				]}
			/>
			<!-- Card Display -->
			{#if displayedCards.length === 0}
				<TextParagraph>
					{displayMode === 'overlaps' ? 'No overlapping cards found!' : 'No cards to display'}
				</TextParagraph>
			{:else}
				{#key displayMode}
					<FlexibleCardDisplay
						cards={displayedCards}
						defaultViewMode="list"
						hideIconsView
						defaultSettings={{
							grouping: ['set'],
							sortingOrder: ['position']
						}}
					/>
				{/key}
			{/if}
		</div>
	{/if}
</MarginFull>

<ImportDecksModal
	{cardResolver}
	confirmButtonText="Import Decks"
	initialDeckIds={existingDeckIds}
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
