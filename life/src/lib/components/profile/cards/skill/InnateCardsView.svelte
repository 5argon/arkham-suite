<!--
@component
"The Circle Undone : Innate Skills" — the four Innate skill cards as scans with a lifetime
use count, plus a "Decks using …" insight row per card. Thin wrapper over
SkillSpotlightView fixed to the Innate spotlight set.
-->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import type { InsightDeck } from '$lib/profile/profile-types';
	import { innateCards } from '$lib/campaign/card-filters';
	import SkillSpotlightView from '$lib/components/profile/cards/skill/SkillSpotlightView.svelte';

	let {
		cardUsage,
		insightDecks,
		totalDecks
	}: {
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		totalDecks: number;
	} = $props();
</script>

<SkillSpotlightView spotlights={innateCards()} {cardUsage} {insightDecks} {totalDecks} />
