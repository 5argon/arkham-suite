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
	/**
	 * One column per flashback (a scenario has at most 4). Four 5rem tiles need 22.25rem, so on a
	 * phone those scenarios go two by two instead of shrinking their tiles under the count badge.
	 */
	const COLS = [
		'grid-cols-1',
		'grid-cols-1',
		'grid-cols-2',
		'grid-cols-3',
		'grid-cols-2 @min-[22rem]:grid-cols-4'
	];
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
		<!-- Each scenario's flashbacks in one row; the scenarios wrap side by side, tiles lined up along the bottom. -->
		<div class="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
			{#each groups as g (g.scenario)}
				<!-- LitTileGrid is a size container, so the group is sized to its 5rem tiles and 0.75rem gaps, and wide enough for its heading. -->
				<div
					class="max-w-full"
					style:width="max(9.5rem, calc({g.tiles.length} * 5rem + {g.tiles.length - 1} * 0.75rem))"
				>
					<SectionLabel variant="heading" align="center">{g.heading}</SectionLabel>
					<LitTileGrid tiles={g.tiles} colsClass={COLS[g.tiles.length]} />
				</div>
			{/each}
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tic_mem_empty()}</WidgetEmpty>
{/if}
