<!--
@component
One or two columns of starter deck banners that fill the width they get; each links to its deck page and
carries a small author / series byline linking to their pages. When looking for
cards, each also lists how the deck plays them. Banners in a row match the
height of the longest list.
-->
<script lang="ts">
	import { CardLineNotes, DeckBanner } from '@5argon/arkham-life-ui';
	import { linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';

	import { createCardResolver, loadAllTabooLists } from '$lib/card-data';
	import { starterByline, starterDeckHref, type StarterDeckEntry } from '$lib/starter-content';
	import { deckEnvironmentDisplay } from '$lib/starter-content/environment';
	import { deckCardMatches, type StarterFilterValue } from '$lib/tool/starter/filter';

	import { cardMatchNotes } from './card-match-notes';

	interface Prop {
		entries: StarterDeckEntry[];
		filter?: StarterFilterValue;
	}
	const { entries, filter }: Prop = $props();

	const resolver = createCardResolver();
	const tabooLists = loadAllTabooLists();
	const items = $derived(
		entries.map((entry) => ({
			id: String(entry.id),
			deck: linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, tabooLists),
			href: starterDeckHref(entry),
			byline: starterByline(entry.series),
			environment: deckEnvironmentDisplay(entry.environment),
			matches: filter === undefined ? [] : cardMatchNotes(deckCardMatches(entry, filter), resolver)
		}))
	);
</script>

<div
	class={[
		'grid grid-cols-1 justify-center gap-3',
		items.length > 1
			? 'min-[700px]:grid-cols-[repeat(2,minmax(0,550px))] min-[1200px]:grid-cols-[550px_550px]'
			: 'min-[700px]:grid-cols-[minmax(0,550px)]'
	]}
>
	{#each items as item (item.id)}
		<!-- Wrapped: DeckBanner renders a helper svg sibling that would take its own cell. -->
		<div class="flex flex-col gap-1">
			<DeckBanner
				cardResolver={resolver}
				deck={item.deck}
				mode="decklist"
				fluid
				onClick={item.href}
				byline={item.byline}
				environment={item.environment}
				highlightStatsAtLeast={4}
				dimStatsAtMost={2}
			/>
			{#if item.matches.length > 0}
				<div
					class="border-primary-300 dark:border-primary-700 flex-1 rounded-lg border bg-white/50 p-2 dark:bg-black/30"
				>
					<CardLineNotes items={item.matches} />
				</div>
			{/if}
		</div>
	{/each}
</div>
