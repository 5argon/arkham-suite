<!--
@component
The latest of what's been said, newest first, with more of them a press away. What's written here
and what's elsewhere are listed apart, side by side when there's room. Goes by when each came out,
and something covering many cards is still one review.
-->
<script lang="ts">
	import { Button, Modal, ReviewList } from '@5argon/arkham-life-ui';
	import clsx from 'clsx';

	import * as m from '$lib/paraglide/messages.js';
	import { recentListLimit } from '$lib/review/recent';
	import type { RecentReviewRow } from '$lib/server/reviews';

	import RecentReviewItem from './RecentReviewItem.svelte';

	interface Prop {
		rows: RecentReviewRow[];
		/**
		 * The product the rows are about, named after each heading, on a product's own page.
		 */
		productName?: string;
	}
	const { rows, productName }: Prop = $props();

	const shownCount = 5;
	const groups = $derived(
		[
			{
				id: 'written',
				title:
					productName === undefined
						? m.review_recent_written()
						: m.review_recent_written_product({ product: productName }),
				rows: rows.filter((row) => row.href !== undefined)
			},
			{
				id: 'external',
				title:
					productName === undefined
						? m.review_recent_external()
						: m.review_recent_external_product({ product: productName }),
				rows: rows.filter((row) => row.href === undefined)
			}
		].filter((group) => group.rows.length > 0)
	);
	let openId = $state<string | null>(null);
</script>

{#snippet list(shown: RecentReviewRow[])}
	<ReviewList>
		{#each shown as row (row.key)}
			<RecentReviewItem {row} />
		{/each}
	</ReviewList>
{/snippet}

{#if groups.length > 0}
	<div class={clsx('my-4 grid grid-cols-1 gap-4', groups.length > 1 && 'md:grid-cols-2')}>
		{#each groups as group (group.id)}
			{@const listed = group.rows.slice(0, recentListLimit)}
			<section class="min-w-0">
				<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">{group.title}</h2>
				{@render list(group.rows.slice(0, shownCount))}
				{#if group.rows.length > shownCount}
					<div class="mt-2 flex justify-center">
						<Button
							label={m.review_recent_all({ count: listed.length })}
							onClick={() => (openId = group.id)}
						/>
					</div>
				{/if}
			</section>
			<Modal
				isOpen={openId === group.id}
				maxWidth="lg"
				onClose={() => (openId = null)}
				title={group.title}
			>
				{@render list(listed)}
			</Modal>
		{/each}
	</div>
{/if}

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
