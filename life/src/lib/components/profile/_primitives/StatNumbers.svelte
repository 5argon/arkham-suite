<!--
@component
Big numbers with captions, in fixed rows. A group with a `heading` gets a centred title; a stat
with a tally hovers to its per-difficulty breakdown. Groups whose values are all zero or empty are
left out, and `empty` shows when nothing is left.
-->
<script lang="ts" module>
	import type { Tally } from '$lib/campaign/utils/tally';

	export interface Stat {
		label: string;
		/** Defaults to the tally's total; null or undefined shows a dash. */
		value?: number | string | null;
		tally?: Tally;
		/** A breakdown for a value that is not a tally total. */
		byTier?: Record<string, number>;
	}

	export interface StatGroup {
		heading?: string;
		stats: Stat[];
		/** Hidden in log-only mode. */
		nonLog?: boolean;
		/** Shown even when every value is zero or empty. */
		keepEmpty?: boolean;
	}
</script>

<script lang="ts">
	import { difficultyBreakdown } from '$lib/campaign/utils/difficulty';
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';
	import SectionLabel from './SectionLabel.svelte';
	import WidgetEmpty from './WidgetEmpty.svelte';

	let {
		rows,
		logOnly = false,
		empty
	}: {
		rows: (Stat[] | StatGroup)[];
		logOnly?: boolean;
		/** Shown when no group is left to display. */
		empty?: string;
	} = $props();

	const valueOf = (s: Stat) => s.value ?? s.tally?.total ?? null;
	const hasValue = (s: Stat) => {
		const v = valueOf(s);
		return typeof v === 'number' ? v !== 0 : !!v;
	};
	const breakdownOf = (s: Stat) => {
		const byTier = s.byTier ?? s.tally?.byTier;
		return byTier ? difficultyBreakdown(byTier) : '';
	};

	const groups = $derived(
		rows
			.map((r): StatGroup => (Array.isArray(r) ? { stats: r } : r))
			.filter((g) => !(g.nonLog && logOnly) && g.stats.length && (g.keepEmpty || g.stats.some(hasValue)))
	);

	const number = 'text-4xl leading-none font-bold text-black tabular-nums dark:text-white';
	const tip = new HoverTipState();
</script>

{#if groups.length}
	<div class="space-y-4">
		{#each groups as g, i (i)}
			<div>
				{#if g.heading}
					<SectionLabel variant="heading" align="center">{g.heading}</SectionLabel>
				{/if}
				<div class="flex flex-wrap justify-center gap-x-6 gap-y-3">
					{#each g.stats as s (s.label)}
						{@const breakdown = breakdownOf(s)}
						{@const value = valueOf(s) ?? '—'}
						<div class="max-w-32 text-center">
							{#if breakdown}
								<div
									role="img"
									aria-label="{s.label}: {value} — {breakdown}"
									class="{number} cursor-default"
									onmouseenter={(e) => tip.show(s.label, breakdown, e)}
									onmouseleave={tip.hide}
								>
									{value}
								</div>
							{:else}
								<div class={number}>{value}</div>
							{/if}
							<div class="text-primary-500 mt-1.5 text-sm">{s.label}</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
	<HoverTip {tip} />
{:else if empty}
	<WidgetEmpty>{empty}</WidgetEmpty>
{/if}
