<!-- @component Every scenario's first-choice resolutions, lit when reached. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignScenarios } from '$lib/campaign/stats/scenario-stats';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import ScenarioNameCell from '$lib/components/profile/campaigns/campaign/ScenarioNameCell.svelte';

	let { scenarios }: { scenarios: CampaignScenarios | null } = $props();

	// Interludes and setup scenarios have no resolutions.
	const rows = $derived((scenarios?.scenarios ?? []).filter((s) => s.resolutions.length > 0));
</script>

<div>
	<p class="text-primary-700 dark:text-primary-300 mb-3 text-sm">
		<b class="text-black dark:text-white">{scenarios?.resolutionsVisited ?? 0}</b> / {scenarios?.resolutionsTotal ??
			0}
		{m.campaign_resolution_coverage_seen()}
	</p>
	<WidgetTable
		columns={[
			{ label: m.campaign_resolution_coverage_col_scenario() },
			{ label: m.campaign_resolution_coverage_col_resolutions() }
		]}
		{rows}
		key={(sc) => sc.scenario}
	>
		{#snippet row(sc)}
			<ScenarioNameCell scenarioId={sc.scenario} name={sc.name} muted />
			<td class={widgetTableCell}>
				<ResolutionChips
					ids={sc.resolutions}
					visited={new Set(sc.visited)}
					tallies={sc.tallies}
					verdicts={sc.verdicts}
				/>
			</td>
		{/snippet}
	</WidgetTable>
</div>
