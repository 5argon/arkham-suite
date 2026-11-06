<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		MarginText,
		PageLead,
		PersonAvatar,
		ReviewCounts,
		TextParagraph
	} from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<OpenGraph
	description={m.review_reviewers_description()}
	image="image/resource/review.webp"
	title={m.review_reviewers_title()}
	url="/review/reviewers"
	canonical
/>

<PageLead title={m.review_reviewers_title()} />

<MarginText>
	<TextParagraph>{m.review_reviewers_description()}</TextParagraph>
	<ul class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
		{#each data.reviewers as { slug, person, counts } (slug)}
			<li>
				<a
					class="bg-primary-200 dark:bg-primary-900 hover:bg-primary-300 dark:hover:bg-primary-800 flex h-full items-center gap-3 rounded-md px-2 py-1.5"
					href={resolve('/review/reviewers/[author]', { author: slug })}
				>
					<PersonAvatar {person} size="md" />
					<span class="flex min-w-0 flex-col">
						<span class="text-primary-900 dark:text-primary-100 font-semibold">{person.name}</span>
						<ReviewCounts {counts} />
					</span>
				</a>
			</li>
		{/each}
	</ul>
</MarginText>
