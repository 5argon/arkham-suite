<script lang="ts">
	import { MarginFull, ReviewList, ReviewRow } from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ReviewCardAside from '$lib/design/pages/review/ReviewCardAside.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { chapterOneCardHref } from '$lib/review/paths';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const card = $derived(data.card);
</script>

<OpenGraph
	description={m.review_card_description({ name: card.name })}
	image="image/resource/review.webp"
	noindex
	title={m.review_chapter_one_title({ name: card.name })}
	url={chapterOneCardHref(card.code)}
/>

<MarginFull>
	<div class="flex flex-col gap-6 md:flex-row md:items-start">
		<ReviewCardAside
			arkhamBuildUrl={data.arkhamBuildUrl}
			arkhamdbReviewsUrl={data.arkhamdbReviewsUrl}
			{card}
			text={data.text}
		/>
		<section class="min-w-0 flex-1">
			<h2 class="text-primary-900 dark:text-primary-100 mb-2 text-xl">
				{m.review_chapter_one_section()}
			</h2>
			<ReviewList>
				{#each data.entries as entry (entry.id)}
					<ReviewRow {entry} />
				{/each}
			</ReviewList>
		</section>
	</div>
</MarginFull>

<style>
	h2 {
		font-family: 'Heading';
	}
</style>
