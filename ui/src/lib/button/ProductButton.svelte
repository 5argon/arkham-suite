<!--
@component
A product as a graphic button, with its art, icon, colors and what kind of product it is.
-->
<script lang="ts">
	import { ProductIcon } from '@5argon/arkham-icon';
	import {
		color,
		Product,
		productDeckbuildingExpansions,
		productInvestigatorDeck
	} from '@5argon/arkham-kohaku';
	import { m as stringMessages, u as stringUtils } from '@5argon/arkham-string';

	import { productImageUrl } from '../utility/campaign.js';
	import GraphicButton from './GraphicButton.svelte';

	interface Prop {
		product: Product;
		/**
		 * A function runs on click, a string is a link.
		 */
		onClick: (() => void) | string;
		/**
		 * Makes it a toggle. Omit for a plain button.
		 */
		active?: boolean;
		locked?: boolean;
	}
	const { product, onClick, active, locked }: Prop = $props();

	const subtext = $derived.by(() => {
		if (product === Product.CoreSet2026) return undefined;
		if (productInvestigatorDeck.includes(product)) {
			return stringMessages.productTypeInvestigatorDeck();
		}
		return productDeckbuildingExpansions.includes(product)
			? stringMessages.productTypeDeckbuildingExpansion()
			: stringMessages.productTypeInvestigatorExpansion();
	});
</script>

<GraphicButton
	small
	{locked}
	text={stringUtils.productName(product)}
	{subtext}
	graphic={productImageUrl(product)}
	accentColor={color.getColor(color.productToColors(product), 950, false)}
	{active}
	{onClick}
>
	<ProductIcon {product} />
</GraphicButton>
