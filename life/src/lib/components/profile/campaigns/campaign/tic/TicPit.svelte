<!-- @component The Pit of Despair: the flashbacks recovered there. -->
<script lang="ts">
	import type { CampaignTic } from '$lib/campaign/campaigns/tic';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { ticMemoryTiles } from './tic-tiles';

	let { blob: tic, ctx }: CampaignWidgetProps<CampaignTic> = $props();

	const AMALGAM = '07053';
	const memTiles = $derived(ticMemoryTiles(tic, 'the_pit_of_despair'));
</script>

<ScenarioInfo {ctx} headerCards={[{ code: AMALGAM, tone: 'danger', objectTop: true }]}>
	{#snippet children()}
		{#if memTiles.some((t) => t.count > 0)}
			<div>
				<SectionLabel variant="heading" align="center">{m.campaign_tic_pit_memories_heading()}</SectionLabel>
				<LitTileGrid tiles={memTiles} colsClass="grid-cols-2 @3xl:grid-cols-4" />
			</div>
		{/if}
	{/snippet}
</ScenarioInfo>
