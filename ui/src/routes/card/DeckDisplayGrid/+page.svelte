<script lang="ts">
	import DeckDisplayGrid from '$lib/card/DeckDisplayGrid.svelte';
	import type { CardItem } from '$lib/card/card-item.js';
	import { CardResolver } from '@5argon/arkham-kohaku';
	import { allCards } from '../card-data';
	const resolver = new CardResolver(allCards);
	const mainCards: CardItem[] = [];
	mainCards.push({ card: resolver.resolve('10013'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('10014'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('10052'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('10056'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('10101'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('10102'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('10104'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('10105'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('53011'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('60419'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('01000'), quantity: 3 });
	mainCards.push({ card: resolver.resolve('01089'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('01090'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('06117'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('06201'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('07023'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('07028'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('07032'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('07117'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('07122'), quantity: 1 });
	mainCards.push({ card: resolver.resolve('07222'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('07271'), quantity: 2 });
	mainCards.push({ card: resolver.resolve('08125'), quantity: 1 });

	const sideCards: CardItem[] = [];
	sideCards.push({ card: resolver.resolve('10075'), quantity: 2 });
	sideCards.push({ card: resolver.resolve('10101'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('10102'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('10132'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('60411'), quantity: 2 });
	sideCards.push({ card: resolver.resolve('60424'), quantity: 2 });
	sideCards.push({ card: resolver.resolve('01063'), quantity: 2 });
	sideCards.push({ card: resolver.resolve('05116'), quantity: 2 });
	sideCards.push({ card: resolver.resolve('05316'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('06117'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('06201'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('07225'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('08062'), quantity: 1 });
	sideCards.push({ card: resolver.resolve('09087'), quantity: 2 });
</script>

<DeckDisplayGrid
	{mainCards}
	{sideCards}
	toolbar={{ showCardNames: true, spreadCopies: true, typeGrouped: true }}
/>
