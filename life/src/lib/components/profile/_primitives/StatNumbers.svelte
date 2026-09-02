<!--
@component
Shared "big number + small caption" stat display. Takes EXPLICIT rows so the grouping is fixed on
every screen size. Each row is a centred group; cells are width-capped so long labels wrap inside
a cell instead of the row breaking apart.

A row may be a plain `Stat[]` OR a `{ heading, stats }` group — the optional `heading`
renders as a centred topic line above that row, so a group of numbers can say what
they're about (e.g. "The Necronomicon" over took / destroyed / failed).

A stat may carry a `byTier` map (per-difficulty counts); when present the number
becomes hoverable and reveals a per-difficulty breakdown tooltip — the shared "see
this number by difficulty" feature, matching the resolution-chip hover.
-->
<script lang="ts" module>
	import HoverTip from './HoverTip.svelte';
	import { HoverTipState } from './hover-tip.svelte';
	export interface Stat {
		/** `null` / `undefined` render as a long dash (—) — e.g. a high-score that has no qualifying run. */
		value: number | string | null | undefined;
		label: string;
		/** Optional per-difficulty breakdown; enables the difficulty hover on this number. */
		byTier?: Record<string, number>;
	}
	/** A labelled group of stats: an optional centred topic line above the row. */
	export interface StatGroup {
		heading?: string;
		stats: Stat[];
	}
</script>

<script lang="ts">
		import { difficultyBreakdown, times } from '$lib/campaign/utils/difficulty';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';

	let { rows }: { rows: (Stat[] | StatGroup)[] } = $props();

	// Normalise each row to a {heading?, stats} group (a bare array = no heading).
	const groups = $derived(
		rows.map((r): StatGroup => (Array.isArray(r) ? { stats: r } : r))
	);

	const breakdownOf = (s: Stat): string =>
		s.byTier ? difficultyBreakdown(s.byTier, times) : '';

	const tip = new HoverTipState();
</script>

{#if groups.some((g) => g.stats.length)}
	<div class="space-y-4">
		{#each groups as g, i (i)}
			{#if g.stats.length}
				<div>
					{#if g.heading}
						<SectionLabel variant="heading" align="center">{g.heading}</SectionLabel>
					{/if}
					<div class="flex flex-wrap justify-center gap-x-6 gap-y-3">
						{#each g.stats as s (s.label)}
							{@const breakdown = breakdownOf(s)}
							<div class="max-w-32 text-center">
								{#if breakdown}
									<div
										role="img"
										aria-label="{s.label}: {s.value ?? '—'} — {breakdown}"
										class="cursor-default text-4xl leading-none font-bold text-black tabular-nums dark:text-white"
										onmouseenter={(e) => tip.show(s.label, breakdownOf(s), e)}
										onmouseleave={tip.hide}
									>
										{s.value ?? '—'}
									</div>
								{:else}
									<div
										class="text-4xl leading-none font-bold text-black tabular-nums dark:text-white"
									>
										{s.value ?? '—'}
									</div>
								{/if}
								<div class="text-primary-500 mt-1.5 text-sm">{s.label}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<HoverTip {tip} />
{/if}
