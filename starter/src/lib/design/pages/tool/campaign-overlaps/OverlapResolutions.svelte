<!--
@component
Display overlap resolution mappings with algorithm selection
-->
<script lang="ts">
	import {
		BorderedContainer,
		type CardItem,
		CardItemMetadata,
		type CardLabelProp,
		Dropdown,
		FaIcon,
		FaIconType,
		HelpParagraph,
		RadioButtons,
		type RecursivelyGroupedCardItem,
		TableCardList
	} from '@5argon/arkham-life-ui';
	import { CardClass } from '@5argon/arkham-kohaku';
	import { SvelteMap } from 'svelte/reactivity';
	import type {
		CampaignSide,
		DeckPart,
		MappingAlgorithm,
		ResolutionMapping,
		SubPriority
	} from './campaign-overlaps-logic';
	import { fly } from 'svelte/transition';

	interface Props {
		mappings: ResolutionMapping[];
		selectedAlgorithm: MappingAlgorithm;
		selectedSubPriority: SubPriority;
	}

	let {
		mappings,
		selectedAlgorithm = $bindable(),
		selectedSubPriority = $bindable()
	}: Props = $props();

	// Algorithm options
	const algorithmOptions: { value: MappingAlgorithm; label: string }[] = [
		{
			value: 'deck-import-order',
			label: 'Deck Import Order Priority'
		},
		{
			value: 'same-deck-index',
			label: 'Same Deck Index Priority'
		}
	];

	// Sub-priority options
	const subPriorityOptions: { value: SubPriority; label: string }[] = [
		{
			value: 'main-deck',
			label: 'Main Deck'
		},
		{
			value: 'investigator',
			label: 'Investigator'
		}
	];

	interface MergedMapping {
		source: ResolutionMapping['source'];
		destination: ResolutionMapping['destination'];
		quantity: number;
		cardCode: string;
	}

	interface MappingCardItem extends CardItem {
		mergedMapping: MergedMapping;
	}

	// Helper function to create labels for campaign and deck part
	function createLabels(campaign: CampaignSide, deckPart: DeckPart): CardLabelProp[] {
		const labels: CardLabelProp[] = [];

		// Campaign badge
		labels.push({
			text: `${campaign}`,
			color: campaign === 'A' ? CardClass.Guardian : CardClass.Seeker
		});

		// Deck part (only SIDE and EXTRA, MAIN is implied)
		if (deckPart === 'side') {
			labels.push({
				text: 'Side',
				color: CardClass.Survivor
			});
		} else if (deckPart === 'extra') {
			labels.push({
				text: 'Extra',
				color: CardClass.Neutral
			});
		}

		return labels;
	}

	// Convert mappings to groups for TableCardList with merging
	const groups = $derived.by((): RecursivelyGroupedCardItem[] => {
		// Group mappings by card code, then by source/dest key
		const byCard = new SvelteMap<string, SvelteMap<string, MergedMapping>>();

		for (const mapping of mappings) {
			const cardCode = mapping.source.card.code;

			if (!byCard.has(cardCode)) {
				byCard.set(cardCode, new SvelteMap<string, MergedMapping>());
			}

			const cardMap = byCard.get(cardCode)!;

			// Create merge key: source deck + source part + dest deck + dest part
			const mergeKey = `${mapping.source.deck.investigator.code}-${mapping.source.deckPart}-${mapping.destination.deck.investigator.code}-${mapping.destination.deckPart}`;

			if (cardMap.has(mergeKey)) {
				// Increment quantity
				cardMap.get(mergeKey)!.quantity++;
			} else {
				// Create new merged mapping
				cardMap.set(mergeKey, {
					source: mapping.source,
					destination: mapping.destination,
					quantity: 1,
					cardCode
				});
			}
		}

		// Convert to groups (one group per card)
		const result: RecursivelyGroupedCardItem[] = [];

		// Sort by card code
		const sortedCards = Array.from(byCard.keys()).sort();

		for (const cardCode of sortedCards) {
			const cardMap = byCard.get(cardCode)!;
			const mergedMappings = Array.from(cardMap.values());

			// Create items for each merged mapping
			const items: MappingCardItem[] = mergedMappings.map((merged, idx) => ({
				card: merged.source.card,
				quantity: merged.quantity,
				id: `mapping-${cardCode}-${idx}`,
				mergedMapping: merged
			}));

			result.push({
				name: '',
				items: items as CardItem[]
			});
		}

		return result;
	});
</script>

{#snippet renderSource(cardItem: CardItem)}
	{@const mappingItem = cardItem as MappingCardItem}
	{@const source = mappingItem.mergedMapping.source}
	<CardItemMetadata
		card={source.card}
		owner={source.deck.investigator}
		labels={createLabels(source.campaign, source.deckPart)}
	/>
{/snippet}

{#snippet renderArrow()}
	<div class="flex items-center justify-center px-2">
		<FaIcon icon={FaIconType.RightSingle} class="text-primary-500" />
	</div>
{/snippet}

{#snippet renderDestination(cardItem: CardItem)}
	{@const mappingItem = cardItem as MappingCardItem}
	{@const dest = mappingItem.mergedMapping.destination}
	<CardItemMetadata
		card={dest.card}
		owner={dest.deck.investigator}
		labels={createLabels(dest.campaign, dest.deckPart)}
	/>
{/snippet}

<div in:fly|global={{ duration: 150, x: -20 }}>
	<BorderedContainer>
		<div class="flex flex-col gap-4">
			<!-- Algorithm Selection -->
			<div class="flex flex-col gap-2">
				<div class="flex flex-col sm:flex-row gap-4">
					<div class="flex-1">
						<Dropdown
							bind:value={selectedAlgorithm}
							label="Resolution Algorithm"
							options={algorithmOptions}
						/>
					</div>
					<div class="flex-1">
						<RadioButtons
							bind:selectedValue={selectedSubPriority}
							choices={subPriorityOptions}
							label="Sub-Priority"
						/>
					</div>
				</div>
				<div class="text-sm text-muted">
					{#if selectedAlgorithm === 'deck-import-order'}
						<HelpParagraph>
							Pairs cards from Campaign A to Campaign B in the order decks were imported.
							{#if selectedSubPriority === 'investigator'}
								Processes all cards from each investigator (main → side → extra) before moving to
								the next.
							{:else}
								Processes all main decks first across all investigators, then side decks, then extra
								decks. Minimizes non-main deck card movement.
							{/if}
						</HelpParagraph>
					{:else if selectedAlgorithm === 'same-deck-index'}
						<HelpParagraph>
							First tries to match cards between decks at the same import position (1st deck with
							1st deck, 2nd with 2nd, etc.).
							{#if selectedSubPriority === 'investigator'}
								Then processes remaining cards by investigator (main → side → extra).
							{:else}
								Then processes remaining cards by deck type (main → side → extra) across all
								investigators. Minimizes non-main deck card movement.
							{/if}
						</HelpParagraph>
					{/if}
				</div>
			</div>

			<!-- Mappings Table -->
			{#if groups.length === 0}
				<p class="text-center text-muted">No mappings available</p>
			{:else}
				<TableCardList
					{groups}
					beforeRenders={[]}
					afterRenders={[renderSource, renderArrow, renderDestination]}
				/>
			{/if}
		</div>
	</BorderedContainer>
</div>
