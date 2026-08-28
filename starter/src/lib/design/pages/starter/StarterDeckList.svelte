<!--
@component
Two-column list of starter deck banners; each links to its deck page and
carries a small author / series byline linking to their pages.
-->
<script lang="ts">
	import { DeckBanner } from '@5argon/arkham-life-ui';
	import { linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';

	import { createCardResolver, loadAllTabooLists } from '$lib/card-data';
	import {
		starterAuthorHref,
		starterDeckHref,
		type StarterDeckEntry,
		starterSeriesHref
	} from '$lib/starter-content';

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
			byline: [
				{ label: entry.series.author.name, href: starterAuthorHref(entry.series.author) },
				{ label: entry.series.name, href: starterSeriesHref(entry.series) }
			]
		}))
	);
</script>

<div
	class="grid grid-cols-1 justify-center justify-items-center gap-3 min-[1200px]:grid-cols-[auto_auto]"
>
	{#each items as item (item.id)}
		<!-- Wrapped: DeckBanner renders a helper svg sibling that would take its own cell. -->
		<div>
			<DeckBanner
				cardResolver={resolver}
				deck={item.deck}
				mode="decklist"
				onClick={item.href}
				byline={item.byline}
				highlightStatsAtLeast={4}
				dimStatsAtMost={2}
			/>
		</div>
	{/each}
</div>
