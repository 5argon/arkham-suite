<!--
@component
FHV bespoke widget — "Day/Night Schedule" (the replay hook). The log-derived backbone (the 7
areas surveyed + whether the two canon-night scenarios were played/defied) always shows; the
full per-scenario Day/Night slot matrix is Extra-tab data (`<scenario>.played_on`), so this is
`nonLog: 'partial'` — under Log-only mode it drops the matrix and keeps the backbone.
-->
<script lang="ts">
	import { FHV_AREAS, FHV_SLOTS, fhvText, fhvScenarioName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { fhv, logOnly = false }: { fhv: CampaignFhv | null; logOnly?: boolean } = $props();
	const s = $derived(fhv?.schedule);

	const areaTiles = $derived<LitTile[]>(
		fhv
			? FHV_AREAS.map((a): LitTile => {
					const c = fhv.areas[a] ?? 0;
					return {
						id: a,
						image: '',
						label: fhvText(`areas_surveyed.${a}`),
						count: c,
						detail: c > 0 ? m.campaign_fhv_area_surveyed() : m.campaign_fhv_area_not()
					};
				})
			: []
	);
	const nightRows = $derived<Stat[][]>(
		s
			? [
					[
						{ value: s.playedTwistedHollow, label: m.campaign_fhv_played_th() },
						{ value: s.playedLongestNight, label: m.campaign_fhv_played_ln() },
						{ value: s.skippedBothNights, label: m.campaign_fhv_skipped_both() }
					]
				]
			: []
	);
	const SLOT: Record<string, string> = {
		day_1_day: 'D1 Day', day_1_night: 'D1 Night', day_2_day: 'D2 Day',
		day_2_night: 'D2 Night', day_3_day: 'D3 Day', day_3_night: 'D3 Night'
	};
	// Extra-tab Day/Night matrix (hidden under Log-only): scenario → its recorded slot(s).
	const matrix = $derived(
		!logOnly && s
			? Object.entries(s.playedOn).map(([sc, slots]) => ({
					scenario: fhvScenarioName(sc),
					slots: FHV_SLOTS.filter((sl) => (slots[sl] ?? 0) > 0).map((sl) => SLOT[sl] ?? sl)
				}))
			: []
	);
	const surveyedAny = $derived(areaTiles.some((t) => t.count > 0));
	const nightsAny = $derived(!!s && s.playedTwistedHollow + s.playedLongestNight + s.skippedBothNights > 0);
	const hasData = $derived(surveyedAny || nightsAny);
</script>

{#if hasData}
	{#if surveyedAny}
		<p class="text-primary-500 mb-1.5 text-center text-xs font-semibold tracking-wide uppercase">
			{m.campaign_fhv_areas_heading()}
		</p>
		<LitTileGrid tiles={areaTiles} colsClass="grid-cols-3 @3xl:grid-cols-7" />
	{/if}
	{#if nightsAny}
		<div class="mt-3"><StatNumbers rows={nightRows} /></div>
	{/if}
	{#if matrix.length}
		<p class="text-primary-500 mt-3 mb-1.5 text-center text-xs font-semibold tracking-wide uppercase">
			{m.campaign_fhv_matrix_heading()}
		</p>
		<div class="space-y-1">
			{#each matrix as row (row.scenario)}
				<div class="flex justify-between gap-3 text-sm">
					<span class="text-black dark:text-white">{row.scenario}</span>
					<span class="text-primary-500">{row.slots.join(' · ')}</span>
				</div>
			{/each}
		</div>
	{/if}
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_fhv_schedule_empty()}</p>
{/if}
