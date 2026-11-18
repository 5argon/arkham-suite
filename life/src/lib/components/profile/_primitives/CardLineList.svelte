<!-- @component Cards as CardLines with an optional trailing cell; unknown codes are dropped. When the rows are wider than the box, each card line gives up its tail to keep the trailing cell beside it, or the cell moves under it when there is no room. -->
<script lang="ts" generics="T extends { code: string }">
	import type { Snippet } from 'svelte';
	import { CardLine } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';
	import { stackWhenTooWide } from './stack-when-too-wide';

	let {
		items,
		trailing,
		align = 'left',
		key,
		dim
	}: {
		items: T[];
		trailing?: Snippet<[T]>;
		align?: 'left' | 'right';
		/** Row key; defaults to the index, since a card can appear more than once. */
		key?: (item: T, i: number) => string | number;
		/** Greys out the rows it returns true for. */
		dim?: (item: T) => boolean;
	} = $props();

	const rows = $derived(
		items.flatMap((item) => {
			const card = cardByCode(item.code);
			return card ? [{ card, item }] : [];
		})
	);
</script>

{#if rows.length}
	<div use:stackWhenTooWide={{ className: 'cl-narrow' }}>
	<table class="w-full border-collapse">
		<tbody>
			{#each rows as r, i (key ? key(r.item, i) : i)}
				<tr class="border-primary-100 dark:border-primary-800/60 border-b last:border-0">
					<td class="w-px py-1 pr-3"
						><CardLine card={r.card} hideQuantity greyedOut={dim?.(r.item) ?? false} /></td
					>
					{#if trailing}
						<td
							class="text-primary-400 py-1 align-middle text-xs tabular-nums whitespace-nowrap {align ===
							'right'
								? 'text-right'
								: ''}">{@render trailing(r.item)}</td
						>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
	</div>
{/if}

<style>
	:global(.cl-narrow > table),
	:global(.cl-narrow > table > tbody) {
		display: block;
	}
	:global(.cl-narrow > table > tbody > tr) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		column-gap: 0.75rem;
	}
	/* Keeps 12rem of card line beside the trailing cell, else the cell wraps under it. */
	:global(.cl-narrow > table > tbody > tr > td:first-child) {
		flex: 1 1 0;
		min-width: min(100%, 12rem);
		padding-right: 0;
	}
	:global(.cl-narrow > table > tbody > tr > td) {
		display: block;
	}
</style>
