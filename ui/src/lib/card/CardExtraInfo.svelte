<!--
@component
Show more information of a given card inline in the desired order.
-->
<script lang="ts">
	import { CardType, type Card } from '@5argon/arkham-kohaku';
	import ImageIconAssetSlots from './ImageIconAssetSlots.svelte';
	import CardCostCircle from './CardCostCircle.svelte';
	import ImageIconCommit from './ImageIconCommit.svelte';
	import HealthSanity from './HealthSanity.svelte';

	export type ExtraInformation = 'cost' | 'commit' | 'slot' | 'soak';
	interface Prop {
		card: Card;
		extraInfo: ExtraInformation[];
	}
	const { card, extraInfo }: Prop = $props();
</script>

<span class="flex items-center gap-1 select-none">
	{#each extraInfo as info, i (i)}
		{#if info === 'commit' && card.cardType !== CardType.Investigator}
			<ImageIconCommit {card} />
		{/if}
		{#if info === 'slot' && card.cardType === CardType.Asset && card.slots !== undefined}
			<ImageIconAssetSlots slots={card.slots} />
		{/if}
		{#if info === 'cost' && card.cardType !== CardType.Investigator && card.cost !== null && card.cost !== undefined}
			<span class="shrink-0">
				<CardCostCircle {card} />
			</span>
		{/if}
		{#if info === 'soak' && card.cardType !== CardType.Enemy}
			<HealthSanity health={card.health} sanity={card.sanity} />
		{/if}
	{/each}
</span>
