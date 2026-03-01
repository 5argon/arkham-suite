<!--
@component
A player-card "filter" widget: every owned card matching a predicate (Permanent /
Exceptional / Level 5 / Skill), shown as the same lit icon grid as the Core Set
History — greyed when never used, with a lifetime-use badge — plus a utilization
summary. Narrows to one class on a class-detail page (`classFilter`).
-->
<script lang="ts">
	import { FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import type { Card, CardCode, Product } from '@5argon/arkham-kohaku';
	import { utilizationItems } from '$lib/campaign/card-filters';

	let {
		predicate,
		cardUsage,
		ownedProducts,
		classFilter = null
	}: {
		predicate: (c: Card) => boolean;
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		/** When set (class-detail page), narrow the pool to one card class. */
		classFilter?: string | null;
	} = $props();

	const result = $derived(utilizationItems(predicate, cardUsage, ownedProducts, classFilter));
	const pct = $derived(
		result.items.length ? Math.round((result.played / result.items.length) * 100) : 0
	);
</script>

{#if result.items.length}
	<p class="text-primary-600 dark:text-primary-400 mb-3 text-sm">
		{pct}% used ({result.played} / {result.items.length})
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
