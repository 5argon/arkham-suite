<!-- @component Yig's Fury: its extremes, each expedition's final Fury by breakpoint, and the Depths of Yoth agenda it seeds. -->
<script lang="ts">
	import type { CampaignTfa, TfaFuryBand } from '$lib/campaign/campaigns/tfa';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		IconTrack,
		SectionLabel,
		StatNumbers,
		WidgetEmpty,
		WidgetNote
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { depthsAgendaLabel, depthsAgendaStats } from './tfa-shared';

	let { blob: tfa }: CampaignWidgetProps<CampaignTfa> = $props();

	const BAND: Record<TfaFuryBand, { tint: string; name: () => string }> = {
		immunity: { tint: 'text-emerald-600 dark:text-emerald-400', name: m.campaign_tfa_fury_band_immunity },
		rising: { tint: 'text-primary-600 dark:text-primary-300', name: m.campaign_tfa_fury_band_rising },
		refuse: { tint: 'text-amber-600 dark:text-amber-400', name: m.campaign_tfa_fury_band_refuse },
		bane: { tint: 'text-error-600 dark:text-error-400', name: m.campaign_tfa_fury_band_bane }
	};
	const LEGEND: { band: TfaFuryBand; label: () => string }[] = [
		{ band: 'immunity', label: m.campaign_tfa_fury_legend_immunity },
		{ band: 'refuse', label: m.campaign_tfa_fury_legend_refuse },
		{ band: 'bane', label: m.campaign_tfa_fury_legend_bane }
	];

	const v = $derived(tfa?.vengeance);
	const cells = $derived(
		(v?.runs ?? []).map((r) => ({
			fury: r.fury,
			sub: r.depthsAgenda === 0 ? '★' : `A${r.depthsAgenda}`,
			tint: BAND[r.band].tint,
			tooltip: m.campaign_tfa_fury_cell_tip({
				fury: r.fury,
				band: BAND[r.band].name(),
				agenda: depthsAgendaLabel(r.depthsAgenda)
			})
		}))
	);
</script>

{#if v?.runs.length}
	<div class="space-y-4">
		<StatNumbers
			rows={[
				{
					keepEmpty: true,
					stats: [
						{ value: v.max, label: m.campaign_tfa_vengeance_max() },
						{ value: v.min, label: m.campaign_tfa_vengeance_min() },
						{ value: v.lifetime, label: m.campaign_tfa_vengeance_lifetime() }
					]
				},
				[{ value: v.ichtacaRefused, label: m.campaign_tfa_vengeance_refused() }],
				{ heading: m.campaign_tfa_vengeance_agenda_heading(), stats: depthsAgendaStats(tfa) }
			]}
		/>
		<div>
			<SectionLabel align="center">{m.campaign_tfa_fury_meter_label()}</SectionLabel>
			<div class="flex justify-center">
				<IconTrack items={cells} size="1.4rem" cellWidth="2.4em" wrap>
					{#snippet icon(it)}
						<span class="text-base font-bold tabular-nums">{it.fury}</span>
					{/snippet}
					{#snippet sub(it)}
						<span class="text-[0.6rem] tabular-nums">{it.sub}</span>
					{/snippet}
				</IconTrack>
			</div>
			<WidgetNote>
				{#each LEGEND as l (l.band)}
					<span class="mx-2 inline-block {BAND[l.band].tint}">{l.label()}</span>
				{/each}
			</WidgetNote>
		</div>
	</div>
{:else}
	<WidgetEmpty>{m.campaign_tfa_vengeance_empty()}</WidgetEmpty>
{/if}
