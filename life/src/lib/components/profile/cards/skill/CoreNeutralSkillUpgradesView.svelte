<!--
@component
"Core Neutral Skill Upgrades" — the five starter-deck Level-2 upgrades of the core neutral
cantrip skills (one per class) as scans with a lifetime use count, plus a "Used …" insight
row per card. Thin wrapper over SkillSpotlightView fixed to that spotlight set.
-->
<script lang="ts">
	import type { CardCode } from '@5argon/arkham-kohaku';
	import type { InsightDeck } from '$lib/profile/profile-types';
	import { coreNeutralSkillUpgradeCards } from '$lib/campaign/card-filters';
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

<SkillSpotlightView
	spotlights={coreNeutralSkillUpgradeCards()}
	{cardUsage}
	{insightDecks}
	{totalDecks}
/>
