<script lang="ts">
	import {
		ahdbDeckToDeck,
		ahdbTabooToTaboo,
		CardResolver,
		type AhdbDeck,
		type Taboo,
		type Deck
	} from '@5argon/arkham-kohaku';
	import { allCards, allAhdbTaboos } from '../card-data';
	import sampleRexDeckJson from './sampleRexDeck.json';
	import type { PageData } from './$types.js';
	import DeckBanner from '../../../lib/card/DeckBanner.svelte';

	const { data }: { data: PageData } = $props();

	const resolver = new CardResolver(allCards);
	const sampleRexDeckAhdb: AhdbDeck = sampleRexDeckJson;
	const allTaboo: Taboo[] = allAhdbTaboos.map((t) => ahdbTabooToTaboo(t));

	const sampleRexDeck: Deck = ahdbDeckToDeck(
		sampleRexDeckAhdb,
		() => {
			throw new Error('Should not need any other deck.');
		},
		resolver,
		allTaboo
	);
</script>

<div class="flex flex-col gap-2">
	{#each Object.entries(data.testDecks) as [key, deckPromise], index (index)}
		{#await deckPromise}
			<p>Loading...</p>
		{:then deck}
			<DeckBanner cardResolver={resolver} {deck} />
		{/await}
	{/each}
</div>
