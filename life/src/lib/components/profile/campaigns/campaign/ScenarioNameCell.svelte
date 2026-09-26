<!-- @component A table cell with a scenario's encounter-set icon and name; `iconSet` overrides the icon of `scenarioId`. -->
<script lang="ts">
	import type { EncounterSet } from '@5argon/arkham-kohaku';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';

	let {
		scenarioId,
		iconSet,
		fallback,
		name,
		muted = false,
		faded = false
	}: {
		scenarioId?: string;
		iconSet?: EncounterSet | null;
		fallback?: string;
		name: string;
		muted?: boolean;
		/** Fade the whole cell. */
		faded?: boolean;
	} = $props();
</script>

<td class="{widgetTableCell} whitespace-nowrap">
	<span class="flex items-center gap-1.5" class:opacity-50={faded}>
		<span class="text-primary-600 dark:text-primary-300 shrink-0" style="font-size:1.1rem">
			<ScenarioSetIcon {scenarioId} {iconSet} {fallback} />
		</span>
		<span class={muted ? 'text-primary-600 dark:text-primary-300' : 'text-black dark:text-white'}
			>{name}</span
		>
	</span>
</td>
