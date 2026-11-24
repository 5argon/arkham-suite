<!--
@component
One review written for this site picked for the visitor's day, next to the latest one. The pick
never repeats the latest, and is only made in the browser where the visitor's day is known. The
visitor can pick another at random.
-->
<script lang="ts">
	import { Button, FaIconType, ReviewList } from '@5argon/arkham-life-ui';
	import clsx from 'clsx';
	import { onMount, type Snippet } from 'svelte';

	import * as m from '$lib/paraglide/messages.js';
	import type { RecentReviewRow } from '$lib/server/reviews';
	import { pickRandom } from '$lib/tool/starter/filter';

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

	const todays = $derived(
		today === null || pool.length === 0 ? undefined : pool[hash(today) % pool.length]
	);
	/**
	 * Picked by the visitor instead of today's.
	 */
	let pickedKey = $state<string | null>(null);
	const picked = $derived(
		pickedKey === null ? undefined : pool.find((row) => row.key === pickedKey)
	);
	const random = $derived(picked ?? todays);

	function pickAnother() {
		pickedKey = pickRandom(pool, random ?? null)?.key ?? null;
	}
</script>

{#snippet group(title: string, row: RecentReviewRow | undefined, action?: Snippet)}
	<section class="min-w-0">
		<div class="mb-2 flex items-center justify-between gap-2">
			<h2 class="text-primary-900 dark:text-primary-100 px-(--page-text-inset) text-xl">{title}</h2>
			{@render action?.()}
		</div>
		{#if row}
			<ReviewList>
				<RecentReviewItem {row} />
			</ReviewList>
		{/if}
	</section>
{/snippet}

{#snippet pickAnotherButton()}
	<Button
		hideLabel
		icon={FaIconType.Randomize}
		label={m.review_home_pick_another()}
		onClick={pickAnother}
	/>
{/snippet}

{#if latest}
	<div class={clsx('my-4 grid grid-cols-1 gap-4', pool.length > 0 && 'md:grid-cols-2')}>
		{#if pool.length > 0}
			{@render group(
				picked ? m.review_home_random_again() : m.review_home_random(),
				random,
				pickAnotherButton
			)}
		{/if}
		{@render group(m.review_home_latest(), latest)}
	</div>
{/if}

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
