<!--
@component
A list of cards (resolved by code) as CardLines, each with an optional trailing cell. The trailing
content is a caller snippet, so it can be a count, a date, or any card image (e.g. the investigator
who drew a weakness — see CardThumb). Shared by the PtC card-count lists and TSK's Erased From
Existence. Codes that don't resolve are dropped; the caller owns ordering, capping, and the empty
state (gate on the source data, since unresolved codes are silently skipped).
-->
<script lang="ts" generics="T extends { code: string }">
	import type { Snippet } from 'svelte';
	import { CardLine } from '@5argon/arkham-life-ui';
	import { getAllCards } from '$lib/card-data';

	let {
		items,
		trailing,
		align = 'left',
		key
	}: {
		items: T[];
		/** Optional second-column content for each row (gets the item) — count / date / card image. */
		trailing?: Snippet<[T]>;
		/** Trailing cell alignment. */
		align?: 'left' | 'right';
		/** Stable key per row (defaults to index). Pass one when the same card `code` can appear more
		 *  than once — e.g. a chronological draw list where one weakness recurs across plays — so the
		 *  rows don't collide on a code-only key. */
		key?: (item: T, i: number) => string | number;
	} = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	const rows = $derived(
		items.flatMap((item) => {
			const card = byCode.get(item.code);
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
