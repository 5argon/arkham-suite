<script lang="ts">
	import { CardResolver } from '@5argon/arkham-kohaku';

	import CardLineNotes from '$lib/card/CardLineNotes.svelte';

	import { allCards } from '../card-data';

	const resolver = new CardResolver(allCards);
</script>

<CardLineNotes
	items={[
		{ card: resolver.resolve('01020'), quantity: 2 },
		{ card: resolver.resolve('01021'), quantity: 2, note: 'At 5, 13 XP' }
	]}
/>
