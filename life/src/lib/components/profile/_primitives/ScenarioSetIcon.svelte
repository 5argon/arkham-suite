<!--
@component
A scenario's encounter-set icon (1em, inherits the surrounding text colour), falling back to a
small lettered chip when the scenario has no kohaku encounter set (e.g. an interlude location).
Pass a `scenarioId` to resolve the set + fallback automatically (the simple path for list / table
widgets), or a precomputed `iconSet` + `fallback` (the icon-track renderers, which already have them
per item). Shared by RoutingTrack / PtcTokenChain / PtcDcChain and the per-scenario list widgets
(Scenario XP Highscore / Resolution Coverage).
-->
<script lang="ts">
	import { EncounterSetIcon } from '@5argon/arkham-life-ui';
	import { getScenarioData, Scenario, type EncounterSet } from '@5argon/arkham-kohaku';

	let {
		scenarioId,
		iconSet: iconSetProp,
		fallback: fallbackProp
	}: {
		/** Resolve the icon + fallback from a scenario id (the simple path for list / table widgets). */
		scenarioId?: string;
		/** …or supply a precomputed encounter set (the icon-track renderers do this per item). */
		iconSet?: EncounterSet | null;
		/** Lettered chip shown when there's no encounter set; derived from `scenarioId` when omitted. */
		fallback?: string;
	} = $props();

	const KOHAKU = new Set<string>(Object.values(Scenario));
	function lookup(id: string): EncounterSet | null {
		if (!KOHAKU.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}
	function setFor(id: string): EncounterSet | null {
		const direct = lookup(id);
		if (direct) return direct;
		// Replay variants (e.g. Fatal Mirage's fatal_mirage_2 / _3) aren't kohaku scenarios — borrow
		// the BASE scenario's icon by dropping a trailing _<n>. The base must itself be a kohaku
		// scenario, so genuinely distinct numbered scenarios (ice_and_death_part_2 — already kohaku)
		// resolve directly above and never reach this fallback.
		const base = id.replace(/_\d+$/, '');
		return base !== id ? lookup(base) : null;
	}

	const iconSet = $derived(scenarioId !== undefined ? setFor(scenarioId) : (iconSetProp ?? null));
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
