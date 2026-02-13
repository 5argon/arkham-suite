<script lang="ts">
	import CardSquareGrid from '$lib/card/CardSquareGrid.svelte';
	import { CardResolver, Product, card } from '@5argon/arkham-kohaku';
	import type { CardItem } from '$lib/card/card-item.js';
	import { allCards } from '../card-data';

	const resolver = new CardResolver(allCards);
	const resolvedCards = allCards.map((card) => resolver.resolve(card.code));

	// Filter cards by TheDunwichLegacyInvestigatorExpansion product and sort
	const dunwichCards: CardItem[] = resolvedCards
		.filter((c) => c.product === Product.TheDunwichLegacyInvestigatorExpansion)
		.sort(card.investigatorExpansionSorter)
		.map((c) => ({
			card: c,
			quantity: c.quantity,
			id: c.code
		}));
</script>

<div class="space-y-4">
	<CardSquareGrid groups={[{ name: '', items: dunwichCards }]} showQuantity />
</div>
