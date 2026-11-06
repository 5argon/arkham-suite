<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button, MarginFull, MarginText, PageLead, TextParagraph } from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ContributorIntro from '$lib/design/pages/contributor/ContributorIntro.svelte';
	import ContributorReviews from '$lib/design/pages/review/ContributorReviews.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { reviewerHref } from '$lib/review/paths';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const author = $derived(data.author);
	const title = $derived(m.review_reviewer_title({ name: author.name }));
</script>

<OpenGraph
	author={author.name}
	description={m.review_reviewer_description({ name: author.name })}
	image="image/resource/review.webp"
	{title}
	url={reviewerHref(author.slug)}
	canonical
/>

<PageLead {title} />

<MarginText>
	<ContributorIntro person={author}>
		{#if data.hasDecks}
			<Button
				label={m.review_reviewer_decks({ name: author.name })}
				onClick={resolve('/member/[author]', { author: author.slug })}
			/>
		{/if}
	</ContributorIntro>
	{#if author.external}
		<TextParagraph>{m.review_external_note({ name: author.name })}</TextParagraph>
	{/if}
</MarginText>

<MarginFull>
	<div class="mt-4">
		<ContributorReviews rows={data.reviews} />
	</div>
</MarginFull>
