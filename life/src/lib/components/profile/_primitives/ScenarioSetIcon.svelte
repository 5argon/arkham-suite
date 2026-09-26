<!-- @component A scenario's encounter-set icon at 1em, or a lettered chip when it has none. -->
<script lang="ts" module>
	import { getScenarioData, Scenario, type EncounterSet } from '@5argon/arkham-kohaku';

	const KOHAKU = new Set<string>(Object.values(Scenario));

	function lookup(id: string): EncounterSet | null {
		if (!KOHAKU.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}

	/** A replay variant id (`fatal_mirage_2`) borrows its base scenario's icon. */
	export function scenarioIconSet(id: string): EncounterSet | null {
		const base = id.replace(/_\d+$/, '');
		return lookup(id) ?? (base !== id ? lookup(base) : null);
	}
</script>

<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-life-ui';

	let {
		scenarioId,
		iconSet: iconSetProp,
		fallback: fallbackProp
	}: {
		scenarioId?: string;
		/** A precomputed set, instead of `scenarioId`. */
		iconSet?: EncounterSet | null;
		/** The chip's letters; derived from `scenarioId` when omitted. */
		fallback?: string;
	} = $props();

	const iconSet = $derived(
		scenarioId !== undefined ? scenarioIconSet(scenarioId) : (iconSetProp ?? null)
	);
	const fallback = $derived(fallbackProp ?? (scenarioId ? scenarioId.slice(0, 2).toUpperCase() : '?'));
</script>

{#if iconSet}
	<EncounterSetIcon encounterSet={iconSet} />
{:else}
	<span
		class="bg-primary-200 dark:bg-primary-700 flex items-center justify-center rounded-full font-semibold"
		style="width:1em;height:1em;font-size:0.5em">{fallback}</span
	>
{/if}
