<!--
@component
"Level 0 Core Set Neutral Cards" — the ten basic neutral cards (two rows of five),
shown as scans with a lifetime use count that merges all three core printings. Below,
an insights table over your decks (used Knife, skipped Flashlight / Emergency Cache,
used Unexpected Courage, ran 3+ distinct cantrip skills), each surfacing up to three
qualifying investigators.
-->
<script lang="ts">
	import { BorderedContainer, CardScanFullSmall } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import type { InsightDeck } from '$lib/profile/profile-types';
	import { coreNeutralL0Cards, qualifyingInvestigators } from '$lib/campaign/card-filters';
	import InsightTable from '$lib/components/profile/cards/InsightTable.svelte';

	let {
		cardUsage,
		insightDecks,
		totalDecks
	}: {
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		/** All the subject's decks — every one can use these core neutral cards, so it is the
		 *  denominator for each row's percentage (shown without the fraction). */
		totalDecks: number;
	} = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	const spotlights = coreNeutralL0Cards();
	const codesFor = (name: string): CardCode[] =>
		spotlights.find((s) => s.name === name)?.codes ?? [];
	const has = (slots: Record<CardCode, number>, name: string): boolean =>
		codesFor(name).some((c) => (slots[c] ?? 0) >= 1);

	// Scan tiles: each logical card's display printing + merged lifetime use count.
	const tiles = $derived(
		spotlights
			.map((s) => ({
				card: byCode.get(s.displayCode),
				uses: s.codes.reduce((n, c) => n + (cardUsage[c] ?? 0), 0)
			}))
			.filter((t): t is { card: NonNullable<typeof t.card>; uses: number } => !!t.card)
	);

	const rows = $derived(
		[
			{ label: 'Used Knife', pred: (d: InsightDeck) => has(d.slots, 'Knife') },
			{
				label: "Didn't use Flashlight",
				pred: (d: InsightDeck) => !has(d.slots, 'Flashlight')
			},
			{
				label: "Didn't use Emergency Cache",
				pred: (d: InsightDeck) => !has(d.slots, 'Emergency Cache')
			},
			{
				label: 'Used Unexpected Courage',
				pred: (d: InsightDeck) => has(d.slots, 'Unexpected Courage')
			},
			{
				// Per-version (precomputed `cantripMax`): 3+ distinct cantrips IN ONE deck version,
				// not merely seen across the upgrade chain.
				label: 'Used 3+ different Lv. 0 cantrip skills',
				pred: (d: InsightDeck) => d.cantripMax >= 3
			}
			// Core neutral cards are usable by every investigator, so the denominator is all decks.
		].map((r) => ({
			label: r.label,
			total: totalDecks,
			...qualifyingInvestigators(insightDecks, r.pred)
		}))
	);
</script>

{#if tiles.length}
	<div class="flex flex-col gap-4">
		<BorderedContainer>
			<div class="overflow-x-auto">
				<div class="mx-auto grid w-max gap-2" style="grid-template-columns: repeat(5, 120px);">
					{#each tiles as t (t.card.code)}
						<div class="flex flex-col items-center">
							<CardScanFullSmall
							card={t.card}
							showCardName
							hideQuantity
							greyedOutQuantity={t.uses > 0 ? 0 : 1}
						/>
							<span
								class="mt-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums {t.uses > 0
									? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200'
									: 'text-primary-400'}"
							>
								{t.uses}×
							</span>
						</div>
					{/each}
				</div>
			</div>
		</BorderedContainer>
		<InsightTable {rows} />
	</div>
{/if}
