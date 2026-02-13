<script lang="ts">
	import { CardFormMultiple } from '../../../lib/form/index.js';
	import { CardResolver, card } from '@5argon/arkham-kohaku';
	import { allCards } from '../../card/card-data';

	const resolver = new CardResolver(allCards);
	const resolvedCards = allCards.map((card) => resolver.resolve(card.code));

	let allCardsSelected = $state<string[]>([]);
	let investigatorSelected = $state<string[]>([]);
</script>

<div class="container mx-auto max-w-4xl space-y-8 p-4">
	<h1 class="text-primary-800 dark:text-primary-200 text-3xl font-bold">CardForm Demo</h1>

	<CardFormMultiple
		label="Search Player Cards"
		cards={resolvedCards}
		selectedCodes={allCardsSelected}
		filter={card.playerCardsNonCampaignFilter}
		onSelectionChange={(codes) => (allCardsSelected = codes)}
		placeholder="Type to search..."
	/>

	<CardFormMultiple
		label="Search Potential Player Cards from Campaign Box"
		cards={resolvedCards}
		selectedCodes={allCardsSelected}
		filter={card.potentialPlayerCardsInCampaignBoxFilter}
		onSelectionChange={(codes) => (allCardsSelected = codes)}
		placeholder="Type to search..."
	/>

	<CardFormMultiple
		label="Search Campaign Cards"
		cards={resolvedCards}
		selectedCodes={allCardsSelected}
		filter={card.campaignCardsFilter}
		onSelectionChange={(codes) => (allCardsSelected = codes)}
		placeholder="Type to search..."
	/>

	<CardFormMultiple
		label="Select Investigator"
		cards={resolvedCards}
		selectedCodes={investigatorSelected}
		filter={card.deckbuildingInvestigatorCardsFilter}
		onSelectionChange={(codes) => (investigatorSelected = codes)}
		placeholder="Type to search..."
	/>

	<CardFormMultiple
		label="Search Deckbuilding Player Cards"
		cards={resolvedCards}
		selectedCodes={allCardsSelected}
		filter={card.deckbuildingPlayerCardsFilter}
		onSelectionChange={(codes) => (allCardsSelected = codes)}
		placeholder="Type to search..."
	/>
</div>
