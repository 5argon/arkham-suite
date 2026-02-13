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

	const cardPerProduct = $derived(countCardPerProduct(deck));
	const sortedCardPerProduct: { product: Product; count: Count }[] = $derived(
		Array.from(cardPerProduct.entries())
			.map(([product, count]) => ({ product, count }))
			.sort((a, b) => {
				return productOrdering.indexOf(a.product) - productOrdering.indexOf(b.product);
			})
	);
</script>

{#snippet oneProduct(product: Product, count: Count)}
	{#if count.mainCount + (allowSideDeck ? count.sideCount : 0) > 0}
		<div
			class="flex h-7 w-4 flex-col items-center justify-center leading-none"
			onmouseenter={(e) => tooltip.show(product, e)}
			onmouseleave={tooltip.hide}
			role="button"
			tabindex="-1"
		>
			<span><ProductIcon {product} /></span>
			<span class="text-[0.5rem]">{count.mainCount + (allowSideDeck ? count.sideCount : 0)}</span>
		</div>
	{/if}
{/snippet}

<div class="text-primary-900 dark:text-primary-200 flex gap-1">
	{#each sortedCardPerProduct as { product, count }, i (i)}
		{@render oneProduct(product, count)}
	{/each}
</div>

<HoverTooltip visible={tooltip.visible} referenceElement={tooltip.referenceElement}>
	{#if tooltip.data}
		<div class="flex items-center gap-2 py-1 text-neutral-900 dark:text-neutral-100">
			<ProductIcon product={tooltip.data} />
			<span class="text-sm font-medium whitespace-nowrap">{u.productName(tooltip.data)}</span>
		</div>
	{/if}
</HoverTooltip>
