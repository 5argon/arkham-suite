<script lang="ts">
	import {
		type ActionButton,
		BorderedContainer,
		Button,
		CardFormMultiple,
		type CardItem,
		Checkbox,
		DeckbuildingChoiceDisplay,
		FaIconType,
		FlexibleCardDisplay,
		FormRow,
		HelpParagraph,
		InvestigatorExpansionFormMultiple,
		MarginFull,
		MarginText,
		PageLead,
		RadioButtons,
		SectionSeparator,
		type SelectedCardEntry
	} from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { u as stringUtils } from '@5argon/arkham-string';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { getAllCards } from '$lib/card-data';
	import {
		card as cardUtils,
		type Card,
		Product,
		productChapterOneInvestigatorExpansions,
		productCoreSetsNoOldCore,
		productInvestigatorStarterDeck,
		productReturnTo
	} from '@5argon/arkham-kohaku';

	import type { PageProps } from './$types';
	import { SvelteMap } from 'svelte/reactivity';

	const { data }: PageProps = $props();

	const allCards = getAllCards();

	// Get all investigator cards for selection
	const allInvestigatorCards = $derived.by(() => {
		return allCards.filter((c: Card) => {
			if (!cardUtils.deckbuildingInvestigatorCardsFilter(c)) return false;
			// Prefer showing Revised Core Set
			if (c.product === Product.CoreSet) return false;
			if (c.product === Product.Promotional) return false;
			return true;
		});
	});

	// All eligible products for limited pool
	const allEligibleProducts = $derived.by((): Product[] => {
		return [
			...productCoreSetsNoOldCore,
			...productChapterOneInvestigatorExpansions,
			...productInvestigatorStarterDeck,
			...productReturnTo
		];
	});

	let selectedInvestigatorEntries = $state<SelectedCardEntry[]>([]);
	let selectedProducts = $state<Product[]>([]);
	let selectedProductsRandomized = $state<Product[]>([]);
	let randomPoolProducts = $state<Product[]>([]);
	let randomAmount = $state(3);
	let unusableCardsDisplay = $state<'greyed' | 'remove'>('remove');
	let excludeModeFixed = $state(false);
	let excludeModeRandomized = $state(false);

	// Calculate the actual max for random amount based on exclude mode
	const actualRandomPoolSize = $derived.by(() => {
		if (excludeModeRandomized) {
			// Exclude mode: pool is everything except selected
			return allEligibleProducts.length - randomPoolProducts.length;
		} else {
			// Normal mode: pool is the selected products
			return randomPoolProducts.length;
		}
	});

	// Get the single selected investigator with meta
	const selectedInvestigatorWithMeta = $derived.by(() => {
		if (selectedInvestigatorEntries.length === 0) return null;

		const entry = selectedInvestigatorEntries[0];
		const card = allInvestigatorCards.find((c) => c.code === entry.code);
		if (!card) return null;

		return { card, meta: entry.meta ?? {} };
	});

	// Get cards from selected products (both fixed and randomized)
	const cardsFromSelectedProducts = $derived.by(() => {
		// Determine which products to include based on exclude mode
		let fixedProducts: Product[];
		if (excludeModeFixed) {
			// Exclude mode: include all eligible products except selected ones
			fixedProducts = allEligibleProducts.filter((p) => !selectedProducts.includes(p));
		} else {
			// Normal mode: include only selected products
			fixedProducts = selectedProducts;
		}

		// For randomized side, always use the picked products directly
		// (excludeModeRandomized only affects what pool to randomize FROM)
		const randomizedProducts = selectedProductsRandomized;

		const allSelectedProducts = [...fixedProducts, ...randomizedProducts];
		if (allSelectedProducts.length === 0) return [];

		return allCards.filter((card: Card) => {
			// Only include player cards (not encounter cards)
			if (!cardUtils.deckbuildingPlayerCardsFilter(card)) return false;
			// Check if card is from one of the selected products
			return allSelectedProducts.includes(card.product);
		});
	});

	// Pre-compute which cards can be used by the selected investigator
	const cardUsabilityCache = $derived.by(() => {
		if (!selectedInvestigatorWithMeta) {
			return new Map<string, boolean>();
		}

		const cache = new SvelteMap<string, boolean>();
		const { card: investigator, meta } = selectedInvestigatorWithMeta;

		for (const card of cardsFromSelectedProducts) {
			const canBeUsed = cardUtils.canUseWithMetaExpansion(investigator, meta, card);
			cache.set(card.code, canBeUsed);
		}

		return cache;
	});

	// Convert cards to CardItems using the cached usability
	const cardItems: CardItem[] = $derived.by(() => {
		if (cardsFromSelectedProducts.length === 0) {
			return [];
		}

		if (!selectedInvestigatorWithMeta) {
			return cardsFromSelectedProducts.map<CardItem>((card) => ({
				card,
				quantity: card.quantity,
				id: card.code
			}));
		}

		let items = cardsFromSelectedProducts
			.map<CardItem | null>((card) => {
				const canBeUsed = cardUsabilityCache.get(card.code) ?? false;

				if (canBeUsed) {
					return {
						card,
						quantity: card.quantity,
						id: card.code
					};
				} else {
					if (unusableCardsDisplay === 'greyed') {
						return {
							card,
							quantity: card.quantity,
							greyedOutQuantity: card.quantity,
							id: card.code
						};
					} else {
						return null;
					}
				}
			})
			.filter((item) => item !== null);

		// Sort usable cards first if enabled
		if (unusableCardsDisplay === 'greyed') {
			items = items.sort((a, b) => {
				const aIsGreyed = (a.greyedOutQuantity ?? 0) > 0;
				const bIsGreyed = (b.greyedOutQuantity ?? 0) > 0;

				if (aIsGreyed === bIsGreyed) return 0;
				return aIsGreyed ? 1 : -1;
			});
		}

		return items;
	});

	// Action buttons for CardFormMultiple
	const actionButtons: ActionButton[] = $derived.by(() => {
		return [
			{
				icon: FaIconType.Reset,
				onClick: (entry: SelectedCardEntry) => {
					const card = allInvestigatorCards.find((c) => c.code === entry.code);
					if (!card) return;

					const nextMeta = cardUtils.cycleInvestigatorMeta(card, entry.meta ?? null);

					const newEntries = [...selectedInvestigatorEntries];
					newEntries[0] = { ...entry, meta: nextMeta ?? undefined };
					selectedInvestigatorEntries = newEntries;
				},
				shouldShow: (_entry: SelectedCardEntry, card: Card) => {
					const expanded = cardUtils.expandInvestigatorMetas(card);
					return (
						expanded.length > 1 ||
						(expanded.length === 1 && Object.keys(expanded[0].meta).length > 0)
					);
				},
				hideLabel: true,
				label: 'Cycle Meta'
			}
		];
	});

	function handleInvestigatorSelectionChange(entries: SelectedCardEntry[]) {
		// Only keep the last selected investigator (single selection)
		if (entries.length > 0) {
			selectedInvestigatorEntries = [entries[entries.length - 1]];
		} else {
			selectedInvestigatorEntries = [];
		}
	}

	function randomizeProducts() {
		if (randomAmount <= 0) {
			selectedProductsRandomized = [];
			return;
		}

		// Calculate what products are currently on the Fixed side
		let fixedProducts: Product[];
		if (excludeModeFixed) {
			// Exclude mode: fixed side uses all eligible products except selected ones
			fixedProducts = allEligibleProducts.filter((p) => !selectedProducts.includes(p));
		} else {
			// Normal mode: fixed side uses only selected products
			fixedProducts = selectedProducts;
		}

		// Determine the pool to randomize from
		let poolToRandomize: Product[];
		if (excludeModeRandomized) {
			// Exclude mode: randomize from everything except the exclusion list
			poolToRandomize = allEligibleProducts.filter((p) => !randomPoolProducts.includes(p));
		} else {
			// Normal mode: randomize from the selected pool
			poolToRandomize = randomPoolProducts;
		}

		// Remove products that are already on the Fixed side
		poolToRandomize = poolToRandomize.filter((p) => !fixedProducts.includes(p));

		if (poolToRandomize.length === 0) {
			selectedProductsRandomized = [];
			return;
		}

		// Shuffle the pool and pick the specified amount
		const shuffled = [...poolToRandomize].sort(() => Math.random() - 0.5);
		selectedProductsRandomized = shuffled.slice(0, Math.min(randomAmount, shuffled.length));
	}
