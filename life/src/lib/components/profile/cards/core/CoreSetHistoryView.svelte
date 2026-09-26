<!-- @component Every player card of one core set, lit by how many decks used it. -->
<script lang="ts">
	import { FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import { Product, type CardCode } from '@5argon/arkham-kohaku';
	import { utilizationItems } from '$lib/campaign/utils/card-filters';
	import * as m from '$lib/paraglide/messages.js';

	let { product, cardUsage }: { product: Product; cardUsage: Record<CardCode, number> } = $props();

	const util = $derived(utilizationItems((c) => c.product === product, cardUsage, null, null));
	const name = $derived(
		product === Product.CoreSet2026 ? m.cards_core_name_2026() : m.cards_core_name()
	);
	const total = $derived(util.items.length);
</script>

<p class="text-primary-600 dark:text-primary-400 mb-3 text-sm">
	{m.cards_core_utilization({
		name,
		percent: total ? Math.round((util.played / total) * 100) : 0,
		played: util.played,
		total
	})}
</p>
<FlexibleCardDisplay
	cards={util.items}
	defaultSettings={{ grouping: ['class'], sortingOrder: ['level'] }}
	defaultViewMode="icons"
	hideChecklistMode
	hideViewMode
	hideGroupingSorting
	showIconCount
/>
