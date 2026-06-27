<!--
@component
A single inline number that, when a per-difficulty `byTier` map is supplied, reveals a
hover tooltip breaking the count down by difficulty — the shared "see this number by
difficulty" feature for tight TABLE CELLS (where StatNumbers' big-number layout doesn't
fit). The caller formats the display string (e.g. `×3`) and styles it via `class`.
Without `byTier` (or an all-zero one) it renders as a plain span, no hover.
-->
<script lang="ts">
	import { HoverTooltip } from '@5argon/arkham-life-ui';
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
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
</script>

{#if breakdown}
	<span
		role="img"
		aria-label="{value} — {breakdown}"
		class="cursor-default {klass}"
		onmouseenter={(e) => {
			tipRef = e.currentTarget as HTMLElement;
			tipVisible = true;
		}}
		onmouseleave={() => (tipVisible = false)}>{value}</span
	>
	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block py-1 text-xs text-neutral-600 dark:text-neutral-300">{breakdown}</span>
	</HoverTooltip>
{:else}
	<span class={klass}>{value}</span>
{/if}
