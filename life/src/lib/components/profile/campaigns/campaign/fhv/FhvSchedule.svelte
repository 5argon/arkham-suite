<!-- @component The three days: areas surveyed, whether the two night scenarios were played, and the Day/Night slot each day scenario took. -->
<script lang="ts">
	import { FHV_AREAS, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { scenarioName } from '$lib/campaign/records/campaign-log-source';
	import { tallyDetail } from '$lib/campaign/utils/difficulty';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		LitTileGrid,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		WidgetTable,
		type LitTile
	} from '$lib/components/profile/_primitives';
	import { widgetTableCell } from '$lib/components/profile/_primitives/WidgetTable.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioNameCell from '../ScenarioNameCell.svelte';
	import { fhvAreaName, fhvSlotLabels } from './fhv-labels';

	let { blob: fhv, ctx }: CampaignWidgetProps<CampaignFhv> = $props();

	const schedule = $derived(fhv?.schedule);
	const areaTiles = $derived<LitTile[]>(
		FHV_AREAS.map((a) => {
			const t = fhv?.areas[a];
			return {
				id: a,
				label: fhvAreaName(a),
				count: t?.total ?? 0,
				detail: tallyDetail(
					t,
					() => m.campaign_fhv_area_not(),
					(times) => m.campaign_fhv_area_surveyed({ times })
				)
			};
		})
	);
	const surveyed = $derived(areaTiles.some((t) => t.count > 0));
	const nights = $derived(
		schedule
			? [
					{ tally: schedule.playedTwistedHollow, label: m.campaign_fhv_played_th() },
					{ tally: schedule.playedLongestNight, label: m.campaign_fhv_played_ln() },
					{ tally: schedule.skippedBothNights, label: m.campaign_fhv_skipped_both() }
				]
			: []
	);
	const slotRows = $derived(
		schedule && !ctx.logOnly
			? Object.entries(schedule.playedOn).map(([scenario, slots]) => ({
					scenario,
					slots: fhvSlotLabels(scenario, slots).join(' · ')
				}))
			: []
	);
	const columns = [
		{ label: m.campaign_fhv_matrix_col_scenario() },
		{ label: m.campaign_fhv_matrix_col_slot(), align: 'right' as const }
	];
</script>

{#if surveyed || nights.some((s) => s.tally.total > 0)}
	<div class="space-y-4">
		{#if surveyed}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.campaign_fhv_areas_heading()}</SectionLabel
				>
				<LitTileGrid tiles={areaTiles} colsClass="grid-cols-3 @3xl:grid-cols-7" />
			</div>
		{/if}
		<StatNumbers rows={[nights]} />
		{#if slotRows.length}
			<div>
				<SectionLabel variant="heading" align="center"
					>{m.campaign_fhv_matrix_heading()}</SectionLabel
				>
				<WidgetTable {columns} rows={slotRows} key={(r) => r.scenario}>
					{#snippet row(r)}
						<ScenarioNameCell scenarioId={r.scenario} name={scenarioName('fhv', r.scenario)} />
						<td class="{widgetTableCell} text-primary-500 text-right">{r.slots}</td>
					{/snippet}
				</WidgetTable>
			</div>
		{/if}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_fhv_schedule_empty()}</WidgetEmpty>
{/if}
