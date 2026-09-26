<!-- @component How many of the owned player cards were ever put in a deck, overall, by class and by level. -->
<script lang="ts">
	import type { CardCode, Product } from '@5argon/arkham-kohaku';
	import { cardInsights, type UsageShare } from '$lib/campaign/utils/card-filters';
	import { SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let {
		cardUsage,
		ownedProducts,
		classFilter = null
	}: {
		cardUsage: Record<CardCode, number>;
		ownedProducts: Product[] | null;
		classFilter?: string | null;
	} = $props();

	const insights = $derived(cardInsights(cardUsage, ownedProducts, classFilter));
	const pct = (s: UsageShare) => (s.total ? Math.round((s.played / s.total) * 100) : 0);
</script>

{#snippet progress(label: string, s: UsageShare)}
	<div class="flex items-center gap-2 text-sm">
		<span class="w-20 shrink-0 text-black dark:text-white">{label}</span>
		<div class="bg-primary-100 dark:bg-primary-800 h-2.5 flex-1 overflow-hidden rounded">
			<div class="bg-secondary-500 h-full" style="width: {pct(s)}%"></div>
		</div>
		<span class="text-primary-500 w-16 shrink-0 text-right tabular-nums">{s.played}/{s.total}</span>
	</div>
{/snippet}

{#if insights.total}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				[
					{ value: `${insights.played}/${insights.total}`, label: m.cards_insights_played() },
					{ value: insights.total - insights.played, label: m.cards_insights_never_played() }
				]
			]}
		/>
		<div class="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
			<div>
				<SectionLabel variant="heading">{m.cards_insights_by_class()}</SectionLabel>
				<div class="space-y-1">
					{#each insights.byClass as s (s.cls)}
						{@render progress(m.shared_class({ class: s.cls }), s)}
					{/each}
				</div>
			</div>
			<div>
				<SectionLabel variant="heading">{m.cards_insights_by_level()}</SectionLabel>
				<div class="space-y-1">
					{#each insights.byLevel as s (s.level)}
						{@render progress(m.cards_insights_level({ lv: s.level }), s)}
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}
