<script lang="ts">
	import {
		applyGroupingSorting,
		Button,
		CardFormMultiple,
		type CardItem,
		CardScanFullSmallGrid,
		Checkbox,
		FormRow,
		MarginFull,
		PageLead,
		RadioButtons
	} from '@5argon/arkham-life-ui';
	import { type Card, card } from '@5argon/arkham-kohaku';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const allCards = getAllCards();

	type FilterMode = 'player' | 'campaign';
	let filterMode = $state<FilterMode>('player');
	let selectedCodes = $state<string[]>([]);
	let singleCardMode = $state(false);

	// Choose filter based on mode
	const cardFilter = $derived(
		filterMode === 'player' ? card.playerCardsNonCampaignFilter : card.campaignCardsFilter
	);

	// Choose label based on mode
	const formLabel = $derived(
		filterMode === 'player' ? m.card_search_player_cards() : m.card_search_campaign_cards()
	);

	// Convert selected codes to CardItems for CardScanFullSmallGrid
	const selectedCardItems = $derived.by((): CardItem[] => {
		const cardMap = new Map(allCards.map((c: Card) => [c.code, c]));
		return selectedCodes
			.map((code) => {
				const card = cardMap.get(code);
				if (!card) return null;
				return {
					card,
					quantity: 1
				};
			})
			.filter((item): item is CardItem => item !== null);
	});

	// Apply grouping/sorting (empty arrays mean no grouping)
	const groupedCards = $derived(
		applyGroupingSorting(selectedCardItems, { grouping: [], sortingOrder: [] })
	);
</script>

<OpenGraph
	description="Conjure any card by name and line them up on this virtual table. Click on a card to view it in detail."
	image="image/resource/card.webp"
	title="Card Table"
	url="/tool/card"
/>

<PageLead
	description="Conjure any card by name and line them up on this virtual table. Click on a card to view it in detail."
	title={m.card_title()}
/>

<MarginFull>
	<FormRow>
		<RadioButtons
			bind:selectedValue={filterMode}
			choices={[
				{ value: 'player', label: m.card_filter_player() },
				{ value: 'campaign', label: m.card_filter_campaign() }
			]}
			label={m.card_filter_mode()}
		/>

		<Checkbox bind:checked={singleCardMode} label={m.card_single_mode()} />

		{#if !singleCardMode && selectedCodes.length > 0}
			<Button
				label={m.common_clear()}
				onClick={() => {
					selectedCodes = [];
				}}
			/>
		{/if}
	</FormRow>

	<CardFormMultiple
		cards={allCards}
		filter={cardFilter}
		label={formLabel}
		onSelectionChange={(codes: string[]) => {
			if (singleCardMode) {
				// In single mode, only keep the last selected card
				selectedCodes = codes.slice(-1);
			} else {
				selectedCodes = codes;
			}
		}}
		placeholder={m.common_search_placeholder()}
		selectedCodes={singleCardMode ? selectedCodes.slice(-1) : selectedCodes}
	/>

	{#if selectedCardItems.length > 0}
		<div class="mt-8">
			<CardScanFullSmallGrid showCardName groups={groupedCards} />
		</div>
	{/if}
</MarginFull>
