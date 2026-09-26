<!-- @component The most-used player cards outside the core sets, as scans with their deck counts. -->
<script lang="ts">
	import { BorderedContainer } from '@5argon/arkham-life-ui';
	import type { CardCode, Product } from '@5argon/arkham-kohaku';
	import { topCards } from '$lib/campaign/utils/card-filters';
	import { CardScanWall } from '$lib/components/profile/_primitives';

	let {
		cardUsage,
		ownedProducts,
		classFilter = null,
		count = 10
	}: {
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		classFilter?: string | null;
		count?: number;
	} = $props();

	const top = $derived(topCards(cardUsage, ownedProducts, classFilter, count));
</script>

{#if top.length}
	<BorderedContainer>
		<CardScanWall items={top} cols={5} />
	</BorderedContainer>
{/if}
