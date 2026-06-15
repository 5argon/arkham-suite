<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-icon';
	import { labelFor } from '@5argon/arkham-tsk-solver';
	import { scenarioEncounterSet, type ScenarioIconItem } from './helpers';

	let { items, size = '1.6rem' }: { items: ScenarioIconItem[]; size?: string } = $props();
</script>

<span class="inline-flex flex-wrap items-start gap-2.5" style="font-size: {size}">
	{#each items as it, i (i)}
		{@const es = scenarioEncounterSet(it.scenario)}
		{#if es}
			<span
				class="inline-flex flex-col items-center leading-none text-primary-700 dark:text-primary-200"
				title={labelFor(it.scenario)}
			>
				<EncounterSetIcon encounterSet={es} />
				<span class="mt-0.5 text-[0.42em] font-semibold tabular-nums text-primary-500 dark:text-primary-400">
					{it.badge ?? ' '}
				</span>
			</span>
		{/if}
	{/each}
</span>
