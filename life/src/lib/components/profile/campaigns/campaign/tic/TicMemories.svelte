<!-- @component The 15 flashbacks, grouped by the scenario they are recovered in and lit by how often. -->
<script lang="ts">
	import { TIC_MEMORIES, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import { scenarioName } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		WidgetEmpty
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { ticMemoryTiles } from './tic-tiles';

	let { blob: tic }: CampaignWidgetProps<CampaignTic> = $props();

	const SCENARIOS = [...new Set(TIC_MEMORIES.map((mem) => mem.scenario))];
	const groups = $derived(
		SCENARIOS.map((scenario) => ({
			scenario,
			heading: scenarioName('tic', scenario),
			tiles: ticMemoryTiles(tic, scenario)
		}))
	);
</script>

{#if tic?.memories.distinct}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				[
					{
						value: `${tic.memories.distinct} / ${TIC_MEMORIES.length}`,
						label: m.campaign_tic_mem_distinct()
					},
					{ tally: tic.memories.all, label: m.campaign_tic_mem_all_label() }
				]
			]}
		/>
		{#each groups as g (g.scenario)}
			<div>
				<SectionLabel variant="heading" align="center">{g.heading}</SectionLabel>
				<LitTileGrid tiles={g.tiles} colsClass="grid-cols-4" />
			</div>
		{/each}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tic_mem_empty()}</WidgetEmpty>
{/if}
