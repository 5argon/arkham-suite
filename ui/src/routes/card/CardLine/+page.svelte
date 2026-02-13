<script lang="ts">
	import CardLine from '$lib/card/CardLine.svelte';
	import { CardResolver } from '@5argon/arkham-kohaku';
	import { allCards } from '../card-data';
	const resolver = new CardResolver(allCards);
</script>

<div class="flex flex-col space-y-2">
	<CardLine card={resolver.resolve('01516')} quantity={2}></CardLine>
	<CardLine card={resolver.resolve('09038')} quantity={2}></CardLine>
	<CardLine card={resolver.resolve('09054')} quantity={1}></CardLine>
	<CardLine card={resolver.resolve('06162')} quantity={3}></CardLine>
	<CardLine card={resolver.resolve('05279')}></CardLine>
	<CardLine card={resolver.resolve('10119')}></CardLine>
	<CardLine card={resolver.resolve('02310')}></CardLine>
	<CardLine card={resolver.resolve('08099')}></CardLine>
	<CardLine card={resolver.resolve('09054')} quantity={1} greyedOutQuantity={1}></CardLine>
	<CardLine card={resolver.resolve('06162')} quantity={3} greyedOutQuantity={2}></CardLine>
</div>
