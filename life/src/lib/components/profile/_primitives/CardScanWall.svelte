<!-- @component Cards with a use count each: full scans while enough of them fit side by side, card rows with the count trailing when the box is narrower. Widgets show card collections through this, never card scans directly. -->
<script lang="ts" generics="T extends { card: Card; count: number }">
	import type { Snippet } from 'svelte';
	import type { Card } from '@5argon/arkham-kohaku';
	import { CardScanFullSmall } from '@5argon/arkham-life-ui';
	import CardLineList from './CardLineList.svelte';

	let {
		items,
		cols,
		dimUnused = false,
		width = 120,
		badge
	}: {
		items: T[];
		/** Scans in this many columns; without it they wrap. */
		cols?: number;
		/** Grey out the cards never used. */
		dimUnused?: boolean;
		/** Scan width in px. */
		width?: number;
		/** Replaces the count pill. */
		badge?: Snippet<[T]>;
	} = $props();

	const GAP = 8;
	/** Fewer scans than this per row reads worse than rows of names. */
	const MIN_SCANS_PER_ROW = 4;

	let boxWidth = $state<number>();
	const perRow = $derived(Math.min(cols ?? MIN_SCANS_PER_ROW, MIN_SCANS_PER_ROW, items.length));
	const asScans = $derived(
		boxWidth === undefined || boxWidth >= perRow * width + (perRow - 1) * GAP
	);
	const scanCols = $derived(
		cols && boxWidth !== undefined
			? Math.max(1, Math.min(cols, Math.floor((boxWidth + GAP) / (width + GAP))))
			: cols
	);
	const rows = $derived(items.map((item) => ({ code: item.card.code, item })));

	const lit = 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200';
	const isDim = (t: T) => dimUnused && t.count === 0;
</script>

{#snippet count(t: T, pill: boolean)}
	{#if badge}
		{@render badge(t)}
	{:else}
		<span
			class="text-xs font-semibold tabular-nums {pill
				? 'mt-1 rounded-full px-2 py-0.5'
				: ''} {isDim(t)
				? 'text-primary-400'
				: pill
					? lit
					: 'text-primary-700 dark:text-primary-200'}"
		>
			{t.count}×
		</span>
	{/if}
{/snippet}

{#snippet tile(t: T)}
	<div class="flex flex-col items-center" style="width: {width}px;">
		<CardScanFullSmall
			card={t.card}
			showCardName
			hideQuantity
			greyedOutQuantity={isDim(t) ? 1 : 0}
		/>
		{@render count(t, true)}
	</div>
{/snippet}

<div bind:clientWidth={boxWidth}>
	{#if !asScans}
		<CardLineList items={rows} key={(r) => r.code} align="right" dim={(r) => isDim(r.item)}>
			{#snippet trailing(r)}
				<div class="flex justify-end">{@render count(r.item, false)}</div>
			{/snippet}
		</CardLineList>
	{:else if scanCols}
		<div
			class="mx-auto grid w-max gap-2"
			style="grid-template-columns: repeat({scanCols}, {width}px);"
		>
			{#each items as t (t.card.code)}{@render tile(t)}{/each}
		</div>
	{:else}
		<div class="flex flex-wrap justify-center gap-2">
			{#each items as t (t.card.code)}{@render tile(t)}{/each}
		</div>
	{/if}
</div>
