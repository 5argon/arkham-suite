<script lang="ts">
	import CardLineList from '$lib/card/CardLineList.svelte';
	import type { CardItem } from '$lib/card/card-item.js';
	import { CardResolver, CardClass } from '@5argon/arkham-kohaku';
	import { allCards } from '../card-data';
	const resolver = new CardResolver(allCards);

	const items: CardItem[] = [];
	items.push({ card: resolver.resolve('10013'), quantity: 1 });
	items.push({ card: resolver.resolve('10014'), quantity: 1, owner: resolver.resolve('01001'), labels: [{ text: 'Starter', color: CardClass.Guardian }] });
	items.push({ card: resolver.resolve('10052'), quantity: 2, labels: [{ text: 'Tag 1' }, { text: 'Tag 2', color: CardClass.Seeker }] });
	items.push({ card: resolver.resolve('10056'), quantity: 1 });
	items.push({ card: resolver.resolve('10101'), quantity: 1, owner: resolver.resolve('01002') });
	items.push({ card: resolver.resolve('10102'), quantity: 1 });
	items.push({ card: resolver.resolve('10104'), quantity: 2 });
	items.push({ card: resolver.resolve('10105'), quantity: 1, labels: [{ text: 'Important', color: CardClass.Mystic }] });
	items.push({ card: resolver.resolve('53011'), quantity: 2, greyedOutQuantity: 1 });
	items.push({ card: resolver.resolve('60419'), quantity: 2 });
	items.push({ card: resolver.resolve('01000'), quantity: 3, greyedOutQuantity: 2, owner: resolver.resolve('01001'), labels: [{ text: 'Core' }] });
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

	const items2: CardItem[] = [];
	items2.push({ card: resolver.resolve('01001'), quantity: 1 });
	items2.push({ card: resolver.resolve('10013'), quantity: 1 });
	items2.push({ card: resolver.resolve('10014'), quantity: 1 });
	items2.push({ card: resolver.resolve('10052'), quantity: 2 });
	items2.push({ card: resolver.resolve('10056'), quantity: 1 });
	items2.push({ card: resolver.resolve('10101'), quantity: 1 });
	items2.push({ card: resolver.resolve('10102'), quantity: 1 });
	items2.push({ card: resolver.resolve('10104'), quantity: 2 });
	items2.push({ card: resolver.resolve('10105'), quantity: 1 });
</script>

<CardLineList groups={[{ name: '', items }]} />
<br />
<CardLineList groups={[{ name: '', items: items2 }]} />
