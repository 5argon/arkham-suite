<!--
@component
One or two columns of starter deck banners that fill the width they get; each links to its deck page and
carries a small author / series byline linking to their pages.
-->
<script lang="ts">
	import { DeckBanner } from '@5argon/arkham-life-ui';
	import { linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';

	import { createCardResolver, loadAllTabooLists } from '$lib/card-data';
	import { starterByline, starterDeckHref, type StarterDeckEntry } from '$lib/starter-content';

	interface Prop {
		entries: StarterDeckEntry[];
	}
	const { entries }: Prop = $props();

	const resolver = createCardResolver();
	const tabooLists = loadAllTabooLists();
	const items = $derived(
		entries.map((entry) => ({
			id: String(entry.id),
			deck: linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, tabooLists),
			href: starterDeckHref(entry),
			byline: starterByline(entry.series)
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
		<div>
			<DeckBanner
				cardResolver={resolver}
				deck={item.deck}
				mode="decklist"
				fluid
				onClick={item.href}
				byline={item.byline}
				highlightStatsAtLeast={4}
				dimStatsAtMost={2}
			/>
		</div>
	{/each}
</div>
