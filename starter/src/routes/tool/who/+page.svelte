<script lang="ts">
	import {
		Button,
		CardFormMultiple,
		type CardItem,
		CardMagnifiedModal,
		CardScanFullSmallGrid,
		DeckbuildingChoiceDisplay,
		divideHalf,
		HelpParagraph,
		MarginFull,
		MarginText,
		PageLead,
		recursivelyGroupCardItems,
		SectionSeparator,
		sortRecursivelyGroupedCards,
		TableCardList
	} from '@5argon/arkham-life-ui';
	import { card, type Card, CardClass, type DecodedMeta, Product } from '@5argon/arkham-kohaku';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getAllCards } from '$lib/card-data';

	const allCards = getAllCards();

	let selectedCardCodes = $state<string[]>([]);
	let magnifiedCard = $state<Card | null>(null);
	let isModalShowing = $state(false);

	// Map selected codes to Card objects for easier processing
	const selectedCards = $derived.by((): Card[] => {
		const cardMap = new Map(allCards.map((c: Card) => [c.code, c]));
		return selectedCardCodes
			.map((code) => cardMap.get(code))
			.filter((c): c is Card => c !== undefined);
	});

	const allInvestigators = $derived.by((): Card[] => {
		return allCards.filter((c: Card) => {
			if (!card.deckbuildingInvestigatorCardsFilter(c)) return false;
			// Prefer showing Revised Core Set in this page.
			if (c.product === Product.CoreSet) return false;
			if (c.product === Product.Promotional) return false;
			return true;
		});
	});

	const expandedInvestigators = $derived.by(() => {
		const result: card.ExpandedInvestigator[] = [];
		for (const inv of allInvestigators) {
			const expanded = card.expandInvestigatorMetas(inv);
			result.push(...expanded);
		}
		return result;
	});

	// Filter investigators that can use ALL selected cards
	const eligibleInvestigators = $derived.by((): CardItem[] => {
		if (selectedCards.length === 0) return [];

		return expandedInvestigators
			.filter((expanded) => {
				// Check if this investigator can use all selected cards
				return selectedCards.every((selectedCard) =>
					card.canUse(expanded.investigator, expanded.meta, selectedCard)
				);
			})
			.map((expanded) => {
				const item: CardItem = {
					card: expanded.investigator,
					quantity: 1,
					// Store meta for DeckbuildingChoiceDisplay
					metaDisplay: expanded.meta
				};
				return item;
			});
	});

	// Convert selected cards to CardItems for display
	const selectedCardItems = $derived.by((): CardItem[] => {
		return selectedCards.map((c) => ({ card: c, quantity: 1 }));
	});

	// Group and sort eligible investigators
	const investigatorsGrouped = $derived(recursivelyGroupCardItems(eligibleInvestigators, ['set']));
	const investigatorsSorted = $derived(
		investigatorsGrouped.map((group) => sortRecursivelyGroupedCards(group, ['set', 'position']))
	);
	const investigatorsHalved = $derived(divideHalf(investigatorsSorted));

	function copyToClipboard(withEmoji: boolean) {
		function cardClassToEmoji(cardClass: CardClass | undefined): string {
			if (!withEmoji) return '';
			switch (cardClass) {
				case CardClass.Guardian:
					return ':ClassGuardian:';
				case CardClass.Seeker:
					return ':ClassSeeker:';
				case CardClass.Rogue:
					return ':ClassRogue:';
				case CardClass.Mystic:
					return ':ClassMystic:';
				case CardClass.Survivor:
					return ':ClassSurvivor:';
				default:
					return '';
			}
		}

		function cardClassToName(cardClass: CardClass): string {
			switch (cardClass) {
				case CardClass.Guardian:
					return 'Guardian';
				case CardClass.Seeker:
					return 'Seeker';
				case CardClass.Rogue:
					return 'Rogue';
				case CardClass.Mystic:
					return 'Mystic';
				case CardClass.Survivor:
					return 'Survivor';
				case CardClass.Neutral:
					return 'Neutral';
			}
		}

		function formatMetaDisplay(inv: Card, meta: DecodedMeta): string {
			const parts: string[] = [];
			if (meta.factionSelected) {
				parts.push(cardClassToName(meta.factionSelected));
			}
			if (meta.faction1 && meta.faction2) {
				parts.push(`${cardClassToName(meta.faction1)} / ${cardClassToName(meta.faction2)}`);
			} else if (meta.faction1) {
				parts.push(cardClassToName(meta.faction1));
			} else if (meta.faction2) {
				parts.push(cardClassToName(meta.faction2));
			}
			if (meta.optionSelected && inv.deckOptions) {
				for (const deckOption of inv.deckOptions) {
					if (deckOption.optionSelect) {
						const matchingOption = deckOption.optionSelect.find(
							(opt) => opt.id === meta.optionSelected
						);
						if (matchingOption && matchingOption.name) {
							parts.push(matchingOption.name);
							break;
						}
					}
				}
			}
			return parts.length > 0 ? `(${parts.join(', ')})` : '';
		}

		const whoCanUse = 'Who Can Use :';
		const query = selectedCards.map((c) => {
			const cardName = c.name;
			const cardClass1 = c.cardClass?.class1;
			const cardClass2 = c.cardClass?.class2;
			const cardClass3 = c.cardClass?.class3;
			const levelString = c.xp !== undefined && c.xp > 0 ? `(${c.xp})` : '';
			return `- ${cardClassToEmoji(cardClass1)}${cardClassToEmoji(cardClass2)}${cardClassToEmoji(cardClass3)} ${cardName} ${levelString}`;
		});
		const result = 'Result : ';
		const resultList = eligibleInvestigators.map((item) => {
			const investigator = item.card;
			const parallelStatus = investigator.product === Product.ParallelInvestigators;
			const investigatorName = parallelStatus ? '⇅ ' + investigator.name : investigator.name;
			const investigatorClass = cardClassToEmoji(investigator.cardClass?.class1);
			const metaString = item.metaDisplay ? formatMetaDisplay(investigator, item.metaDisplay) : '';
			const final: string[] = ['-'];
			if (investigatorClass.length > 0) {
				final.push(investigatorClass);
			}
			final.push(investigatorName);
			if (metaString.length > 0) {
				final.push(metaString);
			}
			return final.join(' ');
		});
		const final = [whoCanUse, ...query, '', result, ...resultList];
		navigator.clipboard.writeText(final.join('\n'));
	}
