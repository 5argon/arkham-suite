<!--
@component
One review in a list of the latest, with the cards it speaks about below it.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { CardLine, ReviewRow } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import type { RecentReviewRow } from '$lib/server/reviews';

	interface Prop {
		row: RecentReviewRow;
	}
	const { row }: Prop = $props();
</script>

<ReviewRow entry={row.entry} href={row.href}>
	{#snippet below()}
		<div class="ml-6 flex flex-col pt-0.5">
			{#if row.cards.every((line) => line.card)}
				{#each row.cards as line (line.code)}
					{#if line.card}
						<a
							class="hover:bg-primary-300/30 dark:hover:bg-primary-800/60 relative z-10 block rounded-sm"
							href={resolve('/review/card/[code]', { code: line.code })}
						>
							<CardLine card={line.card} hideQuantity />
						</a>
					{/if}
				{/each}
			{:else}
				<span class="text-primary-800 dark:text-primary-200 text-xs">
					{m.review_recent_covers({ count: row.cards.length })}
				</span>
			{/if}
		</div>
	{/snippet}
</ReviewRow>
