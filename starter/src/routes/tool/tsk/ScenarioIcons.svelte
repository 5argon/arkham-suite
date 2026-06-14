<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-icon';
	import { labelFor } from '@5argon/arkham-tsk-solver';
	import { scenarioEncounterSet } from './helpers';

	let { scenarios, size = '1.25rem' }: { scenarios: string[]; size?: string } = $props();
</script>

<span class="inline-flex flex-wrap items-center gap-1.5 text-guardian-700 dark:text-guardian-300" style="font-size: {size}">
	{#each scenarios as s, i (i)}
		{@const es = scenarioEncounterSet(s)}
		{#if es}
			<span class="leading-none" title={labelFor(s)}><EncounterSetIcon encounterSet={es} /></span>
		{/if}
	{/each}
</span>
