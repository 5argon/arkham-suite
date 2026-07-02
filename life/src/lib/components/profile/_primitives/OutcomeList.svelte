<!--
@component
OutcomeList — the shared "● lit / ○ greyed" story-fork list. Each item is a label (usually resolved
from campaign-data so the wording matches the physical campaign log) with a hit flag and an optional
×count. An optional trailing annotation (`note`, muted) tags each line — e.g. the scenario it was
found in. Keeps the ●/○ markup in one place instead of hand-rolling it per widget.
-->
<script lang="ts">
	export interface OutcomeItem {
		label: string;
		hit: boolean;
		/** Plays that hit this outcome (shown as ×N when > 1). */
		count?: number;
		/** Muted trailing annotation (e.g. the scenario the outcome belongs to). */
		note?: string;
	}

	let { items, size = 'text-sm' }: { items: OutcomeItem[]; size?: string } = $props();
</script>

<div class="space-y-1">
	{#each items as it, i (i)}
		<div
			class="flex items-start gap-1.5 {size} {it.hit
				? 'text-black dark:text-white'
				: 'text-primary-400'}"
		>
			<span class="mt-px shrink-0">{it.hit ? '●' : '○'}</span>
			<span class="flex-1"
				>{it.label}{#if it.note}<span class="text-primary-400"> · {it.note}</span>{/if}</span
			>
			{#if it.hit && (it.count ?? 0) > 1}
				<span class="text-secondary-600 dark:text-secondary-400 shrink-0 text-xs font-semibold tabular-nums"
					>×{it.count}</span
				>
			{/if}
		</div>
	{/each}
</div>
