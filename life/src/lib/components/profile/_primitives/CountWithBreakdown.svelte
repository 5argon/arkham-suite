<!--
@component
A single inline number that, when a per-difficulty `byTier` map is supplied, reveals a
hover tooltip breaking the count down by difficulty — the shared "see this number by
difficulty" feature for tight TABLE CELLS (where StatNumbers' big-number layout doesn't
fit). The caller formats the display string (e.g. `×3`) and styles it via `class`.
Without `byTier` (or an all-zero one) it renders as a plain span, no hover.
-->
<script lang="ts">
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';
		import { difficultyBreakdown, times } from '$lib/campaign/utils/difficulty';

	let {
		value,
		byTier = null,
		class: klass = '',
		format = times
	}: {
		/** The display string/number (e.g. `×3`). */
		value: number | string;
		/** Per-difficulty counts; enables the hover breakdown when present. */
		byTier?: Record<string, number> | null;
		class?: string;
		/** How each per-difficulty value is rendered in the breakdown — defaults to the count form
		 *  (`×3`). Pass a unit formatter (e.g. `n => "${n} VP"`) when the number isn't a count. */
		format?: (n: number) => string;
	} = $props();

	const breakdown = $derived(byTier ? difficultyBreakdown(byTier, format) : '');
	const tip = new HoverTipState();
</script>

{#if breakdown}
	<span
		role="img"
		aria-label="{value} — {breakdown}"
		class="cursor-default {klass}"
		onmouseenter={(e) => tip.show('', breakdown, e)}
		onmouseleave={tip.hide}>{value}</span
	>
	<HoverTip {tip} />
{:else}
	<span class={klass}>{value}</span>
{/if}
