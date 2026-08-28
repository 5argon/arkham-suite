<!--
@component
Toggle grid of the five prebuilt deck products that pair with a core box
(Investigator Decks for Core Set 2026, Investigator Starter Decks for the
Revised Core Set), with a select all / deselect all button. Shared by the
Evergreen Team Builder setup and the starter deck listing.
-->
<script lang="ts">
	import { Button, GraphicButton, productImageUrl } from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { color, Product } from '@5argon/arkham-kohaku';
	import { m as stringMessages, u as stringUtils } from '@5argon/arkham-string';

	import * as m from '$lib/paraglide/messages.js';
	import { deckProductsForCore } from '$lib/tool/evergreen-team/pool';
	import type { EvergreenCore } from '$lib/tool/evergreen-team/types';

	interface Prop {
		core: EvergreenCore;
		selected: Product[];
		onToggle: (product: Product, included: boolean) => void;
		onSetAll: (products: Product[]) => void;
	}
	const { core, selected, onToggle, onSetAll }: Prop = $props();

	const available = $derived(deckProductsForCore(core));
	const allIncluded = $derived(available.every((p) => selected.includes(p)));
</script>

<div class="mb-2">
	<Button
		label={allIncluded ? m.tool_evergreen_team_deselect_all() : m.tool_evergreen_team_select_all()}
		onClick={() => onSetAll(allIncluded ? [] : [...available])}
	/>
</div>
<div class="deck-buttons">
	{#each available as product (product)}
		{@const included = selected.includes(product)}
		<GraphicButton
			small
			text={stringUtils.productName(product)}
			subtext={core === Product.CoreSet2026
				? stringMessages.productTypeInvestigatorDeck()
				: stringMessages.productTypeInvestigatorStarterDeck()}
			graphic={productImageUrl(product)}
			accentColor={color.getColor(color.productToColors(product), 950, false)}
			active={included}
			onClick={() => onToggle(product, !included)}
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
