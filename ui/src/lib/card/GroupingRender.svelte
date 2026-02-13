<script lang="ts">
	import { fly } from 'svelte/transition';
	import {
		type RecursivelyGroupedCardItem,
		countRecursivelyGroupedCards
	} from './card-item.js';
	import clsx from 'clsx';
	import { PluralResolver } from '../mf2/compile.js';
	import { ProductIcon } from '@5argon/arkham-icon';

	interface Prop {
		group: RecursivelyGroupedCardItem;
		animationDelayIndex: number;
		small?: boolean;
	}
	const { group, animationDelayIndex, small }: Prop = $props();
	const count = $derived(group.items.reduce((acc, item) => acc + countRecursivelyGroupedCards(item), 0));
	const countText = new PluralResolver((count) => {
		return {
			one: `1 Card`,
			other: `${count} Cards`
		};
	});
</script>

<div
	class={clsx(
		'text-black dark:text-white flex items-center',
		small
			? 'small text-xs leading-none border-b border-black/10 dark:border-white/10 my-1'
			: 'from-primary-300/50 dark:from-primary-400/50 via-primary-200/50 dark:via-primary-600/50 my-2 max-w-lg rounded bg-linear-to-r from-20% via-60% pl-2 text-xs '
	)}
	in:fly|global={{ duration: 150, x: -20, delay: animationDelayIndex * 100 }}
>
	{#if group.product}
		<span class="inline-flex items-center mr-1">
			<ProductIcon product={group.product} />
		</span>
	{/if}
	<span>{group.name}</span><span class="count-text text-primary-500 dark:text-primary-300 ml-1"
		>({countText.resolve(count)})</span
	>
</div>

<style>
	.small {
		/* font-size: 0.6rem; */
	}

	.count-text {
		font-size: 0.5rem;
	}
</style>
