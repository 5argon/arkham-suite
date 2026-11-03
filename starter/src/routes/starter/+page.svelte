<script lang="ts">
	import { snapshot } from '$app/navigation';
	import { resolve } from '$app/paths';
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
	import WhatsStarterDeckModal from '$lib/design/pages/starter/WhatsStarterDeckModal.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { allStarterDecks, starterDeckHref } from '$lib/starter-content';
	import {
		deckMatches,
		deckMatchesProducts,
		pickedNothing,
		pickRandom,
		type StarterFilterValue
	} from '$lib/tool/starter/filter';

	const allDecks = allStarterDecks();

	let filter = $state<StarterFilterValue>({ products: new Set(), investigators: new Set() });
	const nothingPicked = $derived(pickedNothing(filter));
	const visible = $derived(allDecks.filter((entry) => deckMatches(entry, filter)));
	// Nothing picked yet: the page asks the reader to choose, or offers one
	// random deck they can buy with what they own.
	const randomPool = $derived(
		nothingPicked ? allDecks.filter((entry) => deckMatchesProducts(entry, filter)) : visible
	);
	let randomHref = $state<string | null>(null);
	// A pick the filters no longer allow simply ends random mode.
	const randomDeck = $derived(
		randomPool.find((entry) => starterDeckHref(entry) === randomHref) ?? null
	);
	let showWhatsStarterDeck = $state(false);
	// Repeating a random pick keeps at least the height it had, so a shorter result
	// can't shrink the page and pull the reader away from the button.
	let decksEl = $state<HTMLElement | null>(null);
	let randomHeight = $state<number | null>(null);
	function randomize() {
		randomHeight = randomDeck === null ? null : (decksEl?.offsetHeight ?? null);
		const pick = pickRandom(randomPool, randomDeck);
		randomHref = pick === null ? null : starterDeckHref(pick);
	}
	function changeFilter(next: StarterFilterValue) {
		if (pickedNothing(next) && !pickedNothing(filter)) randomHref = null;
		filter = next;
	}
	snapshot({
		id: 'starter-random',
		capture: () => randomHref,
		restore: (href) => (randomHref = href)
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
		<a href={resolve('/team')}>{m.starter_decks_teams_note_link()}</a>
		{m.starter_decks_teams_note_after()}
	</TextParagraph>
	<div class="mb-4 flex flex-wrap justify-center gap-2">
		<Button
			icon={FaIconType.NoticeInfo}
			label={m.starter_decks_whats()}
			onClick={() => (showWhatsStarterDeck = true)}
		/>
		<Button label={m.starter_decks_authors_button()} onClick="/starter/authors" />
	</div>
	<StarterFilter onChange={changeFilter} />
	<div class="mt-3 mb-4 flex flex-col items-center gap-2">
		{#if nothingPicked}
			<p class="text-primary-700 dark:text-primary-300 text-center text-sm">
				{m.starter_decks_total({ count: allDecks.length })}
				{m.starter_decks_pick_prompt()}
			</p>
		{:else}
			<p class="text-primary-700 dark:text-primary-300 text-center text-sm">
				{m.starter_decks_showing({ shown: visible.length, total: allDecks.length })}
			</p>
		{/if}
		{#if randomPool.length > 0}
			<div class="flex flex-wrap justify-center gap-2">
				<Button
					highlighted
					icon={FaIconType.Randomize}
					label={nothingPicked
						? m.starter_decks_randomize()
						: m.starter_decks_randomize_filtered()}
					onClick={randomize}
				/>
				{#if randomDeck !== null}
					<Button
						icon={FaIconType.Collapse}
						label={m.starter_decks_randomize_exit()}
						onClick={() => (randomHref = null)}
					/>
				{/if}
			</div>
		{/if}
	</div>
</MarginText>

<MarginFull>
	<div
		bind:this={decksEl}
		class="decks"
		style:min-height={randomDeck !== null && randomHeight !== null ? `${randomHeight}px` : undefined}
	>
		{#if randomDeck !== null}
			<StarterDeckList entries={[randomDeck]} {filter} />
		{:else if nothingPicked}
			<!-- Nothing to list until the reader picks something. -->
		{:else if visible.length > 0}
			<StarterDeckList entries={visible} {filter} />
		{:else}
			<p class="text-primary-700 dark:text-primary-300 text-center">
				{m.starter_decks_none_match()}
			</p>
		{/if}
	</div>
</MarginFull>

<style>
	/* Counteracts the site Main's reading padding so two banners fit per row. */
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

<WhatsStarterDeckModal isOpen={showWhatsStarterDeck} onClose={() => (showWhatsStarterDeck = false)} />
