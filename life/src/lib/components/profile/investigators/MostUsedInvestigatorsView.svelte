<!--
@component
Your most-played investigators — the top 10 by play count, shown as a 5×2 grid of
card scans with their counts. Optionally narrowed to one class (a class detail
page or a per-class variant widget). Play count = number of decks that ran the
investigator (profile-local `buildCardsSegment` → InvestigatorStat.count).
-->
<script lang="ts">
	import { BorderedContainer, CardScanFullSmall } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import type { InvestigatorStat } from '$lib/profile/profile-types';

	let {
		investigators,
		classFilter = null,
		count = 5,
	}: {
		investigators: InvestigatorStat[];
		/** When set, keep only investigators of one class (a class detail page). */
		classFilter?: string | null;
		/** How many investigators to show (5 / 10 / 15). */
		count?: number;
	} = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c]));
	const investigatorClass = (c: Card): string => String(c.cardClass?.class1 ?? 'neutral').toLowerCase();

	const top = $derived.by((): { card: Card; uses: number }[] =>
		investigators
			.map((i) => ({ card: byCode.get(i.code), uses: i.count }))
			.filter((r): r is { card: Card; uses: number } => !!r.card)
			.filter((r) => !classFilter || investigatorClass(r.card) === classFilter)
			.sort((a, b) => b.uses - a.uses || a.card.name.localeCompare(b.card.name))
			.slice(0, count),
	);
</script>

{#if top.length}
	<BorderedContainer>
		<!-- Explicit 5-wide grid of 120px scans, centered. Scrolls horizontally when
		     too narrow for five 120px columns. -->
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
