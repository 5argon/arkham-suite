<script lang="ts">
	import { snapshot } from '$app/navigation';
	import {
		Button,
		FaIconType,
		MarginFull,
		MarginText,
		PageLead,
		TextParagraph
	} from '@5argon/arkham-life-ui';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import StarterDeckList from '$lib/design/pages/starter/StarterDeckList.svelte';
	import StarterFilter from '$lib/design/pages/starter/StarterFilter.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { allStarterDecks, type StarterDeckEntry, starterDeckHref } from '$lib/starter-content';
	import {
		deckMatches,
		deckMatchesProducts,
		pickRandom,
		type StarterFilterValue
	} from '$lib/tool/starter/filter';

	const allDecks = allStarterDecks();

	let filter = $state<StarterFilterValue>({ products: new Set(), investigators: new Set() });
	const visible = $derived(allDecks.filter((entry) => deckMatches(entry, filter)));
	// Nobody picked yet: the page asks the reader to choose, or offers one
	// random deck they can buy with what they own.
	const nonePicked = $derived(filter.investigators.size === 0);
	let randomDeck = $state<StarterDeckEntry | null>(null);
	function randomize() {
		randomDeck = pickRandom(
			allDecks.filter((entry) => deckMatchesProducts(entry, filter)),
			randomDeck
		);
	}
	snapshot({
		id: 'starter-random',
		capture: () => (randomDeck === null ? null : starterDeckHref(randomDeck)),
		restore: (href) => {
			randomDeck = allDecks.find((entry) => starterDeckHref(entry) === href) ?? null;
		}
	});
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
	<TextParagraph>
		{m.starter_decks_teams_note_before()}
		<a href="/team">{m.starter_decks_teams_note_link()}</a>
		{m.starter_decks_teams_note_after()}
	</TextParagraph>
	<StarterFilter onChange={(f) => (filter = f)} />
	{#if nonePicked}
		<div class="mt-3 mb-4 flex flex-col items-center gap-2">
			<p class="text-primary-700 dark:text-primary-300 text-center text-sm">
				{m.starter_decks_total({ count: allDecks.length })}
				{m.starter_decks_pick_prompt()}
			</p>
			<Button
				highlighted
				icon={FaIconType.Randomize}
				label={randomDeck === null
					? m.starter_decks_randomize()
					: m.starter_decks_randomize_again()}
				onClick={randomize}
			/>
		</div>
	{:else}
		<p class="text-primary-700 dark:text-primary-300 mt-3 mb-4 text-center text-sm">
			{m.starter_decks_showing({ shown: visible.length, total: allDecks.length })}
		</p>
	{/if}
</MarginText>

<MarginFull>
	<div class="decks">
		{#if nonePicked}
			{#if randomDeck !== null}
				<StarterDeckList entries={[randomDeck]} />
			{/if}
		{:else if visible.length > 0}
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
