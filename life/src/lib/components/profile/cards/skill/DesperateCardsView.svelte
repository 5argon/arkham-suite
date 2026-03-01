<!--
@component
"The Path to Carcosa : Desperate Skills" — the four Desperate skill cards as scans with a
lifetime use count, plus a "Decks using …" insight row per card. Thin wrapper over
SkillSpotlightView fixed to the Desperate spotlight set.
-->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import type { InsightDeck } from '$lib/profile/profile-types';
	import { desperateCards } from '$lib/campaign/card-filters';
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

<SkillSpotlightView spotlights={desperateCards()} {cardUsage} {insightDecks} {totalDecks} />