</script>

<OpenGraph
	description="Query eligible investigators that could run combo cards you are interested in together in their deck."
	image="image/resource/who.webp"
	title="Who Can Use"
	url="/tool/who"
/>

{#snippet metaDisplay(item: CardItem)}
	{#if item.metaDisplay}
		<DeckbuildingChoiceDisplay investigator={item.card} meta={item.metaDisplay} />
	{/if}
{/snippet}

<svelte:head>
	<title>{m.tool_who_page_title()}</title>
</svelte:head>

<PageLead
	description="Query eligible investigators that could run combo cards you are interested in together in their deck."
	title={m.tool_who_title()}
/>

<MarginText>
	<HelpParagraph>
		Essentially an inversed deckbuilder in a sense that regular arkhamdb deckbuilder have you select
		an investigator first, then it shows all eligible cards.
	</HelpParagraph>

	<HelpParagraph>
		Caveat is that it performs the check card-by-card. Therefore it can't account for amount limit
		on when all your query are combined. For example, if you list six Lv. 0 Survivor cards, it shows
		Zoey Samaras as one of the result despite she can only take five off-class cards.
	</HelpParagraph>
</MarginText>

<MarginFull>
	<SectionSeparator title={m.tool_who_query()} />

	<CardFormMultiple
		cards={allCards}
		filter={card.deckbuildingPlayerCardsFilter}
		label={m.common_search_placeholder()}
		onSelectionChange={(codes: string[]) => {
			selectedCardCodes = codes;
		}}
		placeholder={m.common_search_placeholder()}
		selectedCodes={selectedCardCodes}
	/>

	{#if selectedCardItems.length > 0}
		<CardScanFullSmallGrid
			groups={[
				{
					name: '',
					items: selectedCardItems
				}
			]}
			showCardName
		/>
	{/if}

	{#if eligibleInvestigators.length > 0}
		<div class="mt-8">
			<SectionSeparator title={m.tool_who_result()} />
			<div class="mb-4 flex gap-2">
				<Button
					label="Copy Text"
					onClick={() => {
						copyToClipboard(false);
					}}
				/>
				<Button
					label={m.tool_who_copy_discord()}
					onClick={() => {
						copyToClipboard(true);
					}}
				/>
			</div>
			<div class="flex space-x-4 flex-wrap">
				<div>
					<TableCardList
						groups={investigatorsHalved.left}
						afterRenders={[metaDisplay]}
						hideQuantity
						onClick={(card) => {
							magnifiedCard = card;
							isModalShowing = true;
						}}
					/>
				</div>
				<div>
					<TableCardList
						groups={investigatorsHalved.right}
						afterRenders={[metaDisplay]}
						hideQuantity
						onClick={(card) => {
							magnifiedCard = card;
							isModalShowing = true;
						}}
					/>
				</div>
			</div>
		</div>
	{/if}

	<CardMagnifiedModal
		card={magnifiedCard}
		isShowing={isModalShowing}
		onClose={() => {
			isModalShowing = false;
			magnifiedCard = null;
		}}
	/>
</MarginFull>
