<!-- @component An inline number for table cells; hovers to its per-difficulty breakdown. -->
<script lang="ts">
	import { difficultyBreakdown, nTimes } from '$lib/campaign/utils/difficulty';
	import type { Tally } from '$lib/campaign/utils/tally';
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';

	let {
		value,
		tally = null,
		byTier = null,
		class: klass = '',
		format = nTimes
	}: {
		/** Defaults to the tally's total. */
		value?: number | string;
		tally?: Tally | null;
		byTier?: Record<string, number> | null;
		class?: string;
		/** Renders each tier's value in the breakdown. */
		format?: (n: number) => string;
	} = $props();

	const shown = $derived(value ?? tally?.total ?? 0);
	const tiers = $derived(byTier ?? tally?.byTier ?? null);
	const breakdown = $derived(tiers ? difficultyBreakdown(tiers, format) : '');
	const tip = new HoverTipState();
</script>

{#if breakdown}
	<span
		role="img"
		aria-label="{shown} — {breakdown}"
		class="cursor-default {klass}"
		onmouseenter={(e) => tip.show('', breakdown, e)}
		onmouseleave={tip.hide}>{shown}</span
	>
	<HoverTip {tip} />
{:else}
	<span class={klass}>{shown}</span>
{/if}
