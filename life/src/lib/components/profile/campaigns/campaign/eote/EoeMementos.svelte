<!--
@component
EotE bespoke widget — "Memories of the Lost". The nine "Memorials of the Lost"
story-asset belongings (one per expedition member) that enter your deck when you
recover a fallen companion's effects. Each is lit if you've ever earned it across
your lifetime plays (scanned from imported decks via lifetime card usage), greyed
otherwise — so a player can see which belongings they have yet to bring home.

Needs NO profile-pipeline data of its own: it reads the existing `cardUsage` map
(decks that ever held a code) for the nine known card codes.
-->
<script lang="ts">
	import { type CardItem, FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { cardByCode } from '$lib/card-data';
	import { EOE_MEMENTO_CODES } from '$lib/campaign/campaigns/eoe';

	let { cardUsage }: { cardUsage: Record<CardCode, number> } = $props();

	const items = $derived.by((): CardItem[] => {
		return EOE_MEMENTO_CODES.flatMap((code) => {
			const card = cardByCode(code);
			if (!card) return [];
			const count = cardUsage[code] ?? 0;
			return [
				{ card, quantity: 1, id: code, greyedOutQuantity: count > 0 ? 0 : 1, iconCount: count }
			];
		});
	});
</script>

{#if items.length}
	<FlexibleCardDisplay
		cards={items}
		defaultSettings={{ grouping: [], sortingOrder: [] }}
		defaultViewMode="scans"
		hideChecklistMode
		hideViewMode
		hideGroupingSorting
		showIconCount
	/>
{/if}
