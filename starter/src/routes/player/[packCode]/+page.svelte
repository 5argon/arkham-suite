<script lang="ts">
	import {
		type ActionButton,
		BackButton,
		BorderedContainer,
		Button,
		CardFormMultiple,
		type CardItem,
		CardSquareGrid,
		DeckbuildingChoiceDisplay,
		FaIconType,
		FlexibleCardDisplay,
		FormLabelWithHelp,
		FormRow,
		HelpParagraph,
		MarginFull,
		PageLead,
		productImageUrl,
		RadioButtons,
		type SelectedCardEntry
	} from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import { productToExploreRoute } from '$lib/utility/product';
	import * as m from '$lib/paraglide/messages.js';
	import { u as stringUtils } from '@5argon/arkham-string';
	import {
		card as cardUtils,
		type Card,
		type CardCode,
		type DecodedMeta,
		productRepackaged,
		sorter
	} from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';

	import type { PageProps } from './$types';
	import { SvelteMap } from 'svelte/reactivity';

	const { data }: PageProps = $props();
	const product = $derived(data.product);

	const allCards = getAllCards();
	const productCards = $derived.by(() => {
		const filtered = allCards.filter(
			(card) => cardUtils.playerCardsNonCampaignFilter(card) && card.product === product
		);
		return filtered.sort((a, b) => sorter('position', a, b));
	});
	const allInvestigatorCards = $derived(
		allCards.filter(cardUtils.deckbuildingInvestigatorCardsFilter)
	);
	const investigatorsInThisBox = $derived(
		productCards.filter((card) => cardUtils.deckbuildingInvestigatorCardsFilter(card))
	);

	let fittingRoomMode = $state(false);
	let selectedInvestigatorEntries = $state<SelectedCardEntry[]>([]);
	let unusableCardsDisplay = $state<'greyed' | 'remove'>('greyed');

	// Get selected investigators as Card objects with their meta
	const selectedInvestigatorsWithMeta = $derived(
		selectedInvestigatorEntries
			.map((entry) => {
				const card = allInvestigatorCards.find((card) => card.code === entry.code);
				if (!card) return null;
				return { card, meta: entry.meta ?? {} };
			})
			.filter((item): item is { card: Card; meta: DecodedMeta } => item !== null)
	);

	// Pre-compute which cards can be used by the selected investigators (memoized)
	const cardUsabilityCache = $derived.by(() => {
		if (!fittingRoomMode || selectedInvestigatorsWithMeta.length === 0) {
			return new Map<string, boolean>();
		}
		const cache = new SvelteMap<string, boolean>();
		for (const card of productCards) {
			const canBeUsed = selectedInvestigatorsWithMeta.some(({ card: investigator, meta }) =>
				cardUtils.canUseWithMetaExpansion(investigator, meta, card)
			);
			cache.set(card.code, canBeUsed);
		}

		return cache;
	});

	// Convert cards to CardItems using the cached usability
	const cardItems: CardItem[] = $derived.by(() => {
		if (!fittingRoomMode || selectedInvestigatorsWithMeta.length === 0) {
			return productCards.map<CardItem>((card) => ({
				card,
				quantity: card.quantity,
				id: card.code
			}));
		}

		// In fitting room mode with investigators selected
		const items = productCards
			.map<CardItem | null>((card) => {
				const canBeUsed = cardUsabilityCache.get(card.code) ?? false;

				if (canBeUsed) {
					// Card can be used by at least one investigator
					return {
						card,
						quantity: card.quantity,
						id: card.code
					};
				} else {
					// Card cannot be used
					if (unusableCardsDisplay === 'greyed') {
						return {
							card,
							quantity: card.quantity,
							greyedOutQuantity: card.quantity,
							id: `${card.code}-greyed`
						};
					} else {
						// Remove mode - return null and filter out
						return null;
					}
				}
			})
			.filter((item) => item !== null);

		return items;
	});

	const investigatorGroups = $derived.by(() => {
		if (!fittingRoomMode) return [];

		const selectedCodes = new Set(selectedInvestigatorEntries.map((e) => e.code));
		return [
			{
				name: '',
				items: investigatorsInThisBox.map((card) => ({
					card: card,
					quantity: 1,
					id: card.code,
					greyedOutQuantity: selectedCodes.has(card.code) ? 1 : 0
				}))
			}
		];
	});

	// Action buttons for CardFormMultiple
	const actionButtons: ActionButton[] = $derived.by(() => {
		if (!fittingRoomMode) return [];

		return [
			{
				icon: FaIconType.Reset,
				onClick: (entry: SelectedCardEntry) => {
					const card = allInvestigatorCards.find((c) => c.code === entry.code);
					if (!card) return;

					// Get the next meta configuration
					const nextMeta = cardUtils.cycleInvestigatorMeta(card, entry.meta ?? null);

					// Find the index of this entry
					const index = selectedInvestigatorEntries.findIndex(
						(e) => e.code === entry.code && JSON.stringify(e.meta) === JSON.stringify(entry.meta)
					);

					if (index !== -1) {
						// Update the entry with the new meta
						const newEntries = [...selectedInvestigatorEntries];
						newEntries[index] = { ...entry, meta: nextMeta ?? undefined };
						selectedInvestigatorEntries = newEntries;
					}
				},
				shouldShow: (_entry: SelectedCardEntry, card: Card) => {
					// Only show if investigator has multiple meta options
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

	function handleFittingRoomToggle() {
		fittingRoomMode = !fittingRoomMode;
		if (!fittingRoomMode) {
			selectedInvestigatorEntries = [];
		}
	}

	function handleInvestigatorSelectionChange(entries: SelectedCardEntry[]) {
		selectedInvestigatorEntries = entries;
	}

	function handleInvestigatorClick(code: CardCode) {
		if (selectedInvestigatorEntries.some((e) => e.code === code)) {
			// Remove all entries with this code
			selectedInvestigatorEntries = selectedInvestigatorEntries.filter((e) => e.code !== code);
		} else {
			// Add new entry
			selectedInvestigatorEntries = [...selectedInvestigatorEntries, { code }];
		}
	}
</script>

<OpenGraph
	description={`Explore player cards from ${stringUtils.productName(product)}.`}
	image={productImageUrl(product)}
	title={stringUtils.productName(product)}
	url={`/player/${productToExploreRoute(product)}`}
/>

<PageLead image={productImageUrl(product)} title={stringUtils.productName(product)} />

<MarginFull>
	<div class="mb-4 flex gap-4">
		<BackButton label={m.explore_back_to_home()} onClick="/player" />
		<Button
			highlighted={fittingRoomMode}
			icon={FaIconType.Investigator}
			label="Fitting Room"
			onClick={handleFittingRoomToggle}
		/>
	</div>

	{#if fittingRoomMode}
		<BorderedContainer>
			<HelpParagraph>
				Select investigators to see which cards from this expansion they can include in their deck.
				This might help you make a more informed purchase decision based on existing investigators
				in your collection.
			</HelpParagraph>
			<FormLabelWithHelp label="From This Expansion">
				<CardSquareGrid
					groups={investigatorGroups}
					onClick={(item) => handleInvestigatorClick(item.code)}
				/>
			</FormLabelWithHelp>
			<CardFormMultiple
				label="Search All Investigators"
				cards={allInvestigatorCards}
				selectedEntries={selectedInvestigatorEntries}
				onEntriesChange={handleInvestigatorSelectionChange}
				filter={cardUtils.deckbuildingInvestigatorCardsFilter}
				allowDuplicates={true}
				{actionButtons}
			>
				{#snippet afterCardLine(entry: SelectedCardEntry, card: Card)}
					{#if entry.meta && Object.keys(entry.meta).length > 0}
						<DeckbuildingChoiceDisplay investigator={card} meta={entry.meta} />
					{/if}
				{/snippet}
			</CardFormMultiple>
			<div class="flex flex-row gap-2">
				<FormRow>
					<RadioButtons
						label="Unusable Cards Display"
						bind:selectedValue={unusableCardsDisplay}
						choices={[
							{ value: 'greyed', label: 'Greyed Out' },
							{ value: 'remove', label: 'Remove' }
						]}
					/>
				</FormRow>
			</div>
		</BorderedContainer>
	{/if}

	<FlexibleCardDisplay
		cards={cardItems}
		defaultSettings={{
			grouping: [],
			sortingOrder: []
		}}
		hideChecklistMode={fittingRoomMode}
	/>
</MarginFull>
