<!-- @component The Wages of Sin: the most Heretics released in a play, the Watcher's embrace survived, and Heretics released per play. -->
<script lang="ts">
	import type { CampaignTcu } from '$lib/campaign/campaigns/tcu';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		CountWithBreakdown,
		SectionLabel,
		StatNumbers,
		WidgetTable
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tcu, ctx }: CampaignWidgetProps<CampaignTcu> = $props();
	const w = $derived(tcu?.wagesOfSin);
	const columns = [
		{ label: m.campaign_tcu_wages_dist_count() },
		{ label: m.campaign_tcu_wages_dist_plays(), align: 'right' as const }
	];
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={m.campaign_tcu_wages_empty()}
			rows={[
				{
					keepEmpty: w?.hereticsReleasedMax != null,
					stats: [
						{ value: w?.hereticsReleasedMax, label: m.campaign_tcu_wages_heretics() },
						{ value: w?.survivedWatcher, label: m.campaign_tcu_wages_watcher() }
					]
				}
			]}
		/>
		{#if w?.hereticsReleased.length}
			<div class="mt-4">
				<SectionLabel>{m.campaign_tcu_wages_dist_heading()}</SectionLabel>
				<WidgetTable {columns} rows={w.hereticsReleased} key={(d) => d.released}>
					{#snippet row(d)}
						<td class="{widgetTableCell} text-black tabular-nums dark:text-white">×{d.released}</td>
						<td class="{widgetTableCell} text-right">
							<CountWithBreakdown
								value="×{d.plays.total}"
								tally={d.plays}
								class="text-secondary-700 dark:text-secondary-300 font-semibold tabular-nums"
							/>
						</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
	{/snippet}
</ScenarioInfo>
