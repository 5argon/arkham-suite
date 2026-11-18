<!-- @component A titled list of choices, each with how many plays made it. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SectionLabel } from '$lib/components/profile/_primitives';

	let {
		heading,
		rows
	}: {
		heading: Snippet;
		rows: { id: string; label: string; count: number }[];
	} = $props();
</script>

<div>
	<SectionLabel>{@render heading()}</SectionLabel>
	<ul class="space-y-0.5 text-xs">
		{#each rows as r (r.id)}
			<li class="flex justify-between gap-2 {r.count > 0 ? 'text-black dark:text-white' : 'text-primary-400'}">
				<span class="truncate">{r.label}</span>
				<span class="shrink-0 tabular-nums">{r.count > 0 ? `×${r.count}` : '—'}</span>
			</li>
		{/each}
	</ul>
</div>
