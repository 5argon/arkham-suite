<!-- @component Resolution chips (R1, R2, …) lit when reached; hover for the full name and, with `tallies`, the per-difficulty count. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';
	import { difficultyBreakdown, nTimes } from '$lib/campaign/utils/difficulty';
	import { resolutionLabel, resolutionShort } from '$lib/campaign/utils/resolutions';
	import type { Tally } from '$lib/campaign/utils/tally';

	let {
		ids,
		visited,
		tallies = null,
		verdicts = null,
		nowrap = false,
	}: {
		ids: string[];
		visited: ReadonlySet<string>;
		tallies?: Record<string, Tally> | null;
		/** Adds "(Success)" / "(Failure)" to the hover name (campaign-data `resolutionOutcomes`). */
		verdicts?: Record<string, 'win' | 'loss' | 'neutral'> | null;
		nowrap?: boolean;
	} = $props();

	function tallyText(t: Tally): string {
		const breakdown = difficultyBreakdown(t.byTier, nTimes);
		return breakdown
			? m.campaign_chips_total_breakdown({ count: nTimes(t.total), breakdown })
			: m.campaign_chips_total({ count: nTimes(t.total) });
	}

	function labelWithVerdict(id: string): string {
		const v = verdicts?.[id];
		const suffix =
			v === 'win'
				? ` (${m.campaign_scenario_verdict_success()})`
				: v === 'loss'
					? ` (${m.campaign_scenario_verdict_failure()})`
					: '';
		return resolutionLabel(id) + suffix;
	}

	const tip = new HoverTipState();
</script>

<div class="flex {nowrap ? 'flex-nowrap' : 'flex-wrap'} gap-1">
	{#each ids as id (id)}
		{@const tally = tallies?.[id] ?? null}
		<span
			role="img"
			aria-label="{labelWithVerdict(id)}{tally ? ` — ${tallyText(tally)}` : ''}"
			onmouseenter={(e) => tip.show(labelWithVerdict(id), tally ? tallyText(tally) : '', e)}
			onmouseleave={tip.hide}
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

<HoverTip {tip} />
