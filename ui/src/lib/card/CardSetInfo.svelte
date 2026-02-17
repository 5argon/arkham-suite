<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { CardType, card as cardUtility } from '@5argon/arkham-kohaku';
	interface Prop {
		card: Card;
	}
	const { card }: Prop = $props();
	const isRandomBasicWeakness = $derived(cardUtility.isRandomBasicWeakness(card));
	const isUpgradeSheet = $derived(card.cardType === CardType.Upgrade);
</script>

{#if !isRandomBasicWeakness}
	<span
		class="set-text text-primary-500 dark:text-primary-500 inline-flex cursor-default select-none"
	>
		<!-- <span class=""> -->
		<span class="all-span mr-px">(</span>
		<span class="icon"><ProductIcon product={card.product} /></span>
		{#if !isUpgradeSheet}
			<span class="all-span">{card.position}</span>
		{/if}
		<span class="all-span ml-px">)</span>
		<!-- </span> -->
	</span>
{/if}

<style>
	.all-span {
		display: inline-block;
		line-height: 1;
	}

	.set-text {
		font-size: 0.5rem;
	}

	.icon {
		line-height: 1;
		margin-left: 1px;
		margin-right: 2px;
		transform: translateY(-1px);
	}
</style>
