<script lang="ts">
	import { ProductIcon } from '@5argon/arkham-icon';
	import {
		Product,
		productOrdering,
		type Card,
		type CardQuantity,
		type Deck
	} from '@5argon/arkham-kohaku';
	import { u } from '@5argon/arkham-string';
	import { HoverTooltip } from '../container';
	import { createTooltipState } from '../utility/tooltip-state.svelte.js';
	import Modal from '../layout/Modal.svelte';
	import * as m from '../paraglide/messages.js';

	interface Prop {
		deck: Deck;
		allowSideDeck?: boolean;
	}
	interface Count {
		mainCount: number;
		sideCount: number;
	}
	const { deck, allowSideDeck }: Prop = $props();
	const tooltip = createTooltipState<Product>();

	/** Maximum number of product icons to render inline before collapsing into a "..." button. */
	const maxInlineProducts = 10;

	let modalOpen = $state(false);

	function countFilter(card: Card) {
		return card.encounterSet === undefined;
	}
	function updateCardCount(
		cardQuantities: CardQuantity[],
		cardPerProduct: Map<Product, Count>,
		isSideDeck = false
	) {
		for (const cardQuantity of cardQuantities) {
			const product = cardQuantity.card.product;
			if (product === Product.RandomBasicWeakness) {
				continue;
			}
			let count = cardPerProduct.get(product);
			if (count === undefined) {
				count = {
					mainCount: 0,
					sideCount: 0
				};
				cardPerProduct.set(product, count);
			}
			if (isSideDeck) {
				count.sideCount += cardQuantity.quantity;
			} else {
				count.mainCount += cardQuantity.quantity;
			}
		}
	}

	function countCardPerProduct(deck: Deck) {
		const cardQuantities = deck.mainDeck.filter((c) => countFilter(c.card));
		const cardPerProduct = new Map<Product, Count>();
		updateCardCount(cardQuantities, cardPerProduct);
		const sideCardQuantities = deck.sideDeck.filter((c) => countFilter(c.card));
		updateCardCount(sideCardQuantities, cardPerProduct, true);
		return cardPerProduct;
	}

	function displayCount(count: Count) {
		return count.mainCount + (allowSideDeck ? count.sideCount : 0);
	}

	const cardPerProduct = $derived(countCardPerProduct(deck));
	const sortedCardPerProduct: { product: Product; count: Count }[] = $derived(
		Array.from(cardPerProduct.entries())
			.map(([product, count]) => ({ product, count }))
			.filter(({ count }) => displayCount(count) > 0)
			.sort((a, b) => {
				return productOrdering.indexOf(a.product) - productOrdering.indexOf(b.product);
			})
	);

	const inlineProducts = $derived(sortedCardPerProduct.slice(0, maxInlineProducts));
	const hasOverflow = $derived(sortedCardPerProduct.length > maxInlineProducts);
</script>

{#snippet oneProduct(product: Product, count: Count)}
	<div
		class="flex h-7 w-4 flex-col items-center justify-center leading-none"
		onmouseenter={(e) => tooltip.show(product, e)}
		onmouseleave={tooltip.hide}
		role="button"
		tabindex="-1"
	>
		<span><ProductIcon {product} /></span>
		<span class="text-[0.5rem]">{displayCount(count)}</span>
	</div>
{/snippet}

<div class="text-primary-900 dark:text-primary-200 flex gap-1">
	{#each inlineProducts as { product, count }, i (i)}
		{@render oneProduct(product, count)}
	{/each}
	{#if hasOverflow}
		<button
			type="button"
			class="hover:text-secondary-700 active:text-secondary-800 dark:hover:text-secondary-300 dark:active:text-secondary-100 flex h-7 cursor-pointer items-center justify-center px-0.5 leading-none transition-colors active:scale-95"
			onclick={() => (modalOpen = true)}
		>
			…
		</button>
	{/if}
</div>

<HoverTooltip visible={tooltip.visible} referenceElement={tooltip.referenceElement}>
	{#if tooltip.data}
		<div class="flex items-center gap-2 py-1 text-neutral-900 dark:text-neutral-100">
			<ProductIcon product={tooltip.data} />
			<span class="text-sm font-medium whitespace-nowrap">{u.productName(tooltip.data)}</span>
		</div>
	{/if}
</HoverTooltip>

<Modal isOpen={modalOpen} onClose={() => (modalOpen = false)} title={m.card_deck_utilization_title()}>
	<table class="text-primary-900 dark:text-primary-100 w-full border-collapse text-sm">
		<tbody>
			{#each sortedCardPerProduct as { product, count }, i (i)}
				<tr class="border-primary-300 dark:border-primary-700 border-b last:border-b-0">
					<td class="py-1.5 pr-3 text-lg"><ProductIcon {product} /></td>
					<td class="py-1.5 pr-3 whitespace-nowrap">{u.productName(product)}</td>
					<td class="py-1.5 text-right tabular-nums">{displayCount(count)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Modal>
