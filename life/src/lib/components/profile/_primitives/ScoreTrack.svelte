<!-- @component A score from `min` to `max` as a row of cells: lit up to the best score, each value's play count under it, and the thresholds that earn something marked with their card. -->
<script lang="ts" module>
	export interface ScoreMark {
		/** The score that earns it, or more. */
		at: number;
		label: string;
		/** A card to show above the threshold. */
		code?: string;
	}
</script>

<script lang="ts">
	import type { Tally } from '$lib/campaign/utils/tally';
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import * as m from '$lib/paraglide/messages.js';
	import CardThumb from './CardThumb.svelte';
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';

	let {
		min = 0,
		max,
		scores,
		marks = [],
		cellLabel = String
	}: {
		min?: number;
		max: number;
		/** Score → plays that ended on it. */
		scores: Record<string, Tally>;
		marks?: ScoreMark[];
		/** A cell's text, e.g. a band like "10+"; defaults to the value. */
		cellLabel?: (value: number) => string;
	} = $props();

	const tip = new HoverTipState();
	const best = $derived(
		Object.entries(scores)
			.filter(([, t]) => t.total > 0)
			.reduce((b, [v]) => Math.max(b, Number(v)), -Infinity)
	);
	const cells = $derived(
		Array.from({ length: max - min + 1 }, (_, i) => {
			const value = min + i;
			return { value, tally: scores[value], mark: marks.find((mk) => mk.at === value) };
		})
	);
	const hasCards = $derived(marks.some((mk) => mk.code));
</script>

<div class="space-y-2">
	<div
		class="mx-auto grid w-full max-w-max gap-1"
		style:grid-template-columns="repeat({cells.length}, minmax(0, 2.5rem))"
	>
		{#each cells as c (c.value)}
			{@const plays = c.tally?.total ?? 0}
			<div
				role="img"
				aria-label="{cellLabel(c.value)}: {m.campaigns_plays({ count: plays })}"
				class="flex min-w-0 cursor-default flex-col items-center gap-1"
				onmouseenter={(e) =>
					tip.show(
						cellLabel(c.value),
						[
							m.campaigns_plays({ count: plays }),
							c.tally ? difficultyBreakdown(c.tally.byTier) : '',
							c.mark?.label ?? ''
						],
						e
					)}
				onmouseleave={tip.hide}
			>
				{#if hasCards}
					<div class="flex h-9 items-end">
						{#if c.mark?.code}<CardThumb code={c.mark.code} size="h-8 w-8" />{/if}
					</div>
				{/if}
				<div
					class="flex aspect-square w-full items-center justify-center rounded text-sm font-semibold tabular-nums {c.value <=
					best
						? 'bg-primary-600 dark:bg-primary-500 text-white'
						: 'bg-primary-100 dark:bg-primary-800 text-primary-400'} {c.mark
						? 'ring-secondary-500 ring-2 ring-offset-1 ring-offset-transparent'
						: ''}"
				>
					{cellLabel(c.value)}
				</div>
				<span class="text-primary-500 h-4 text-[0.65rem] tabular-nums"
					>{plays ? `×${plays}` : ''}</span
				>
			</div>
		{/each}
	</div>
	{#if marks.length}
		<ul class="text-primary-500 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
			{#each marks as mk (mk.at)}
				<li class={best >= mk.at ? 'text-secondary-600 dark:text-secondary-400 font-semibold' : ''}>
					{m.framework_score_track_mark({ at: mk.at, label: mk.label })}
				</li>
			{/each}
		</ul>
	{/if}
</div>
<HoverTip {tip} />
