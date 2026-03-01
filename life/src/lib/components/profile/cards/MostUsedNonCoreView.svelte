<!--
@component
The player cards you lean on most, excluding every core set (Core, Revised Core,
Core Set 2026) — the top 10 by lifetime use count, shown as a 5×2 grid of card
scans with their counts. Optionally narrowed to one class (a class detail page or
a per-class variant widget); a multiclass card appears under every class it
belongs to. Use count shares the profile's `cardUsage` source (decks that ran the
card; see profile-local `buildCardsSegment`).
-->
<script lang="ts">
	import { BorderedContainer, CardScanFullSmall } from '@5argon/arkham-life-ui';
	import {
		card as cardUtils,
		productCoreSets,
		type Card,
		type CardCode,
		type Product,
	} from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { isCardOwned } from '$lib/campaign/ownership';

	let {
		cardUsage,
		ownedProducts,
		classFilter = null,
		count = 10,
	}: {
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		/** When set, narrow to one card class (multiclass-aware). */
		classFilter?: string | null;
		/** How many cards to show (5 / 10 / 15). */
		count?: number;
	} = $props();

	// A card belongs to a class if any of its (multi)class slots match.
	function inClass(c: Card, cls: string): boolean {
		const cc = c.cardClass;
		if (!cc) return false;
		return [cc.class1, cc.class2, cc.class3].some((x) => String(x ?? '').toLowerCase() === cls);
	}

	const top = $derived.by((): { card: Card; uses: number }[] =>
		getAllCards()
			.filter(
				(c) =>
					cardUtils.deckbuildingPlayerCardsFilter(c) &&
					!productCoreSets.includes(c.product) &&
					isCardOwned(c.product, ownedProducts) &&
					(!classFilter || inClass(c, classFilter)) &&
					(cardUsage[c.code] ?? 0) > 0,
			)
			.map((c) => ({ card: c, uses: cardUsage[c.code] }))
			.sort((a, b) => b.uses - a.uses || a.card.name.localeCompare(b.card.name))
			.slice(0, count),
	);
</script>

{#if top.length}
	<BorderedContainer>
		<!-- Explicit 5-wide grid of 120px scans (5×2 for 10 cards), centered. Scrolls
		     horizontally when the page is too narrow for five 120px columns. -->
		<div class="overflow-x-auto">
			<div class="mx-auto grid w-max gap-2" style="grid-template-columns: repeat(5, 120px);">
				{#each top as t (t.card.code)}
					<div class="flex flex-col items-center">
						<CardScanFullSmall card={t.card} showCardName hideQuantity />
						<span
							class="bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 mt-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
						>
							{t.uses}×
						</span>
					</div>
				{/each}
			</div>
		</div>
	</BorderedContainer>
{/if}
