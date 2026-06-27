<!--
@component
Shared "big number + small caption" stat display for the simple stat widgets (EotE
Miasma / Ice and Death / Fatal Mirage, TSK Succeed-vs-Failed, …). Takes EXPLICIT
rows so the grouping is fixed on every screen size (rather than one flex-wrap that
reflows unpredictably). Each row is a centred group; cells are width-capped so long
labels wrap inside a cell instead of the row breaking apart.

A row may be a plain `Stat[]` OR a `{ heading, stats }` group — the optional `heading`
renders as a centred topic line above that row, so a group of numbers can say what
they're about (e.g. "The Necronomicon" over took / destroyed / failed). Backward
compatible: existing `Stat[][]` callers are unaffected.

A stat may carry a `byTier` map (per-difficulty counts); when present the number
becomes hoverable and reveals a per-difficulty breakdown tooltip — the shared "see
this number by difficulty" feature, matching the resolution-chip hover.
-->
<script lang="ts" module>
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
	import { HoverTooltip } from '@5argon/arkham-life-ui';
	import { difficultyBreakdown, times } from '$lib/campaign/utils/difficulty';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';

	let { rows }: { rows: (Stat[] | StatGroup)[] } = $props();

	// Normalise each row to a {heading?, stats} group (a bare array = no heading).
	const groups = $derived(
		rows.map((r): StatGroup => (Array.isArray(r) ? { stats: r } : r))
	);

	const breakdownOf = (s: Stat): string =>
		s.byTier ? difficultyBreakdown(s.byTier, times) : '';

	// One shared tooltip for every hoverable number in this component.
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipLabel = $state('');
	let tipText = $state('');
	function showTip(s: Stat, e: MouseEvent) {
		tipLabel = s.label;
		tipText = breakdownOf(s);
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
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
										onmouseenter={(e) => showTip(s, e)}
										onmouseleave={hideTip}
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

	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block py-1 text-xs text-neutral-900 dark:text-neutral-100">
			<span class="font-semibold">{tipLabel}</span>
			{#if tipText}
				<br />
				<span class="text-neutral-600 dark:text-neutral-300">{tipText}</span>
			{/if}
		</span>
	</HoverTooltip>
{/if}
