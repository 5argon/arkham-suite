<!--
@component
TFA flagship — "Yig's Fury", the campaign spine. Beyond the headline most/least/lifetime, it plots
EACH expedition's final Fury on a track, tinted by the breakpoint band it lands in: 0 (immunity /
Don't Tread on Me), 1–15 rising, 16–24 (Ichtaca refuses your plea in Shattered Aeons), 25+ (Bane of
Yig) — with the Depths of Yoth agenda that Fury seeds beneath each mark. The log holds only the final
total, an upper bound (Fury only rises). Built on IconTrack + StatNumbers.
-->
<script lang="ts">
	import { depthsAgendaFor, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import StatNumbers, { type Stat, type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import IconTrack, { type IconTrackItem } from '$lib/components/profile/_primitives/IconTrack.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();
	const v = $derived(tfa?.vengeance);
	const hasData = $derived(!!v && v.recorded > 0);

	function band(fury: number): { tint: string; name: string } {
		if (fury <= 0) return { tint: 'text-emerald-600 dark:text-emerald-400', name: m.campaign_tfa_fury_band_immunity() };
		if (fury <= 15) return { tint: 'text-primary-600 dark:text-primary-300', name: m.campaign_tfa_fury_band_rising() };
		if (fury <= 24) return { tint: 'text-amber-600 dark:text-amber-400', name: m.campaign_tfa_fury_band_refuse() };
		return { tint: 'text-error-600 dark:text-error-400', name: m.campaign_tfa_fury_band_bane() };
	}
	const agendaShort = (n: number) =>
		n === 0 ? m.campaign_tfa_vengeance_agenda_special() : m.campaign_tfa_vengeance_agenda({ n });

	interface FuryCell extends IconTrackItem {
		fury: number;
		sub: string;
	}
	// One cell per play that recorded Yig's Fury, oldest → newest.
	const cells = $derived<FuryCell[]>(
		(tfa?.runs ?? [])
			.filter((r) => r.yigsFury !== null)
			.sort((a, b) => (a.finishDate ?? 0) - (b.finishDate ?? 0))
			.map((r) => {
				const fury = r.yigsFury as number;
				const agenda = r.depthsAgenda ?? depthsAgendaFor(fury);
				const b = band(fury);
				return {
					fury,
					sub: agenda === 0 ? '★' : `A${agenda}`,
					tint: b.tint,
					tooltip: m.campaign_tfa_fury_cell_tip({ fury, band: b.name, agenda: agendaShort(agenda) })
				};
			})
	);

	const agendaStats = $derived<Stat[]>(
		v
			? Object.keys(v.depthsAgenda)
					.map(Number)
					.sort((a, b) => a - b)
					.map((n) => ({ value: v.depthsAgenda[n], label: agendaShort(n) }))
			: []
	);
	const rows = $derived<(Stat[] | StatGroup)[]>(
		v
			? [
					[
						{ value: v.max, label: m.campaign_tfa_vengeance_max() },
						{ value: v.min, label: m.campaign_tfa_vengeance_min() },
						{ value: v.lifetime, label: m.campaign_tfa_vengeance_lifetime() }
					],
					v.ichtacaRefused > 0
						? [{ value: v.ichtacaRefused, label: m.campaign_tfa_vengeance_refused() }]
						: [],
					agendaStats.length
						? { heading: m.campaign_tfa_vengeance_agenda_heading(), stats: agendaStats }
						: { stats: [] }
				]
			: []
	);
</script>

{#if hasData && v}
	<div class="space-y-4">
		<StatNumbers {rows} />
		{#if cells.length}
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
				<div class="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.7rem]">
					<span class="text-emerald-600 dark:text-emerald-400">{m.campaign_tfa_fury_legend_immunity()}</span>
					<span class="text-amber-600 dark:text-amber-400">{m.campaign_tfa_fury_legend_refuse()}</span>
					<span class="text-error-600 dark:text-error-400">{m.campaign_tfa_fury_legend_bane()}</span>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_vengeance_empty()}</p>
{/if}
