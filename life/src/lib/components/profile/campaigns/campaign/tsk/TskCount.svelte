<!-- @component A table count: "×n" (hovering to its tally's difficulty breakdown), or a dash at zero. -->
<script lang="ts">
	import type { Tally } from '$lib/campaign/utils/tally';
	import { CountWithBreakdown } from '$lib/components/profile/_primitives';

	let {
		value,
		tally = null,
		prefix = '×',
		bright = false
	}: {
		/** Defaults to the tally's total. */
		value?: number;
		tally?: Tally | null;
		prefix?: string;
		/** The lighter secondary shade. */
		bright?: boolean;
	} = $props();

	const n = $derived(value ?? tally?.total ?? 0);
</script>

{#if n > 0}
	<CountWithBreakdown
		value="{prefix}{n}"
		{tally}
		class="{bright ? 'text-secondary-600 dark:text-secondary-400' : 'text-secondary-700 dark:text-secondary-300'} font-semibold"
	/>
{:else}
	<span class="text-primary-400">—</span>
{/if}