</script>

<OpenGraph
	description="Take a look at an overview of all the usable cards when playing with limited card pool."
	image="image/resource/limited.webp"
	title="Limited Pool Explorer"
	url="/tool/limited"
/>

<PageLead
	description="Take a look at an overview of all the usable cards when subset player card expansions are applied on a single investigator."
	title="Limited Pool Explorer"
/>

<MarginText>
	<HelpParagraph>
		Limited deckbuilding is where you work with only small amount of player cards in a unit of
		product purchases. Other than being a challenge, it is useful to find interesting combinations
		of cards that may not normally see play together.
	</HelpParagraph>
</MarginText>

<MarginFull>
	<BorderedContainer>
		<SectionSeparator title="Investigator" />
		<CardFormMultiple
			{actionButtons}
			allowDuplicates={false}
			cards={allInvestigatorCards}
			filter={cardUtils.deckbuildingInvestigatorCardsFilter}
			label="Search Investigator"
			onEntriesChange={handleInvestigatorSelectionChange}
			selectedEntries={selectedInvestigatorEntries}
		>
			{#snippet afterCardLine(entry: SelectedCardEntry, card: Card)}
				{#if entry.meta && Object.keys(entry.meta).length > 0}
					<DeckbuildingChoiceDisplay investigator={card} meta={entry.meta} />
				{/if}
			{/snippet}
		</CardFormMultiple>

		<SectionSeparator title="Player Card Expansions" />
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<SectionSeparator inner title="Fixed" />
				<Checkbox bind:checked={excludeModeFixed} label="All Expansions, Except..." />
				<InvestigatorExpansionFormMultiple
					label={excludeModeFixed ? 'Search Exclusions' : 'Search Expansions'}
					onSelectionChange={(products) => (selectedProducts = products)}
					placeholder={excludeModeFixed
						? 'Type to search for expansions to exclude...'
						: 'Type to search for expansions...'}
					products={allEligibleProducts}
					{selectedProducts}
				/>
			</div>

			<div>
				<SectionSeparator inner title="Randomized" />
				<Checkbox bind:checked={excludeModeRandomized} label="All Expansions, Except..." />
				<InvestigatorExpansionFormMultiple
					label={excludeModeRandomized ? 'Exclusion Pool' : 'Randomization Pool'}
					onSelectionChange={(products) => (randomPoolProducts = products)}
					placeholder={excludeModeRandomized
						? 'Select products to exclude from randomization...'
						: 'Select products to randomize from...'}
					products={allEligibleProducts}
					selectedProducts={randomPoolProducts}
				/>

				<div class="mt-4 space-y-2">
					<FormRow>
						<label class="text-primary-900 dark:text-primary-100 text-sm font-medium">
							Pick Amount:
							<input
								bind:value={randomAmount}
								class="border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950 text-primary-900 dark:text-primary-100 ml-2 w-20 rounded border px-2 py-1"
								max={actualRandomPoolSize}
								min="1"
								type="number"
							/>
						</label>
					</FormRow>

					<div class="space-y-1">
						{#if selectedProductsRandomized.length === 0}
							<HelpParagraph
								>Use the Randomize button below to pick randomized expansions.
							</HelpParagraph>
						{:else}
							<p class="text-primary-700 dark:text-primary-300 text-sm font-medium">
								Randomized Expansions:
							</p>
							{#each selectedProductsRandomized as product (product)}
								<div
									class="bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-primary-100 flex items-center gap-2 rounded p-2"
								>
									<ProductIcon {product} />
									<span>{stringUtils.productName(product)}</span>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</BorderedContainer>

	<div
		class="bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 mt-4 flex flex-wrap items-center gap-4 rounded-lg border p-4"
	>
		<FormRow>
			<RadioButtons
				bind:selectedValue={unusableCardsDisplay}
				choices={[
					{ value: 'greyed', label: 'Greyed Out' },
					{ value: 'remove', label: 'Remove' }
				]}
				label="Unusable Cards Display"
			/>
			{#if (!excludeModeRandomized && randomPoolProducts.length > 0) || excludeModeRandomized}
				<Button
					label="Randomize"
					icon={FaIconType.Reset}
					onClick={randomizeProducts}
					disabled={randomAmount <= 0}
				/>
			{/if}
		</FormRow>
	</div>

	<div class="mt-4">
		<FlexibleCardDisplay
			cards={cardItems}
			defaultSettings={{
				grouping: ['levelGrouped', 'set'],
				sortingOrder: ['level']
			}}
			defaultViewMode="icons"
			hideChecklistMode={true}
		/>
	</div>
</MarginFull>
