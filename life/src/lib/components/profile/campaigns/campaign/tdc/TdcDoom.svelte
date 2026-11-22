<!-- @component The Doom of Arkham: how the final stand was faced, each ending and the resolution it is, and which neighborhoods flooded. -->
<script lang="ts">
	import { TDC_FLOODED, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import type { EndingKind } from '$lib/campaign/outcomes/clear-status';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		WidgetNote,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import EndingsGrid from '../EndingsGrid.svelte';
	import ScenarioInfo from '../ScenarioInfo.svelte';

	let { blob: tdc, ctx }: CampaignWidgetProps<CampaignTdc> = $props();

	/** Cthulhu (Ancient Evil), the enemy of The Doom of Arkham: Part II. */
	const CTHULHU_CODE = '11701';

	const doom = $derived(tdc?.scenarios.the_doom_of_arkham ?? {});
	const plays = (key: string) => doom[`campaign_notes.${key}`] ?? 0;
	/** The Doom of Arkham: Part II's resolutions. */
	const endings = $derived(
		[
			{
				kind: 'best' as EndingKind,
				label: m.campaign_tdc_ending_banished(),
				resolution: 'R2',
				note: 'cthulhu_was_banished'
			},
			{
				kind: 'win' as EndingKind,
				label: m.campaign_tdc_ending_driven_away(),
				resolution: 'R1',
				note: 'cthulhu_was_driven_away'
			},
			{
				kind: 'special' as EndingKind,
				label: m.campaign_tdc_ending_ruins(),
				resolution: 'R3',
				note: 'cthulhu_was_banished_but_arkham_was_destroyed'
			},
			{
				kind: 'loss' as EndingKind,
				label: m.campaign_tdc_ending_annihilated(),
				resolution: 'no_resolution',
				note: 'cthulhu_annihilated_the_city_of_arkham'
			}
		].map((e) => ({ ...e, tally: { total: plays(e.note), byTier: {} } }))
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
	const stand = $derived(plays('stood_together') + plays('your_allies_have_a_plan') > 0);
	const hasData = $derived(flooded || stand || endings.some((e) => e.tally.total));
</script>

<ScenarioInfo
	{ctx}
	showPlays
	headerCards={[{ code: CTHULHU_CODE, tone: 'danger', objectTop: true }]}
	empty={hasData ? null : m.campaign_tdc_doom_empty()}
>
	{#snippet stats()}
		<StatNumbers
			rows={[
				{
					heading: m.campaign_tdc_doom_approach_heading(),
					stats: [
						{ value: plays('stood_together'), label: m.campaign_tdc_doom_stood_together() },
						{ value: plays('your_allies_have_a_plan'), label: m.campaign_tdc_doom_allies_plan() }
					]
				}
			]}
		/>
		<EndingsGrid {endings} heading={m.campaign_tdc_doom_endings_heading()} />
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
