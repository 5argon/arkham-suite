<!-- @component A ● reached / ○ not reached list of story outcomes with optional ×counts. -->
<script lang="ts">
	export interface OutcomeItem {
		label: string;
		hit: boolean;
		/** Shown as ×N when above 1. */
		count?: number;
		/** A muted trailing note, e.g. the scenario. */
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
