<script lang="ts">
	import {
		BorderedContainer,
		Button,
		type CardItem,
		Checkbox,
		DeckBanner,
		DeckDisplay,
		FaIconType,
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
		type Deck,
		service,
		type TabooLists
	} from '@5argon/arkham-kohaku';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { getAllCards, loadAllTabooLists } from '$lib/card-data';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as m from '$lib/paraglide/messages.js';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		calculateOverlaps,
		type CampaignDeckEntry,
		type MappingAlgorithm,
		type OverlapEntry,
		resolveMappings,
		type SubPriority
	} from '$lib/design/pages/tool/campaign-overlaps/campaign-overlaps-logic';
	import OverlapResolutions from '$lib/design/pages/tool/campaign-overlaps/OverlapResolutions.svelte';
	import { untrack } from 'svelte';

	interface Props {
		data: {
			preLoadedCampaignA?: Deck[];
			preLoadedCampaignB?: Deck[];
		};
	}

	const { data }: Props = $props();

	const tabooLists: TabooLists = loadAllTabooLists();
	const allCards: Card[] = getAllCards();
	const cardResolver = new CardResolver(allCards);

	let showImportModalA = $state(false);
	let showImportModalB = $state(false);
	// Initialize with preloaded decks, using untrack to capture initial value
	let campaignADecks = $state<Deck[]>(untrack(() => data.preLoadedCampaignA ?? []));
	let campaignBDecks = $state<Deck[]>(untrack(() => data.preLoadedCampaignB ?? []));
	let forwardToRcore = $state(true);
	let activeTabIndex = $state(0);
	let deckModalDeck = $state<Deck | null>(null);
	let selectedAlgorithm = $state<MappingAlgorithm>('deck-import-order');
	let selectedSubPriority = $state<SubPriority>('main-deck');
	let excludeSideDecks = $state(false);

	// Convert imported decks to browser URLs for modal pre-filling
	const existingDeckIdsA = $derived(
		campaignADecks.map((deck) => {
			const predicted = service.predictDeckInput(deck.id);
			return predicted.browserUrl;
		})
	);

	const existingDeckIdsB = $derived(
		campaignBDecks.map((deck) => {
			const predicted = service.predictDeckInput(deck.id);
			return predicted.browserUrl;
		})
	);

	// Create campaign deck entries with import indices
	const campaignADeckEntries = $derived.by((): CampaignDeckEntry[] =>
		campaignADecks.map((deck, index) => ({
			deck: excludeSideDecks ? { ...deck, sideDeck: [] } : deck,
			campaign: 'A',
			importIndex: index
		}))
	);

	const campaignBDeckEntries = $derived.by((): CampaignDeckEntry[] =>
		campaignBDecks.map((deck, index) => ({
			deck: excludeSideDecks ? { ...deck, sideDeck: [] } : deck,
			campaign: 'B',
			importIndex: index
		}))
	);

	// Calculate overlaps
	const overlaps = $derived.by((): OverlapEntry[] => {
		if (campaignADecks.length === 0 || campaignBDecks.length === 0) {
			return [];
		}
		return calculateOverlaps(campaignADeckEntries, campaignBDeckEntries, forwardToRcore);
	});

	// Convert overlaps to card items for display
	const overlapCardItems = $derived.by((): CardItem[] => {
		const itemMap = new SvelteMap<string, CardItem>();

		overlaps.forEach((overlap) => {
			// Create items for campaign A copies
			overlap.campaignACopies.forEach((copy) => {
				// Create unique key for merging: card code + owner + deckPart + campaign
				const key = `${copy.card.code}-${copy.deck.investigator.code}-${copy.deckPart}-A`;

				if (itemMap.has(key)) {
					// Merge by incrementing quantity
					const existing = itemMap.get(key)!;
					existing.quantity++;
				} else {
					// Create new item
					const labels = [{ text: 'A', color: CardClass.Guardian }];
					// Only add deck part label for side and extra
					if (copy.deckPart === 'side') {
						labels.push({ text: 'Side', color: CardClass.Survivor });
					} else if (copy.deckPart === 'extra') {
						labels.push({ text: 'Extra', color: CardClass.Mystic });
					}

					itemMap.set(key, {
						card: copy.card,
						quantity: 1,
						id: key,
						owner: copy.deck.investigator,
						labels
					});
				}
			});

			// Create items for campaign B copies
			overlap.campaignBCopies.forEach((copy) => {
				// Create unique key for merging: card code + owner + deckPart + campaign
				const key = `${copy.card.code}-${copy.deck.investigator.code}-${copy.deckPart}-B`;

				if (itemMap.has(key)) {
					// Merge by incrementing quantity
					const existing = itemMap.get(key)!;
					existing.quantity++;
				} else {
					// Create new item
					const labels = [{ text: 'B', color: CardClass.Seeker }];
					// Only add deck part label for side and extra
					if (copy.deckPart === 'side') {
						labels.push({ text: 'Side', color: CardClass.Survivor });
					} else if (copy.deckPart === 'extra') {
						labels.push({ text: 'Extra', color: CardClass.Mystic });
					}

					itemMap.set(key, {
						card: copy.card,
						quantity: 1,
						id: key,
						owner: copy.deck.investigator,
						labels
					});
				}
			});
		});

		return Array.from(itemMap.values());
	});

	// Calculate resolution mappings
	const resolutionMappings = $derived.by(() => {
		if (overlaps.length === 0) {
			return [];
		}
		return resolveMappings(overlaps, selectedAlgorithm, selectedSubPriority);
	});

	function handleImportDecksA(decks: Deck[]) {
		campaignADecks = decks;
		showImportModalA = false;
		updateUrl();
	}

	function handleImportDecksB(decks: Deck[]) {
		campaignBDecks = decks;
		showImportModalB = false;
		updateUrl();
	}

	function handleClearDecksA() {
		campaignADecks = [];
		updateUrl();
	}

	function handleClearDecksB() {
		campaignBDecks = [];
		updateUrl();
	}

	function handleSwapCampaigns() {
		const temp = campaignADecks;
		campaignADecks = campaignBDecks;
		campaignBDecks = temp;
		updateUrl();
	}

	function updateUrl() {
		// Update URL with deck IDs for sharing
		const searchParams: string[] = [];
		campaignADecks.forEach((deck, i) => {
			searchParams.push(`a${i + 1}=${deck.id}`);
		});
		campaignBDecks.forEach((deck, i) => {
			searchParams.push(`b${i + 1}=${deck.id}`);
		});

		console.log('updateUrl called:', {
			campaignACount: campaignADecks.length,
			campaignBCount: campaignBDecks.length,
			searchParams
		});

		const newUrl =
			searchParams.length > 0
				? `/tool/campaign-overlaps?${searchParams.join('&')}`
				: '/tool/campaign-overlaps';
		goto(resolve(newUrl, {}), { replaceState: true });
	}

	const sharingUrl = $derived.by(() => {
		if (campaignADecks.length === 0 && campaignBDecks.length === 0) {
			return 'https://arkham-starter.com/tool/campaign-overlaps';
		}
		const searchParams: string[] = [];
		campaignADecks.forEach((deck, i) => {
			searchParams.push(`a${i + 1}=${deck.id}`);
		});
		campaignBDecks.forEach((deck, i) => {
			searchParams.push(`b${i + 1}=${deck.id}`);
		});
		return `https://arkham-starter.com/tool/campaign-overlaps?${searchParams.join('&')}`;
	});

	// Calculate number of resolution mappings
	const resolutionCount = $derived(resolutionMappings.length);
