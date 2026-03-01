<!--
@component
"Core Set Neutral Skills" — Guts / Perception / Overpower / Manual Dexterity (all
three core printings merged), as scans with a lifetime use count. Its insight table overrides
the default per-card rows with deck-diversity conditions: ran 3 different / all four of them
(mirrors the cantrip insight on "Level 0 Core Set Neutral Cards").
-->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import type { InsightDeck } from '$lib/profile/profile-types';
	import { coreCantripCards, qualifyingInvestigators } from '$lib/campaign/card-filters';
	import SkillSpotlightView from '$lib/components/profile/cards/skill/SkillSpotlightView.svelte';

	let {
		cardUsage,
		insightDecks,
		totalDecks
	}: {
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		/** All the subject's decks — the "out of all decks" denominator for each row. */
		totalDecks: number;
	} = $props();

	const spotlights = coreCantripCards();

	// Diversity is per-version (precomputed `cantripMax` = most distinct cantrips in any one
	// deck version), so a deck that swapped cantrips across upgrades without ever holding 3/4 at
	// once does NOT count. Each row is a percentage of all decks.
	const rows = $derived(
		[
			{ label: 'Used 3 different cards', pred: (d: InsightDeck) => d.cantripMax >= 3 },
			{
				label: 'Used all four different cards',
				pred: (d: InsightDeck) => d.cantripMax >= 4
			}
		].map((r) => ({ label: r.label, total: totalDecks, ...qualifyingInvestigators(insightDecks, r.pred) }))
	);
</script>

<SkillSpotlightView {spotlights} {cardUsage} {insightDecks} {rows} />
