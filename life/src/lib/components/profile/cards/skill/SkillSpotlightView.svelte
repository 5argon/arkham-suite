<!--
@component
Shared base for the small "spotlight skill" widgets (Desperate, Innate, …): a handful of
cards shown as scans with a lifetime use count, plus an insight table. By default the table
has one "Used …" row per card; pass `rows` to override it with bespoke conditions
(e.g. "used 3 different cards"). Each concrete widget is just a one-liner around this.
-->
<script lang="ts">
	import { BorderedContainer, CardScanFullSmall } from '@5argon/arkham-life-ui';
	import type { CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import type { InsightDeck } from '$lib/profile/profile-types';
	import { qualifyingInvestigators, type SpotlightCard } from '$lib/campaign/card-filters';
	import InsightTable from '$lib/components/profile/cards/InsightTable.svelte';

	// total → "X Decks (Y%)" (denominator on hover; showTotal prints it inline); omit → "X Decks".
	type InsightRow = {
		label: string;
		count: number;
		investigators: CardCode[];
		total?: number;
		showTotal?: boolean;
	};

	let {
		spotlights,
		cardUsage,
		insightDecks,
		totalDecks,
		rows: rowsOverride
	}: {
		spotlights: SpotlightCard[];
		cardUsage: Record<CardCode, number>;
		insightDecks: InsightDeck[];
		/** All the subject's decks — the "out of all decks" denominator for the default rows.
		 *  Unused when `rows` is overridden (those callers set their own denominators). */
		totalDecks?: number;
		/** Override the default per-card "Used …" rows with bespoke insight rows. */
		rows?: InsightRow[];
	} = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));

	const tiles = $derived(
		spotlights
			.map((s) => ({
				card: byCode.get(s.displayCode),
				uses: s.codes.reduce((n, c) => n + (cardUsage[c] ?? 0), 0)
			}))
			.filter((t): t is { card: NonNullable<typeof t.card>; uses: number } => !!t.card)
	);

	// Default rows: "Used X" as a percentage of all decks (denominator on hover).
	const rows = $derived(
		rowsOverride ??
			spotlights.map((s) => ({
				label: `Used ${s.name}`,
				total: totalDecks,
				...qualifyingInvestigators(insightDecks, (d) =>
					s.codes.some((c) => (d.slots[c] ?? 0) >= 1)
				)
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
	</div>
{/if}
