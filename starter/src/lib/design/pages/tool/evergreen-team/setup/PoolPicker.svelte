<script lang="ts">
	import {
		Button,
		GraphicButton,
		HelpParagraph,
		productImageUrl,
		RadioButtons,
		SectionSeparator
	} from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { color, Product } from '@5argon/arkham-kohaku';
	import { m as stringMessages, u as stringUtils } from '@5argon/arkham-string';

	import * as m from '$lib/paraglide/messages.js';
	import { deckProductsForCore } from '$lib/tool/evergreen-team/pool';
	import type { EvergreenCore } from '$lib/tool/evergreen-team/types';

	interface Prop {
		core: EvergreenCore;
		deckProducts: Product[];
		onCoreChange: (core: EvergreenCore) => void;
		onDeckProductToggle: (product: Product, included: boolean) => void;
		onSetAllDeckProducts: (products: Product[]) => void;
	}
	const { core, deckProducts, onCoreChange, onDeckProductToggle, onSetAllDeckProducts }: Prop =
		$props();

	const availableDeckProducts = $derived(deckProductsForCore(core));
	const allIncluded = $derived(availableDeckProducts.every((p) => deckProducts.includes(p)));
</script>

<SectionSeparator title={m.tool_evergreen_team_core_box()} />
<RadioButtons
	choices={[
		{
			value: Product.CoreSet2026 as EvergreenCore,
			label: stringUtils.productName(Product.CoreSet2026)
		},
		{
			value: Product.RevisedCoreSet as EvergreenCore,
			label: stringUtils.productName(Product.RevisedCoreSet)
		}
	]}
	label={m.tool_evergreen_team_core_box()}
	bind:selectedValue={() => core, (v) => onCoreChange(v)}
/>

<SectionSeparator title={m.tool_evergreen_team_include_decks()} />
<HelpParagraph>
	{m.tool_evergreen_team_include_decks_help()}
</HelpParagraph>
<div class="mb-2">
	<Button
		label={allIncluded ? m.tool_evergreen_team_deselect_all() : m.tool_evergreen_team_select_all()}
		onClick={() => onSetAllDeckProducts(allIncluded ? [] : [...availableDeckProducts])}
	/>
</div>
<div class="deck-buttons">
	{#each availableDeckProducts as product (product)}
		{@const included = deckProducts.includes(product)}
		<GraphicButton
			small
			text={stringUtils.productName(product)}
			subtext={core === Product.CoreSet2026
				? stringMessages.productTypeInvestigatorDeck()
				: stringMessages.productTypeInvestigatorStarterDeck()}
			graphic={productImageUrl(product)}
			accentColor={color.getColor(color.productToColors(product), 950, false)}
			active={included}
			onClick={() => onDeckProductToggle(product, !included)}
		>
			<ProductIcon {product} />
		</GraphicButton>
	{/each}
</div>

<style>
	/* Wide enough for exactly 3 GraphicButtons (250px each) per row, centered:
	   the 5 decks wrap as 3 + 2, and on narrower screens as 2 + 2 + 1. */
	.deck-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
		max-width: 764px;
		margin-inline: auto;
	}
</style>
