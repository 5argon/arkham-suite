<!--
@component
Card pool summary: one product icon per box in the pool with the share of
that box the team is using underneath, and a hover tooltip naming the product
with used / total counts (like the deck banner's utilization row). A viewer
can tell at a glance whether they own everything the team needs.
-->
<script lang="ts">
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import type { CardCode, Product } from '@5argon/arkham-kohaku';
	import { u as stringUtils } from '@5argon/arkham-string';

	import * as m from '$lib/paraglide/messages.js';
	import { poolSections } from '$lib/tool/evergreen-team/pool';
	import { remainingOf } from '$lib/tool/evergreen-team/rules';
	import type { EvergreenState, PoolEntry } from '$lib/tool/evergreen-team/types';

	interface Prop {
		team: EvergreenState;
		pool: Map<CardCode, PoolEntry>;
	}
	const { team, pool }: Prop = $props();

	interface Usage {
		product: Product;
		used: number;
		total: number;
		percent: number;
	}
	const getFrozen = () => ({ setup: team.setup, pool });
	const sections = poolSections(getFrozen().setup, getFrozen().pool);
	const usages = $derived(
		sections.map((section): Usage => {
			const total = section.entries.reduce((sum, e) => sum + e.total, 0);
			const remaining = section.entries.reduce(
				(sum, e) => sum + remainingOf(team, pool, e.card.code),
				0
			);
			const used = total - remaining;
			return {
				product: section.product,
				used,
				total,
				percent: total > 0 ? Math.floor((used / total) * 100) : 0
			};
		})
	);

	let tooltipUsage = $state<Usage | null>(null);
	let tooltipEl = $state<HTMLElement | null>(null);
</script>

<div class="flex flex-wrap items-start justify-center gap-3">
	{#each usages as usage (usage.product)}
		<div
			class="text-primary-900 dark:text-primary-100 flex cursor-default flex-col items-center"
			role="img"
			onmouseenter={(ev) => {
				tooltipUsage = usage;
				tooltipEl = ev.currentTarget as HTMLElement;
			}}
			onmouseleave={() => (tooltipUsage = null)}
		>
			<span class="text-2xl leading-none">
				<ProductIcon product={usage.product} />
			</span>
			<span class="text-primary-700 dark:text-primary-300 text-xs font-semibold">
				{usage.percent}%
			</span>
		</div>
	{/each}
</div>

<HoverTooltip visible={tooltipUsage !== null} referenceElement={tooltipEl}>
	{#if tooltipUsage}
		<div class="text-primary-900 dark:text-primary-100 flex items-center gap-2">
			<ProductIcon product={tooltipUsage.product} />
			<span class="text-sm font-medium whitespace-nowrap">
				{stringUtils.productName(tooltipUsage.product)}
			</span>
			<span class="text-xs whitespace-nowrap">
				{m.tool_evergreen_team_pool_used({
					used: tooltipUsage.used,
					total: tooltipUsage.total,
					percent: tooltipUsage.percent
				})}
			</span>
		</div>
	{/if}
</HoverTooltip>
