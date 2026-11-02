<!--
@component
Changes what the collection offers after setup, for teams that arrive with only
the products their decks need. Applied as the boxes are ticked. Cards from a
product no longer ticked stay in the decks they are in.
-->
<script lang="ts">
	import { HelpParagraph, Modal } from '@5argon/arkham-life-ui';
	import type { Product } from '@5argon/arkham-kohaku';

	import EnvironmentProductPicker from '$lib/design/components/product/EnvironmentProductPicker.svelte';
	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		/**
		 * Excludes Core Set 2026, which is always in.
		 */
		products: Product[];
		/**
		 * Products an investigator on the team comes from.
		 */
		lockedProducts: Product[];
		onChange: (products: Product[]) => void;
		onClose: () => void;
	}
	const { products, lockedProducts, onChange, onClose }: Prop = $props();
</script>

<Modal isOpen={true} {onClose} title={m.tool_evergreen_team_include_decks()}>
	<HelpParagraph>{m.tool_evergreen_team_products_help()}</HelpParagraph>
	<EnvironmentProductPicker selected={products} {lockedProducts} {onChange} />
</Modal>
