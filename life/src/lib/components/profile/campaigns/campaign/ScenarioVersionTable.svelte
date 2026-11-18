<!-- @component A scenario's per-version table, built from its version axis in version-stats.ts. -->
<script lang="ts">
	import { scenarioVersions, toVersionRow, versionFromLog } from '$lib/campaign/stats/version-stats';
	import { scenarioMeta } from '$lib/campaign/utils/scenario-meta';
	import { isVictoryDisplay } from '$lib/campaign/utils/scenario-reward';
	import type { WidgetContext } from '$lib/components/profile/_framework/widget-context';
	import VersionBreakdown from './VersionBreakdown.svelte';

	let {
		ctx,
		scenarioId,
		label,
		accent,
		resolutionIds,
		title,
		showSucceedFailed = false,
		showPlays = false,
		showResolutions = true,
		showXp = false
	}: {
		ctx: WidgetContext;
		/** Overrides `ctx.scenario`. */
		scenarioId?: string;
		label: (version: string) => string;
		accent?: (version: string) => string | undefined;
		/** The resolutions reachable in a version; defaults to every resolution of the scenario. */
		resolutionIds?: (version: string) => string[];
		title?: string;
		showSucceedFailed?: boolean;
		showPlays?: boolean;
		showResolutions?: boolean;
		showXp?: boolean;
	} = $props();

	const id = $derived(scenarioId ?? ctx.scenario ?? '');
	const stat = $derived(ctx.scenarios?.scenarios.find((s) => s.scenario === id) ?? null);
	const allResolutions = $derived(scenarioMeta(ctx.family, id)?.resolutions ?? []);
	const rows = $derived(
		scenarioVersions(ctx.scenarios, id).stats.map((vs) =>
			toVersionRow(vs, {
				label: label(vs.value),
				accent: accent?.(vs.value),
				resolutionIds: resolutionIds?.(vs.value) ?? allResolutions,
				verdicts: stat?.verdicts ?? null
			})
		)
	);
</script>

{#if rows.length}
	<VersionBreakdown
		{rows}
		{title}
		{showSucceedFailed}
		{showPlays}
		{showResolutions}
		{showXp}
		victoryDisplay={isVictoryDisplay(ctx.family, id)}
		logOnly={ctx.logOnly}
		versionFromLog={versionFromLog(id)}
	/>
{/if}
