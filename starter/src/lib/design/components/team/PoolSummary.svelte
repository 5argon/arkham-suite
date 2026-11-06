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
	import { u as stringUtils } from '@5argon/arkham-string';

	import * as m from '$lib/paraglide/messages.js';
	import type { PoolUsage } from '$lib/tool/evergreen-team/team-display';

	interface Prop {
		usages: PoolUsage[];
	}
	const { usages }: Prop = $props();

	// The last usage stays after leaving, so the tooltip can animate out with its content.
	let tooltipUsage = $state<PoolUsage | null>(null);
	let tooltipVisible = $state(false);
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
				tooltipVisible = true;
			}}
			onmouseleave={() => (tooltipVisible = false)}
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

<HoverTooltip visible={tooltipVisible} referenceElement={tooltipEl}>
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
