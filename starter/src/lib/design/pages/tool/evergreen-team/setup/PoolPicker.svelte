<script lang="ts">
	import { HelpParagraph, RadioButtons, SectionSeparator } from '@5argon/arkham-life-ui';
	import { Product } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';

	import DeckProductPicker from '$lib/design/components/product/DeckProductPicker.svelte';
	import * as m from '$lib/paraglide/messages.js';
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
<DeckProductPicker
	{core}
	selected={deckProducts}
	onToggle={onDeckProductToggle}
	onSetAll={onSetAllDeckProducts}
/>
