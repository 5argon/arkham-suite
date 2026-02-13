<script lang="ts">
	import type { PageData } from './$types.js';
	import DeckDisplay from '../../../lib/card/DeckDisplay.svelte';
	import { CardResolver } from '@5argon/arkham-kohaku';

	const { data }: { data: PageData } = $props();
	const { resolvedCards } = data;
	const resolver = $derived(new CardResolver(resolvedCards));
</script>

<div class="flex flex-col gap-8">
	{#each Object.entries(data.testDecks) as [key, deckPromise], index (index)}
		{#await deckPromise}
			<p>Loading...</p>
		{:then deck}
			<DeckDisplay {deck} cardResolver={resolver} />
		{/await}
	{/each}
</div>
