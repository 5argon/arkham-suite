<script lang="ts">
	import { MarginFull, MarginText, PageLead, TextParagraph } from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterDeckList from '$lib/design/pages/starter/StarterDeckList.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { allStarterDecks } from '$lib/starter-content';
	import { deckMatches, type StarterFilterValue } from '$lib/tool/starter/filter';

	const allDecks = allStarterDecks();

	let filter = $state<StarterFilterValue>({ products: new Set(), investigators: new Set() });
	const visible = $derived(allDecks.filter((entry) => deckMatches(entry, filter)));
</script>

<OpenGraph
	description={m.starter_decks_intro()}
	image="image/resource/starter.webp"
	title={m.starter_decks_title()}
	url="/starter"
/>

<svelte:head>
	<title>{m.starter_decks_page_title()}</title>
</svelte:head>

<PageLead title={m.starter_decks_title()} />

<MarginText>
	<TextParagraph>{m.starter_decks_intro()}</TextParagraph>
	<StarterFilter onChange={(f) => (filter = f)} />
	<p class="text-primary-700 dark:text-primary-300 mt-3 mb-4 text-center text-sm">
		{m.starter_decks_showing({ shown: visible.length, total: allDecks.length })}
	</p>
</MarginText>

<MarginFull>
	<div class="decks">
		{#if visible.length > 0}
			<StarterDeckList entries={visible} />
		{:else}
			<p class="text-primary-700 dark:text-primary-300 text-center">
				{m.starter_decks_none_match()}
			</p>
		{/if}
	</div>
</MarginFull>

<style>
	/* Counteracts the site Main's reading padding so two banners fit per row. */
	.decks {
		margin-inline: -1.25rem;
	}

	@media (min-width: 768px) {
		.decks {
			margin-inline: -1.75rem;
		}
	}

	@media (min-width: 1024px) {
		.decks {
			margin-inline: -2.75rem;
		}
	}

	@media (min-width: 1280px) {
		.decks {
			margin-inline: -60px;
		}
	}
</style>
