<!--
@component
A row of compact resolution chips — the shared building block for every place we
show "which endings?" (the Resolution Coverage widget and the per-scenario TSK
widget's per-variant column). Each chip is `resolutionShort` (e.g. `R1`), lit when
the player has reached that resolution and dimmed otherwise. Hovering a chip
reveals its full name and — when `tallies` are supplied — how many times it was
reached, broken down per difficulty (one shared tooltip per chip set).

Pass `tallies` to enable the breakdown; omit it for plain labelled chips.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import { difficultyBreakdown, times } from '$lib/campaign/difficulty';
	import { resolutionLabel, resolutionShort } from '$lib/campaign/resolutions';
	import type { ResolutionTally } from '$lib/campaign/resolution-coverage';

	let {
		ids,
		visited,
		tallies = null,
		nowrap = false,
	}: {
		/** Resolution ids to render, in order. */
		ids: string[];
		/** Which ids the player has reached (those chips are lit). */
		visited: ReadonlySet<string>;
		/** Per-resolution reach counts; enables the per-difficulty hover breakdown. */
		tallies?: Record<string, ResolutionTally> | null;
		/** Keep the chips on ONE line (no wrapping) — for tight table cells that scroll instead. */
		nowrap?: boolean;
	} = $props();

	function tallyText(t: ResolutionTally): string {
		const breakdown = difficultyBreakdown(t.byTier, times);
		return breakdown
			? m.campaign_chips_total_breakdown({ count: times(t.total), breakdown })
			: m.campaign_chips_total({ count: times(t.total) });
	}

	// One shared tooltip for every chip this component renders.
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipLabel = $state('');
	let tipTally = $state<ResolutionTally | null>(null);

	function showTip(id: string, e: MouseEvent) {
		tipLabel = resolutionLabel(id);
		tipTally = tallies?.[id] ?? null;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

<div class="flex {nowrap ? 'flex-nowrap' : 'flex-wrap'} gap-1">
	{#each ids as id (id)}
		{@const tally = tallies?.[id] ?? null}
		<span
			role="img"
			aria-label="{resolutionLabel(id)}{tally ? ` — ${tallyText(tally)}` : ''}"
			onmouseenter={(e) => showTip(id, e)}
			onmouseleave={hideTip}
			class={[
				'cursor-default rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums',
				visited.has(id)
					? 'bg-secondary-500 text-white'
					: 'bg-primary-100 dark:bg-primary-800 text-primary-400 dark:text-primary-600',
			]}
		>
			{resolutionShort(id)}
		</span>
	{/each}
</div>

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block max-w-xs py-1 text-xs text-neutral-900 dark:text-neutral-100">
		<span class="font-semibold">{tipLabel}</span>
		{#if tipTally}
			<br />
			<span class="text-neutral-600 dark:text-neutral-300">{tallyText(tipTally)}</span>
		{/if}
	</span>
</HoverTooltip>
