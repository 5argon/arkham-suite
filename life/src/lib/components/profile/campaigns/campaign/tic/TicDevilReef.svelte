<!-- @component Devil Reef: the Terror's fate, the rising tide, and the equipment brought to the lighthouse. -->
<script lang="ts">
	import { TIC_EQUIPMENT, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { tallyTile } from './tic-tiles';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const d = $derived(tic?.devilReef);
	const tiles = $derived(
		TIC_EQUIPMENT.map((eq) =>
			tallyTile(
				{ id: eq.id, code: eq.code },
				tic?.equipment.each[eq.id],
				m.campaign_tic_equip_not_secured,
				(times) => m.campaign_tic_equip_secured({ times })
			)
		)
	);
	const secured = $derived(tiles.some((t) => t.count > 0));
</script>

<ScenarioInfo {ctx}>
	{#snippet stats()}
		<StatNumbers
			empty={secured ? undefined : m.campaign_tic_dr_empty()}
			rows={[
				[
					{ tally: d?.terrorDead, label: m.campaign_tic_dr_terror_dead() },
					{ tally: d?.terrorAlive, label: m.campaign_tic_dr_terror_alive() },
					{ tally: d?.tideGrown, label: m.campaign_tic_dr_tide() }
				]
			]}
		/>
	{/snippet}
	{#snippet children()}
		{#if secured}
			<div class="space-y-2">
				<SectionLabel variant="heading" align="center">{m.campaign_tic_equip_heading()}</SectionLabel>
				<LitTileGrid {tiles} layout="flex" objectTop />
				<StatNumbers
					rows={[[{ tally: tic?.equipment.all, label: m.campaign_tic_equip_full_build_label() }]]}
				/>
			</div>
		{/if}
	{/snippet}
</ScenarioInfo>
