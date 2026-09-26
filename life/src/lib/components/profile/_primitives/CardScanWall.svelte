<!-- @component Card scans with a use-count pill under each, wrapping or in a fixed number of columns. -->
<script lang="ts" generics="T extends { card: Card; count: number }">
	import type { Snippet } from 'svelte';
	import type { Card } from '@5argon/arkham-kohaku';
	import { CardScanFullSmall } from '@5argon/arkham-life-ui';

	let {
		items,
		cols,
		dimUnused = false,
		width = 120,
		badge
	}: {
		items: T[];
		/** A fixed column count, scrolling sideways when narrow; without it the tiles wrap. */
		cols?: number;
		/** Grey out the cards never used. */
		dimUnused?: boolean;
		/** Tile width in px. */
		width?: number;
		/** Replaces the count pill. */
		badge?: Snippet<[T]>;
	} = $props();

	const lit = 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200';
</script>

{#snippet tile(t: T)}
	<div class="flex flex-col items-center" style="width: {width}px;">
		<CardScanFullSmall
			card={t.card}
			showCardName
			hideQuantity
			greyedOutQuantity={dimUnused && t.count === 0 ? 1 : 0}
		/>
		{#if badge}
			{@render badge(t)}
		{:else}
			<span
				class="mt-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums {t.count > 0 ||
				!dimUnused
					? lit
					: 'text-primary-400'}"
			>
				{t.count}×
			</span>
		{/if}
	</div>
{/snippet}

{#if cols}
	<div class="overflow-x-auto">
		<div class="mx-auto grid w-max gap-2" style="grid-template-columns: repeat({cols}, {width}px);">
			{#each items as t (t.card.code)}{@render tile(t)}{/each}
		</div>
	</div>
{:else}
	<div class="flex flex-wrap justify-center gap-2">
		{#each items as t (t.card.code)}{@render tile(t)}{/each}
	</div>
{/if}