</script>

<OpenGraph
	description="Identify common cards used between two campaigns. This might help moving cards around while running concurrent campaigns."
	image="image/resource/campaign-overlaps.webp"
	title="Campaign Overlaps"
	url="/tool/campaign-overlaps"
/>

<MarginFull>
	<PageLead
		description="Identify common cards used between two campaigns. This might help moving cards around while running concurrent campaigns."
		title={m.tool_campaign_overlaps_title()}
	/>

	<div class="flex flex-col gap-4">
		<!-- Campaign Import Sections -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<!-- Campaign A -->
			<BorderedContainer>
				<div class="flex flex-col gap-2">
					<h3 class="text-lg font-bold text-primary-900 dark:text-primary-100">Campaign A</h3>
					<div class="flex flex-wrap items-center gap-2">
						<Button
							icon={FaIconType.Import}
							label="Import Decks"
							onClick={() => (showImportModalA = true)}
						/>
						{#if campaignADecks.length > 0}
							<Button label="Clear All" icon={FaIconType.Delete} onClick={handleClearDecksA} />
						{/if}
					</div>
					{#if campaignADecks.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each campaignADecks as deck (deck.id)}
								<DeckBanner
									{cardResolver}
									{deck}
									mode="decklist"
									onClick={() => (deckModalDeck = deck)}
								/>
							{/each}
						</div>
					{/if}
				</div>
			</BorderedContainer>

			<!-- Campaign B -->
			<BorderedContainer>
				<div class="flex flex-col gap-2">
					<h3 class="text-lg font-bold text-primary-900 dark:text-primary-100">Campaign B</h3>
					<div class="flex flex-wrap items-center gap-2">
						<Button
							icon={FaIconType.Import}
							label="Import Decks"
							onClick={() => (showImportModalB = true)}
						/>
						{#if campaignBDecks.length > 0}
							<Button label="Clear All" icon={FaIconType.Delete} onClick={handleClearDecksB} />
						{/if}
					</div>
					{#if campaignBDecks.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each campaignBDecks as deck (deck.id)}
								<DeckBanner
									{cardResolver}
									{deck}
									mode="decklist"
									onClick={() => (deckModalDeck = deck)}
								/>
							{/each}
						</div>
					{/if}
				</div>
			</BorderedContainer>
		</div>

		<!-- Actions -->
		{#if campaignADecks.length > 0 || campaignBDecks.length > 0}
			<BorderedContainer>
				<div class="flex flex-wrap items-center gap-2">
					<Button label="Swap Campaigns" icon={FaIconType.Export} onClick={handleSwapCampaigns} />
					<Button
						label="Copy Sharing URL"
						onClick={() => navigator.clipboard.writeText(sharingUrl)}
					/>
				</div>
			</BorderedContainer>
		{/if}

		<!-- Results -->
		{#if campaignADecks.length > 0 && campaignBDecks.length > 0}
			<!-- Exclude Side Decks Checkbox -->
			<div class="flex justify-center">
				<Checkbox label="Exclude Side Decks" bind:checked={excludeSideDecks} />
			</div>

			{#if overlaps.length === 0}
				<BorderedContainer>
					<TextParagraph>No overlapping cards found between campaigns!</TextParagraph>
				</BorderedContainer>
			{:else}
				<Tabs
					direction="horizontal"
					{activeTabIndex}
					onTabChange={(index) => (activeTabIndex = index)}
					tabs={[
						{ label: `Possible Overlaps` },
						{ label: `Overlap Resolutions (${resolutionCount} Cards)` }
					]}
				/>

				{#if activeTabIndex === 0}
					<!-- Overlaps Tab -->
					<FlexibleCardDisplay cards={overlapCardItems} defaultViewMode="list" />
				{:else}
					<!-- Resolutions Tab -->
					<OverlapResolutions
						mappings={resolutionMappings}
						bind:selectedAlgorithm
						bind:selectedSubPriority
					/>
				{/if}
			{/if}
		{/if}
	</div>
</MarginFull>

<ImportDecksModal
	{cardResolver}
	confirmButtonText="Import to Campaign A"
	initialDeckIds={existingDeckIdsA}
	isOpen={showImportModalA}
	onClose={() => (showImportModalA = false)}
	onConfirm={handleImportDecksA}
	taboos={tabooLists}
/>

<ImportDecksModal
	{cardResolver}
	confirmButtonText="Import to Campaign B"
	initialDeckIds={existingDeckIdsB}
	isOpen={showImportModalB}
	onClose={() => (showImportModalB = false)}
	onConfirm={handleImportDecksB}
	taboos={tabooLists}
/>

{#if deckModalDeck}
	<Modal maxWidth="full" title="Deck Details" isOpen={true} onClose={() => (deckModalDeck = null)}>
		<DeckDisplay deck={deckModalDeck} {cardResolver} mode="decklist" />
	</Modal>
{/if}
