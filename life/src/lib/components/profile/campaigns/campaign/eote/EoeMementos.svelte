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
	import { getAllCards } from '$lib/card-data';

	let { cardUsage }: { cardUsage: Record<CardCode, number> } = $props();

	// The "Memorials of the Lost" encounter set (eoec 08730–08738), in set order:
	// one belonging per fallen expedition member.
	const MEMENTO_CODES = [
		'08730',
		'08731',
		'08732',
		'08733',
		'08734',
		'08735',
		'08736',
		'08737',
		'08738'
	];

	const allCards = getAllCards();
	const items = $derived.by((): CardItem[] => {
		const byCode = new Map(allCards.map((c) => [c.code, c]));
		return MEMENTO_CODES.flatMap((code) => {
			const card = byCode.get(code);
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
