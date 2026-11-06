<!--
@component
One review written for this site picked for the visitor's day, next to the latest one. The pick
never repeats the latest, and is only made in the browser where the visitor's day is known.
-->
<script lang="ts">
	import { ReviewList } from '@5argon/arkham-life-ui';
	import clsx from 'clsx';
	import { onMount } from 'svelte';

	import * as m from '$lib/paraglide/messages.js';
	import type { RecentReviewRow } from '$lib/server/reviews';

	import RecentReviewItem from './RecentReviewItem.svelte';

	interface Prop {
		/**
		 * Newest first.
		 */
		rows: RecentReviewRow[];
	}
	const { rows }: Prop = $props();

	const latest = $derived(rows.at(0));
	const pool = $derived(rows.slice(1));

	let today = $state<string | null>(null);
	onMount(() => {
		const now = new Date();
		today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
	});

	function hash(text: string): number {
		let h = 2166136261;
		for (let i = 0; i < text.length; i++) {
			h ^= text.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return h >>> 0;
	}

	const random = $derived(
		today === null || pool.length === 0 ? undefined : pool[hash(today) % pool.length]
	);
</script>

{#snippet group(title: string, row: RecentReviewRow | undefined)}
	<section class="min-w-0">
		<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">{title}</h2>
		{#if row}
			<ReviewList>
				<RecentReviewItem {row} />
			</ReviewList>
		{/if}
	</section>
{/snippet}

{#if latest}
	<div class={clsx('my-4 grid grid-cols-1 gap-4', pool.length > 0 && 'md:grid-cols-2')}>
		{#if pool.length > 0}
			{@render group(m.review_home_random(), random)}
		{/if}
		{@render group(m.review_home_latest(), latest)}
	</div>
{/if}

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
