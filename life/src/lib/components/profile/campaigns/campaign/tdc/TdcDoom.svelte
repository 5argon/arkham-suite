<!-- @component The Doom of Arkham: how Cthulhu was faced, the ending reached, and which neighborhoods flooded. -->
<script lang="ts">
	import { TDC_FLOODED, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		WidgetNote,
		type LitTile,
		type StatGroup
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { tdcOutcomeGroups } from './tdc-outcomes';

	let { blob: tdc, ctx }: CampaignWidgetProps<CampaignTdc> = $props();

	const rows = $derived<StatGroup[]>(
		tdcOutcomeGroups(tdc, ctx.scenario ?? '').map((g) => ({
			heading: g.heading,
			stats: g.outcomes.map((o) => ({ value: o.plays, label: o.label }))
		}))
	);
	const floodTiles = $derived<LitTile[]>(
		TDC_FLOODED.map((id) => {
			const count = tdc?.flooded[id] ?? 0;
			return {
				id,
				label: logText('tdc', `flooded_neighborhoods.${id}`),
				count,
				detail: count
					? m.campaign_tdc_doom_flooded_count({ times: times(count) })
					: m.campaign_tdc_doom_flooded_dry()
			};
		})
	);
	const flooded = $derived(floodTiles.some((t) => t.count > 0));
	const hasData = $derived(flooded || rows.some((g) => g.stats.some((s) => s.value)));
</script>

<ScenarioInfo {ctx} showPlays empty={hasData ? null : m.campaign_tdc_doom_empty()}>
	{#snippet stats()}
		<StatNumbers {rows} />
		{#if flooded}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.campaign_tdc_doom_flooded_heading()}</SectionLabel
				>
				<LitTileGrid tiles={floodTiles} colsClass="grid-cols-4 @3xl:grid-cols-7" />
			</div>
		{/if}
		<WidgetNote>{m.campaign_tdc_doom_note()}</WidgetNote>
	{/snippet}
</ScenarioInfo>
