<!--
@component
"Charisma & Relic Hunter" — the two permanent neutral deck-slot cards (Revised Core +
Core 2026 printings merged), shown as scans with a lifetime use count, plus insight rows
over your decks (used Charisma / Relic Hunter, and ran 2× of each), each surfacing up to
three qualifying investigators.
-->
<script lang="ts">
	import { BorderedContainer, CardScanFullSmall } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import type { DeckTopEntry, InsightDeck } from '$lib/profile/profile-types';
	import { charismaRelicCards, qualifyingInvestigators } from '$lib/campaign/card-filters';
	import InsightTable from '$lib/components/profile/cards/InsightTable.svelte';
	import DeckTopTable from '$lib/components/profile/cards/DeckTopTable.svelte';

	let {
		cardUsage,
		insightDecks,
		totalDecks,
		charismaTopDecks,
		relicTopDecks
	}: {
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		/** All the subject's decks — every one can use Charisma / Relic Hunter, so this is the
		 *  denominator for each row's percentage (shown without the fraction). */
		totalDecks: number;
		charismaTopDecks: DeckTopEntry[];
		relicTopDecks: DeckTopEntry[];
	} = $props();

	// Rank decks by ally / accessory count (then slot copies), top 3.
	const top3 = (decks: DeckTopEntry[]): DeckTopEntry[] =>
		[...decks].sort((a, b) => b.total - a.total || b.count - a.count).slice(0, 3);
	const charismaTop = $derived(top3(charismaTopDecks));
	const relicTop = $derived(top3(relicTopDecks));

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	const spotlights = charismaRelicCards();
	const codesFor = (name: string): CardCode[] =>
		spotlights.find((s) => s.name === name)?.codes ?? [];
	const copies = (slots: Record<CardCode, number>, name: string): number =>
		Math.max(0, ...codesFor(name).map((c) => slots[c] ?? 0));

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
			{
				label: 'Used Charisma',
				pred: (d: InsightDeck) => copies(d.slots, 'Charisma') >= 1
			},
			{
				label: 'Used Relic Hunter',
				pred: (d: InsightDeck) => copies(d.slots, 'Relic Hunter') >= 1
			},
			{
				label: 'Used 2× Charisma',
				pred: (d: InsightDeck) => copies(d.slots, 'Charisma') >= 2
			},
			{
				label: 'Used 2× Relic Hunter',
				pred: (d: InsightDeck) => copies(d.slots, 'Relic Hunter') >= 2
			}
			// Every deck can use these neutral permanents, so the denominator is all decks.
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
			<div class="flex flex-wrap justify-center gap-2">
				{#each tiles as t (t.card.code)}
					<div class="flex flex-col items-center" style="width: 120px;">
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
		</BorderedContainer>
		<InsightTable {rows} />
		<DeckTopTable
			title="Top 3 — most allies in a deck with Charisma"
			rows={charismaTop}
			{byCode}
			countLabel="Charisma"
			itemsLabel="Allies"
		/>
		<DeckTopTable
			title="Top 3 — most accessories in a deck with Relic Hunter"
			rows={relicTop}
			{byCode}
			countLabel="Relic Hunter"
			itemsLabel="Accessories"
		/>
	</div>
{/if}
