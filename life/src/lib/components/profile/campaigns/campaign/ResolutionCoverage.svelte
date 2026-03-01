<!--
@component
"Which endings have I seen?" for one campaign family: every scenario's full set
of first-choice resolutions, with the ones reached across the player's plays lit
up. Fed by the precomputed resolution coverage (recorded in the editor's Extra
tab). A campaign-specific widget — the same shape works for every campaign.

Chips (and their hover tooltip with the per-difficulty reach breakdown) are the
shared <ResolutionChips> building block, so this widget and the per-scenario TSK
widget render endings identically.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignResolutionCoverage } from '$lib/campaign/resolution-coverage';
	import ResolutionChips from '$lib/components/profile/campaigns/campaign/ResolutionChips.svelte';
	import WidgetTable, { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';

	let { coverage }: { coverage: CampaignResolutionCoverage } = $props();

	function scenarioName(id: string): string {
		return id
			.replace(/^\d+[a-z]?_/, '')
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<div>
	<p class="text-primary-700 dark:text-primary-300 mb-3 text-sm">
		<b class="text-black dark:text-white">{coverage.visitedCount}</b> / {coverage.totalCount}
		{m.campaign_resolution_coverage_seen()}
	</p>
	<WidgetTable
		columns={[
			{ label: m.campaign_resolution_coverage_col_scenario() },
			{ label: m.campaign_resolution_coverage_col_resolutions() }
		]}
		rows={coverage.scenarios}
		key={(sc) => sc.scenario}
	>
		{#snippet row(sc)}
			<td class="{widgetTableCell} text-primary-600 dark:text-primary-300 whitespace-nowrap">
				{scenarioName(sc.scenario)}
			</td>
			<td class={widgetTableCell}>
				<ResolutionChips ids={sc.all} visited={new Set(sc.visited)} tallies={sc.tallies} />
			</td>
		{/snippet}
	</WidgetTable>
</div>
