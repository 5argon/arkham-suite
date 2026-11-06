<script lang="ts">
	import { resolve } from '$app/paths';
	import { CardCircle, MarginText, PageLead, TextParagraph } from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { starterAuthors, starterSeriesOf } from '$lib/starter-content';

	const authors = starterAuthors().map((author) => ({
		author,
		deckCount: starterSeriesOf(author.slug).reduce((sum, s) => sum + s.entries.length, 0)
	}));
</script>

<OpenGraph
	description={m.starter_decks_authors_description()}
	image="image/resource/starter.webp"
	title={m.starter_decks_authors_title()}
	url="/starter/authors"
	canonical
/>

<PageLead title={m.starter_decks_authors_title()} />

<MarginText>
	<TextParagraph>{m.starter_decks_authors_description()}</TextParagraph>
	<ul class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
		{#each authors as { author, deckCount } (author.slug)}
			<li>
				<a
					class="bg-primary-200 dark:bg-primary-900 hover:bg-primary-300 dark:hover:bg-primary-800 flex items-center gap-3 rounded-md px-2 py-1.5"
					href={resolve('/member/[author]', { author: author.slug })}
				>
					{#if author.avatarCard}
						<CardCircle card={author.avatarCard} size="md" />
					{/if}
					<span class="flex min-w-0 flex-col">
						<span class="text-primary-900 dark:text-primary-100 font-semibold">{author.name}</span>
						<span class="text-primary-700 dark:text-primary-300 text-xs">
							{m.starter_decks_deck_count({ count: deckCount })}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</MarginText>
