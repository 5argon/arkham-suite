<!-- @component The nine Memorials of the Lost as card scans, lit when any of the subject's decks earned them. -->
<script lang="ts">
	import { type CardItem, FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { cardByCode } from '$lib/card-data';
	import { EOE_MEMENTO_CODES } from '$lib/campaign/campaigns/eoe';

	let { cardUsage }: { cardUsage: Record<CardCode, number> } = $props();

	const items = $derived(
		EOE_MEMENTO_CODES.flatMap((code): CardItem[] => {
			const card = cardByCode(code);
			if (!card) return [];
			const count = cardUsage[code] ?? 0;
			return [{ card, quantity: 1, id: code, greyedOutQuantity: count > 0 ? 0 : 1, iconCount: count }];
		})
	);
</script>

<FlexibleCardDisplay
	cards={items}
	defaultSettings={{ grouping: [], sortingOrder: [] }}
	defaultViewMode="scans"
	hideChecklistMode
	hideViewMode
	hideGroupingSorting
	showIconCount
/>
