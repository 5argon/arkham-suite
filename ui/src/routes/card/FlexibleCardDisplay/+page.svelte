<script lang="ts">
	import FlexibleCardDisplay from '$lib/card/FlexibleCardDisplay.svelte';
	import type { CardItem } from '$lib/card/card-item.js';
	import { CardResolver } from '@5argon/arkham-kohaku';
	import { allCards } from '../card-data';
	const resolver = new CardResolver(allCards);

	const items: CardItem[] = [];
	items.push({ card: resolver.resolve('10013'), quantity: 1 });
	items.push({ card: resolver.resolve('10014'), quantity: 1 });
	items.push({ card: resolver.resolve('10052'), quantity: 2 });
	items.push({ card: resolver.resolve('10056'), quantity: 1 });
	items.push({ card: resolver.resolve('10101'), quantity: 1 });
	items.push({ card: resolver.resolve('10102'), quantity: 1 });
	items.push({ card: resolver.resolve('10104'), quantity: 2 });
	items.push({ card: resolver.resolve('10105'), quantity: 1 });
	items.push({ card: resolver.resolve('53011'), quantity: 2, greyedOutQuantity: 1 });
	items.push({ card: resolver.resolve('60419'), quantity: 2 });
	items.push({ card: resolver.resolve('01000'), quantity: 3, greyedOutQuantity: 2 });
	items.push({ card: resolver.resolve('01089'), quantity: 2 });
	items.push({ card: resolver.resolve('01090'), quantity: 2 });
	items.push({ card: resolver.resolve('06117'), quantity: 1, greyedOutQuantity: 1 });
	items.push({ card: resolver.resolve('06201'), quantity: 1 });
	items.push({ card: resolver.resolve('07023'), quantity: 2 });
	items.push({ card: resolver.resolve('07028'), quantity: 2 });
	items.push({ card: resolver.resolve('07032'), quantity: 2 });
	items.push({ card: resolver.resolve('07117'), quantity: 2 });
	items.push({ card: resolver.resolve('07122'), quantity: 1 });
	items.push({ card: resolver.resolve('07222'), quantity: 2 });
	items.push({ card: resolver.resolve('07271'), quantity: 2 });
	items.push({ card: resolver.resolve('08125'), quantity: 1 });
</script>

<FlexibleCardDisplay cards={items} />
