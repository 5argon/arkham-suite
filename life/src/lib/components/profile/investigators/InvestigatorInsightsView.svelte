<!--
@component
Investigator Usage: of the investigators you own (by product), which you've run
across your contributing campaigns and how many times — locked to the icon view
with a play-count badge, greyed when never run. Optional config filters drop
Parallel investigators (90xxx codes) and Subject 5U-21 (89001). "Versions played"
lists the distinct version choices (Tony's secondary class, Mandy's deck size,
Wendy/Lola options) you actually used.
-->
<script lang="ts">
	import { type CardItem, FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import { card as cardUtils, type Card, type Product } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { isCardOwned } from '$lib/campaign/ownership';
	import type { InvestigatorStat } from '$lib/profile/profile-types';
	import * as m from '$lib/paraglide/messages.js';

	let {
		investigators,
		ownedProducts,
		classFilter = null,
		config,
	}: {
		investigators: InvestigatorStat[];
		ownedProducts: Product[] | null;
		/** When set, narrow to one card class (an investigator class detail page). */
		classFilter?: string | null;
		/** Per-widget config: { ignoreParallel, ignore5u21 }. */
		config?: Record<string, unknown>;
	} = $props();

	const ignoreParallel = $derived(config?.ignoreParallel === true);
	const ignore5u21 = $derived(config?.ignore5u21 === true);
	// Parallel investigators carry 90xxx codes; Subject 5U-21 is 89001.
	const isParallel = (code: string) => code.startsWith('90');
	const SUBJECT_5U21 = '89001';

	const playedMap = $derived(new Map(investigators.map((i) => [i.code, i])));
	const byCode = $derived(new Map(getAllCards().map((c) => [c.code, c])));
	const universe = $derived.by((): Card[] =>
		getAllCards().filter(
			(c) =>
				cardUtils.deckbuildingInvestigatorCardsFilter(c) &&
				isCardOwned(c.product, ownedProducts) &&
				(!classFilter || String(c.cardClass?.class1 ?? '').toLowerCase() === classFilter) &&
				(!ignoreParallel || !isParallel(c.code)) &&
				(!ignore5u21 || c.code !== SUBJECT_5U21),
		),
	);
	const playedCount = $derived(universe.filter((c) => playedMap.has(c.code)).length);
	const cardItems = $derived.by((): CardItem[] =>
		universe.map((c) => ({
			card: c,
			quantity: 1,
			id: c.code,
			greyedOutQuantity: playedMap.has(c.code) ? 0 : 1,
			iconCount: playedMap.get(c.code)?.count ?? 0,
		})),
	);
	const withOptions = $derived(
		investigators.filter((i) => i.options.length && universe.some((c) => c.code === i.code)),
	);
</script>

{#if universe.length}
	<p class="text-primary-600 dark:text-primary-400 mb-3 text-sm">
		{m.investigators_insights_intro({ played: playedCount, total: universe.length })}
	</p>
	<div class="space-y-4">
		<FlexibleCardDisplay
			cards={cardItems}
			defaultSettings={{ grouping: ['class'], sortingOrder: ['set', 'position'] }}
			defaultViewMode="icons"
			hideChecklistMode
			hideViewMode
			hideGroupingSorting
			showIconCount
		/>
		{#if withOptions.length}
			<div>
				<h3 class="text-primary-700 dark:text-primary-300 mb-1.5 text-sm font-semibold">
					{m.investigators_insights_versions_played()}
				</h3>
				<ul class="space-y-1">
					{#each withOptions as i (i.code)}
						<li class="flex flex-wrap items-baseline gap-x-2 text-sm">
							<span class="font-medium text-black dark:text-white">{byCode.get(i.code)?.name ?? i.code}</span>
							<span class="text-primary-500">{i.options.join(' · ')}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
