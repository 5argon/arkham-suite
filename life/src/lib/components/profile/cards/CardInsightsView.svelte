<!--
@component
Lifetime player-card usage: of the leveled player cards you own (by product),
how many you've ever put in a main deck across your contributing campaigns —
overall, by class, and by level. "In play" = main/extra/ignore_limit (side deck
doesn't count).
-->
<script lang="ts">
	import { card as cardUtils, type Card, type CardCode, type Product } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { isCardOwned } from '$lib/campaign/ownership';
	import * as m from '$lib/paraglide/messages.js';

	let {
		cardUsage,
		ownedProducts,
		classFilter = null,
	}: {
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		/** When set, narrow the universe to one card class (a class detail page). */
		classFilter?: string | null;
	} = $props();

	const played = (code: string) => (cardUsage[code] ?? 0) > 0;

	const universe = $derived.by((): Card[] =>
		getAllCards().filter(
			(c) =>
				cardUtils.deckbuildingPlayerCardsFilter(c) &&
				isCardOwned(c.product, ownedProducts) &&
				(!classFilter || String(c.cardClass?.class1 ?? '').toLowerCase() === classFilter),
		),
	);
	const playedCount = $derived(universe.filter((c) => played(c.code)).length);

	const classLabel: Record<string, string> = {
		guardian: 'Guardian',
		seeker: 'Seeker',
		rogue: 'Rogue',
		mystic: 'Mystic',
		survivor: 'Survivor',
		neutral: 'Neutral',
	};
	const byClass = $derived.by(() => {
		const m = new Map<string, { played: number; total: number }>();
		for (const c of universe) {
			const cls = String(c.cardClass?.class1 ?? 'neutral').toLowerCase();
			const e = m.get(cls) ?? { played: 0, total: 0 };
			e.total += 1;
			if (played(c.code)) e.played += 1;
			m.set(cls, e);
		}
		return [...m.entries()].sort((a, b) => b[1].total - a[1].total);
	});
	const byLevel = $derived.by(() => {
		const m = new Map<number, { played: number; total: number }>();
		for (const c of universe) {
			const lv = c.xp ?? 0;
			const e = m.get(lv) ?? { played: 0, total: 0 };
			e.total += 1;
			if (played(c.code)) e.played += 1;
			m.set(lv, e);
		}
		return [...m.entries()].sort((a, b) => a[0] - b[0]);
	});

	const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
</script>

{#if universe.length}
	<div class="space-y-4">
		<p class="text-primary-600 dark:text-primary-400 text-sm">
			<span class="tabular-nums font-semibold text-black dark:text-white">{playedCount}/{universe.length}</span>
			{m.cards_insights_played()}
			<span class="text-primary-400 px-1">·</span>
			<span class="tabular-nums font-semibold text-black dark:text-white">{universe.length - playedCount}</span>
			{m.cards_insights_never_played()}
		</p>
		<div class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
			<div>
				<h3 class="text-primary-700 dark:text-primary-300 mb-1.5 text-sm font-semibold">{m.cards_insights_by_class()}</h3>
				<div class="space-y-1">
					{#each byClass as [cls, s] (cls)}
						<div class="flex items-center gap-2 text-sm">
							<span class="w-20 shrink-0 text-black dark:text-white">{classLabel[cls] ?? cls}</span>
							<div class="bg-primary-100 dark:bg-primary-800 h-2.5 flex-1 overflow-hidden rounded">
								<div class="bg-secondary-500 h-full" style="width: {pct(s.played, s.total)}%"></div>
							</div>
							<span class="text-primary-500 w-16 shrink-0 text-right tabular-nums"
								>{s.played}/{s.total}</span
							>
						</div>
					{/each}
				</div>
			</div>
			<div>
				<h3 class="text-primary-700 dark:text-primary-300 mb-1.5 text-sm font-semibold">{m.cards_insights_by_level()}</h3>
				<div class="space-y-1">
					{#each byLevel as [lv, s] (lv)}
						<div class="flex items-center gap-2 text-sm">
							<span class="w-20 shrink-0 text-black dark:text-white">{m.cards_insights_level({ lv })}</span>
							<div class="bg-primary-100 dark:bg-primary-800 h-2.5 flex-1 overflow-hidden rounded">
								<div class="bg-secondary-500 h-full" style="width: {pct(s.played, s.total)}%"></div>
							</div>
							<span class="text-primary-500 w-16 shrink-0 text-right tabular-nums"
								>{s.played}/{s.total}</span
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
