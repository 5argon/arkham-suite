<!--
@component
TIC bespoke widget — "Memories Recovered". The 15 flashbacks scattered across the campaign
(the "You Wake Up In A Room…" achievement = all 15), grouped by the scenario they're found in
and lit by recovery (the memories have no card art). A summary up top counts distinct memories
seen and the plays that recovered the whole set (with the per-difficulty hover). Built on
LitTileGrid + StatNumbers.
-->
<script lang="ts">
	import { type CampaignTic } from '$lib/campaign/campaigns/tic';
	import { ticMemoryTiles } from './tic-memory-tiles';
	import LitTileGrid from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tic }: { tic: CampaignTic | null } = $props();

	// The 15 flashbacks grouped by the scenario they're found in (display order).
	const GROUPS: { scenario: string; heading: () => string }[] = [
		{ scenario: 'the_pit_of_despair', heading: m.campaign_tic_mem_grp_pit },
		{ scenario: 'in_too_deep', heading: m.campaign_tic_mem_grp_itd },
		{ scenario: 'devil_reef', heading: m.campaign_tic_mem_grp_dr },
		{ scenario: 'a_light_in_the_fog', heading: m.campaign_tic_mem_grp_lif },
		{ scenario: 'into_the_maelstrom', heading: m.campaign_tic_mem_grp_itm },
		{ scenario: 'tic_epilogue', heading: m.campaign_tic_mem_grp_epilogue }
	];

	const groups = $derived(
		GROUPS.map((g) => ({ heading: g.heading(), tiles: ticMemoryTiles(tic, g.scenario) }))
	);
	const summary = $derived<Stat[][]>(
		tic
			? [
					[
						{ value: `${tic.memories.everRecovered} / 15`, label: m.campaign_tic_mem_distinct() },
						...(tic.memories.allFifteen.total > 0
							? [
									{
										value: tic.memories.allFifteen.total,
										label: m.campaign_tic_mem_all_label(),
										byTier: tic.memories.allFifteen.byTier
									}
								]
							: [])
					]
				]
			: []
	);
	const hasData = $derived(!!tic && tic.memories.everRecovered > 0);
</script>

{#if hasData && tic}
	<div class="space-y-4">
		<StatNumbers rows={summary} />
		{#each groups as g (g.heading)}
			<div>
				<SectionLabel variant="heading" align="center">{g.heading}</SectionLabel>
				<LitTileGrid tiles={g.tiles} colsClass="grid-cols-4" />
			</div>
		{/each}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tic_mem_empty()}</p>
{/if}
