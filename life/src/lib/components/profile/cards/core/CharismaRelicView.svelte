<!-- @component Charisma and Relic Hunter: lifetime use, insight rows, and the decks with the most allies / accessories. -->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import {
		charismaRelicCards,
		insightRows,
		spotlightCopies,
		type InsightRowDef
	} from '$lib/campaign/utils/card-filters';
	import type { DeckTopEntry, InsightDeck } from '$lib/profile/profile-types';
	import * as m from '$lib/paraglide/messages.js';
	import CardSpotlightView from '../CardSpotlightView.svelte';
	import DeckTopTable from '../DeckTopTable.svelte';

	let {
		cardUsage,
		insightDecks,
		totalDecks,
		charismaTopDecks,
		relicTopDecks
	}: {
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		totalDecks: number;
		charismaTopDecks: DeckTopEntry[];
		relicTopDecks: DeckTopEntry[];
	} = $props();

	const spotlights = charismaRelicCards();
	const [charisma, relic] = ['Charisma', 'Relic Hunter'].map((name) => ({
		name,
		spotlight: spotlights.find((s) => s.name === name)
	}));

	const copies = (s: typeof charisma, count: number): InsightRowDef => ({
		label: () =>
			count > 1 ? m.cards_insight_used_copies({ count, name: s.name }) : m.cards_insight_used({ name: s.name }),
		pred: (d) => spotlightCopies(d, s.spotlight) >= count
	});

	// Every deck can take these neutral permanents, so each row is a share of all decks.
	const rows = $derived(
		insightRows(
			[copies(charisma, 1), copies(relic, 1), copies(charisma, 2), copies(relic, 2)],
			insightDecks,
			totalDecks
		)
	);

	const top3 = (decks: DeckTopEntry[]): DeckTopEntry[] =>
		[...decks].sort((a, b) => b.total - a.total || b.count - a.count).slice(0, 3);
</script>

<CardSpotlightView {spotlights} {cardUsage} {rows}>
	<DeckTopTable
		title={m.cards_core_charisma_top()}
		rows={top3(charismaTopDecks)}
		countLabel={charisma.name}
		itemsLabel={m.cards_core_col_allies()}
	/>
	<DeckTopTable
		title={m.cards_core_relic_top()}
		rows={top3(relicTopDecks)}
		countLabel={relic.name}
		itemsLabel={m.cards_core_col_accessories()}
	/>
</CardSpotlightView>
