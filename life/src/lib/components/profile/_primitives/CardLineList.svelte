<!-- @component Cards as CardLines with an optional trailing cell; unknown codes are dropped. -->
<script lang="ts" generics="T extends { code: string }">
	import type { Snippet } from 'svelte';
	import { CardLine } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';

	let {
		items,
		trailing,
		align = 'left',
		key
	}: {
		items: T[];
		trailing?: Snippet<[T]>;
		align?: 'left' | 'right';
		/** Row key; defaults to the index, since a card can appear more than once. */
		key?: (item: T, i: number) => string | number;
	} = $props();

	const rows = $derived(
		items.flatMap((item) => {
			const card = cardByCode(item.code);
			return card ? [{ card, item }] : [];
		})
	);
</script>

{#if rows.length}
	<table class="w-full border-collapse">
		<tbody>
			{#each rows as r, i (key ? key(r.item, i) : i)}
				<tr class="border-primary-100 dark:border-primary-800/60 border-b last:border-0">
					<td class="w-px py-1 pr-3"><CardLine card={r.card} hideQuantity /></td>
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
{/if}
