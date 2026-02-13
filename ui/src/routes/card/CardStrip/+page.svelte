<script lang="ts">
	import CardStrip from '$lib/card/CardStrip.svelte';
	import { CardResolver } from '@5argon/arkham-kohaku';
	import { allCards } from '../card-data';
	const resolver = new CardResolver(allCards);
</script>

<div class="flex">
	<CardStrip card={resolver.resolve('02001')}></CardStrip>
</div>
