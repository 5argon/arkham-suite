<!--
@component
FHV bespoke widget — "The Second Evening", the dance. A portrait wall of the residents you
shared a dance with (lit by how many plays), plus Helen Peters when the Peters family was
reunited. A footer shows your best single-night spread (the "Dancing Queen" four), how often
Mother Rachel shared her doubts on the sidelines, and how many plays reached the dance.
Fully log-derived (the durable `*_shared_a_dance` flags — the raw dance counter isn't kept).
Built on LitTileGrid + StatNumbers.
-->
<script lang="ts">
	import { FHV_DANCERS, fhvVillagerName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { fhv }: { fhv: CampaignFhv | null } = $props();
	const d = $derived(fhv?.dance ?? null);

	const tiles = $derived<LitTile[]>(
		d
			? [
					...FHV_DANCERS.map((v): LitTile => {
						const n = d.partners[v] ?? 0;
						return {
							id: v,
							image: portraitUrl('fhv', v),
							label: fhvVillagerName(v),
							count: n,
							detail: n > 0 ? m.campaign_fhv_dance_partner({ times: times(n) }) : m.campaign_fhv_dance_never()
						};
					}),
					{
						id: 'helen',
						image: portraitUrl('fhv', 'helen'),
						label: m.campaign_fhv_dance_helen_name(),
						count: d.helen,
						detail: d.helen > 0 ? m.campaign_fhv_dance_partner({ times: times(d.helen) }) : m.campaign_fhv_dance_never()
					}
				]
			: []
	);
	const hasData = $derived(!!d && d.plays > 0);

	const footer = $derived<Stat[][]>(
		hasData && d
			? [
					[
						{ value: d.best, label: m.campaign_fhv_dance_best() },
						{ value: d.rachelDoubts, label: m.campaign_fhv_dance_rachel_doubts() },
						{ value: d.plays, label: m.campaign_fhv_dance_plays() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<div class="space-y-4">
		<LitTileGrid {tiles} layout="flex" objectTop />
		{#if d && d.best >= 4}
			<p class="text-secondary-600 dark:text-secondary-400 text-center text-xs font-semibold">
				{m.campaign_fhv_dance_queen()}
			</p>
		{/if}
		<StatNumbers rows={footer} />
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_fhv_dance_empty()}</p>
{/if}
