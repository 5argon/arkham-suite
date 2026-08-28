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
		Pagination,
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
	import { starterDeck } from '$lib/starter-content';
	import { decksToEvergreen } from '$lib/tool/evergreen-team/from-decks';
	import { deckToAhdb, openInDeckGather } from '$lib/tool/interop/transient-decks';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { SvelteMap, SvelteURLSearchParams } from 'svelte/reactivity';
	import ResolveOverlapsModal from '$lib/design/pages/tool/assembler/ResolveOverlapsModal.svelte';
	import { hasUniqueInvestigatorClasses } from '$lib/tool/assembler/filter';
	import {
		allResolved,
		buildOverlapGroups,
		type OverlapGroup
	} from '$lib/tool/assembler/resolve-overlaps';

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
	let uniqueClassesOnly = $state(false);
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

	// Decks are handed to the other tools as JSON through browser storage, so
	// nothing is fetched again (and local-only decks can travel too).
	function ahdbDecksOf(combo: { decks: Deck[] }) {
		return combo.decks.map(deckToAhdb).filter((d) => d !== null);
	}

	function handleOpenDeckGather(combo: { decks: Deck[] }) {
		openInDeckGather(ahdbDecksOf(combo));
	}

	function handleOpenTeamBuilder(combo: { decks: Deck[] }) {
		const encoded = decksToEvergreen(ahdbDecksOf(combo), allCards);
		window.open(`/tool/team-builder?t=${encoded}`, '_blank', 'noopener');
	}

	// This site's own starter deck pages resolve locally to the deck's 0 XP
	// build (upgrades in the side deck), no network involved.
	const starterDeckUrl = /\/starter\/([\w-]+)\/([\w-]+)\/([\w-]+)\/?$/;
	const localSources = [
		{
			matches: (input: string) => {
				const match = starterDeckUrl.exec(input);
				return match !== null && starterDeck(match[1], match[2], match[3]) !== undefined;
			},
			fetch: async (input: string) => {
				const match = starterDeckUrl.exec(input)!;
				const entry = starterDeck(match[1], match[2], match[3])!;
				return { deck: { ...entry.primary, id: `${match[1]}/${match[2]}/${match[3]}` } };
			}
		}
	];

	// Overlap resolutions per combination (keyed by its deck ids), kept while
	// the page lives so reopening the modal continues where the user left off.
	const resolutions = new SvelteMap<string, OverlapGroup[]>();
	let resolving = $state<{ key: string; combo: { decks: Deck[] } } | null>(null);
	function comboKey(combo: { decks: Deck[] }): string {
		return combo.decks.map((d) => String(d.id)).join('|');
	}
	function openResolve(combo: { decks: Deck[]; overlaps: deckUtility.DeckOverlapInfo[] }) {
		const key = comboKey(combo);
		if (!resolutions.has(key)) resolutions.set(key, buildOverlapGroups(combo));
		resolving = { key, combo };
	}
	function setReplacement(rowKey: string, card: Card | null) {
		if (resolving === null) return;
		const groups = resolutions.get(resolving.key);
		if (groups === undefined) return;
		// Rebuilt immutably so the modal re-renders from fresh references.
		resolutions.set(
			resolving.key,
			groups.map((group) => ({
				...group,
				rows: group.rows.map((row) => (row.key === rowKey ? { ...row, replacement: card } : row))
			}))
		);
	}

	function resetResolution() {
		if (resolving === null) return;
		resolutions.set(resolving.key, buildOverlapGroups(resolving.combo as never));
	}
	function comboResolved(combo: { decks: Deck[] }): boolean {
		const groups = resolutions.get(comboKey(combo));
		return groups !== undefined && allResolved(groups);
	}

	// Pagination per player-count tab; switching returns to the top of the tabs.
	const PAGE_SIZE = 20;
	let page = $state(1);
	let tabsEl = $state<HTMLElement | null>(null);
	function changePage(next: number) {
		page = next;
		tabsEl?.scrollIntoView({ block: 'start', behavior: 'smooth' });
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

	function combinationMatchesFilters(combo: {
		decks: Deck[];
		overlaps: deckUtility.DeckOverlapInfo[];
	}): boolean {
		return (
			(!zeroOverlapOnly || combo.overlaps.length === 0) &&
			(!uniqueClassesOnly || hasUniqueInvestigatorClasses(combo.decks))
		);
	}

	const filtersActive = $derived(zeroOverlapOnly || uniqueClassesOnly);

	// Filtered counts for tab labels
	const twoPlayerFilteredCount = $derived(
		twoPlayerCombinations.filter(combinationMatchesFilters).length
	);

	const threePlayerFilteredCount = $derived(
		threePlayerCombinations.filter(combinationMatchesFilters).length
	);

	const fourPlayerFilteredCount = $derived(
		fourPlayerCombinations.filter(combinationMatchesFilters).length
	);

	// Tab labels with conditional format
	const twoPlayerLabel = $derived(
		filtersActive
			? `2 Players (${twoPlayerFilteredCount}/${twoPlayerCombinations.length})`
			: `2 Players (${twoPlayerCombinations.length})`
	);

	const threePlayerLabel = $derived(
		filtersActive
			? `3 Players (${threePlayerFilteredCount}/${threePlayerCombinations.length})`
			: `3 Players (${threePlayerCombinations.length})`
	);

	const fourPlayerLabel = $derived(
		filtersActive
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

		return filtersActive ? combos.filter(combinationMatchesFilters) : combos;
	});

	const pageCount = $derived(Math.max(1, Math.ceil(currentCombinations.length / PAGE_SIZE)));
	const pagedCombinations = $derived(
		currentCombinations.slice(
			(Math.min(page, pageCount) - 1) * PAGE_SIZE,
			Math.min(page, pageCount) * PAGE_SIZE
		)
	);
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
					<Checkbox
						label={m.tool_assembler_unique_investigator_classes()}
						bind:checked={uniqueClassesOnly}
					/>
					<Checkbox label="Scans" bind:checked={useScanView} />
					<div class="ml-auto text-sm text-primary-700 dark:text-primary-300">
						{importedDecks.length} deck{importedDecks.length === 1 ? '' : 's'} imported
					</div>
				</div>
			</BorderedContainer>

			<!-- Team Size Tabs -->
			<div bind:this={tabsEl} class="scroll-mt-2"></div>
			<Tabs
				direction="horizontal"
				activeTabIndex={activeTeamSize === 2 ? 0 : activeTeamSize === 3 ? 1 : 2}
				onTabChange={(index) => {
					activeTeamSize = (index === 0 ? 2 : index === 1 ? 3 : 4) as 2 | 3 | 4;
					page = 1;
				}}
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
					<div class="flex justify-center">
						<Pagination page={Math.min(page, pageCount)} {pageCount} onChange={changePage} />
					</div>
					{#each pagedCombinations as combo, comboIndex (comboIndex)}
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
									<div class="flex flex-wrap gap-2">
										<Button
											label={m.tool_assembler_open_gather()}
											icon={FaIconType.ExternalLink}
											onClick={() => handleOpenDeckGather(combo)}
										/>
										<Button
											label={m.tool_assembler_open_team_builder()}
											icon={FaIconType.ExternalLink}
											onClick={() => handleOpenTeamBuilder(combo)}
										/>
									</div>
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
										<div class="mb-2 flex flex-wrap items-center gap-2">
											<h3 class="text-lg font-semibold text-primary-800 dark:text-primary-200">
												{combo.overlaps.length} Overlap{combo.overlaps.length === 1 ? '' : 's'}
											</h3>
											{#if comboResolved(combo)}
												<span
													class="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white"
												>
													{m.tool_assembler_resolved()}
												</span>
											{/if}
											<Button
												icon={FaIconType.Edit}
												label={m.tool_assembler_resolve()}
												onClick={() => openResolve(combo)}
											/>
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
					<div class="flex justify-center">
						<Pagination page={Math.min(page, pageCount)} {pageCount} onChange={changePage} />
					</div>
				</div>
			{/if}
		</div>
	{/if}
</MarginFull>

{#if resolving !== null}
	<ResolveOverlapsModal
		isOpen={true}
		onClose={() => (resolving = null)}
		groups={resolutions.get(resolving.key) ?? []}
		decks={ahdbDecksOf(resolving.combo)}
		{allCards}
		onSetReplacement={setReplacement}
		onReset={resetResolution}
	/>
{/if}

<ImportDecksModal
	{localSources}
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
