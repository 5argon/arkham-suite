<!-- @component A few spotlight cards as scans lit by lifetime use, with insight rows over the decks. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BorderedContainer } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import {
		spotlightTiles,
		type InsightRow,
		type SpotlightCard
	} from '$lib/campaign/utils/card-filters';
	import { CardScanWall } from '$lib/components/profile/_primitives';
	import InsightTable from './InsightTable.svelte';

	let {
		spotlights,
		cardUsage,
		rows,
		cols,
		children
	}: {
		spotlights: SpotlightCard[];
		cardUsage: Record<CardCode, number>;
		rows: InsightRow[];
		cols?: number;
		children?: Snippet;
	} = $props();

	const tiles = $derived(spotlightTiles(spotlights, cardUsage));
</script>

{#if tiles.length}
	<div class="flex flex-col gap-4">
		<BorderedContainer>
			<CardScanWall items={tiles} {cols} dimUnused />
		</BorderedContainer>
		<InsightTable {rows} />
		{@render children?.()}
	</div>
{/if}
