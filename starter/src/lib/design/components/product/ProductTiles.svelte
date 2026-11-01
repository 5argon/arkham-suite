<!--
@component
A centered row of product graphic buttons, wrapping as needed.
-->
<script lang="ts">
	import { GraphicButton, productImageUrl } from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import {
		color,
		Product,
		productDeckbuildingExpansions,
		productInvestigatorDeck
	} from '@5argon/arkham-kohaku';
	import { m as stringMessages, u as stringUtils } from '@5argon/arkham-string';

	interface Prop {
		products: Product[];
		/**
		 * A function runs on click, a string is a link.
		 */
		onClick: (product: Product) => (() => void) | string;
		/**
		 * Makes them toggles. Omit for plain buttons.
		 */
		active?: (product: Product) => boolean;
		locked?: (product: Product) => boolean;
	}
	const { products, onClick, active, locked }: Prop = $props();

	function subtext(product: Product): string | undefined {
		if (product === Product.CoreSet2026) {
			return undefined;
		}
		if (productInvestigatorDeck.includes(product)) {
			return stringMessages.productTypeInvestigatorDeck();
		}
		return productDeckbuildingExpansions.includes(product)
			? stringMessages.productTypeDeckbuildingExpansion()
			: stringMessages.productTypeInvestigatorExpansion();
	}
</script>

<div class="product-tiles">
	{#each products as product (product)}
		<GraphicButton
			small
			locked={locked?.(product)}
			text={stringUtils.productName(product)}
			subtext={subtext(product)}
			graphic={productImageUrl(product)}
			accentColor={color.getColor(color.productToColors(product), 950, false)}
			active={active?.(product)}
			onClick={onClick(product)}
		>
			<ProductIcon {product} />
		</GraphicButton>
	{/each}
</div>

<style>
	/* Wide enough for exactly 3 GraphicButtons (250px each) per row, centered:
	   the core and 5 decks wrap as 3 + 3, and on narrower screens as 2 + 2 + 2. */
	.product-tiles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
		max-width: 764px;
		margin-inline: auto;
	}
</style>
