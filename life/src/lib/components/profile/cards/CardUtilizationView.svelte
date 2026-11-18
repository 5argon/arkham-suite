<!-- @component Every owned card matching a filter as a lit icon grid, with the share ever used. -->
<script lang="ts">
	import { FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import type { Card, CardCode, Product } from '@5argon/arkham-kohaku';
	import { utilizationItems } from '$lib/campaign/utils/card-filters';
	import * as m from '$lib/paraglide/messages.js';

	let {
		predicate,
		cardUsage,
		ownedProducts,
		classFilter = null
	}: {
		predicate: (c: Card) => boolean;
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		classFilter?: string | null;
	} = $props();

	const result = $derived(utilizationItems(predicate, cardUsage, ownedProducts, classFilter));
	const total = $derived(result.items.length);
</script>

{#if total}
	<p class="text-primary-600 dark:text-primary-400 mb-3 text-sm">
		{m.cards_utilization_used({
			percent: Math.round((result.played / total) * 100),
			played: result.played,
			total
		})}
	</p>
	<FlexibleCardDisplay
		cards={result.items}
		defaultSettings={{ grouping: [], sortingOrder: ['class', 'level'] }}
		defaultViewMode="icons"
		hideChecklistMode
		hideViewMode
		hideGroupingSorting
		showIconCount
	/>
{/if}
