<!-- @component The owned investigators lit by how many decks ran them, and the versions played (Tony's second class, Mandy's deck size, …). -->
<script lang="ts">
	import { type CardItem, FlexibleCardDisplay } from '@5argon/arkham-life-ui';
	import { card as cardUtils, type Card, type Product } from '@5argon/arkham-kohaku';
	import { cardByCode, getAllCards } from '$lib/card-data';
	import { inCardClass } from '$lib/campaign/utils/card-filters';
	import { isCardOwned } from '$lib/campaign/utils/ownership';
	import type { InvestigatorStat } from '$lib/profile/profile-types';
	import { SectionLabel } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let {
		investigators,
		ownedProducts,
		classFilter = null,
		config
	}: {
		investigators: InvestigatorStat[];
		ownedProducts: Product[] | null;
		classFilter?: string | null;
		/** `ignoreParallel`, `ignore5u21`. */
		config?: Record<string, unknown>;
	} = $props();

	const ignoreParallel = $derived(config?.ignoreParallel === true);
	const ignore5u21 = $derived(config?.ignore5u21 === true);
	const isParallel = (code: string) => code.startsWith('90');
	const SUBJECT_5U21 = '89001';

	const playedMap = $derived(new Map(investigators.map((i) => [i.code, i])));
	const universe = $derived.by((): Card[] =>
		getAllCards().filter(
			(c) =>
				cardUtils.deckbuildingInvestigatorCardsFilter(c) &&
				isCardOwned(c.product, ownedProducts) &&
				(!classFilter || inCardClass(c, classFilter)) &&
				(!ignoreParallel || !isParallel(c.code)) &&
				(!ignore5u21 || c.code !== SUBJECT_5U21)
		)
	);
	const playedCount = $derived(universe.filter((c) => playedMap.has(c.code)).length);
	const cardItems = $derived.by((): CardItem[] =>
		universe.map((c) => ({
			card: c,
			quantity: 1,
			id: c.code,
			greyedOutQuantity: playedMap.has(c.code) ? 0 : 1,
			iconCount: playedMap.get(c.code)?.count ?? 0
		}))
	);
	const withOptions = $derived(
		investigators.filter((i) => i.options.length && universe.some((c) => c.code === i.code))
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
				<SectionLabel variant="heading">{m.investigators_insights_versions_played()}</SectionLabel>
				<ul class="space-y-1">
					{#each withOptions as i (i.code)}
						<li class="flex flex-wrap items-baseline gap-x-2 text-sm">
							<span class="font-medium text-black dark:text-white">{cardByCode(i.code)?.name ?? i.code}</span>
							<span class="text-primary-500">{i.options.join(' · ')}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
