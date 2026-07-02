<!--
@component
NotZ bespoke capstone widget — "Core Set Only". NotZ is the tutorial bundled with the Core Set, so
this is the purist feat: clears completed using ONLY Core / Revised Core cards, investigator
included, with a non-parallel investigator — detected from the imported decks. Shows core-only clears
out of total clears (per difficulty) and a portrait wall of the investigators who managed it.
Deck-derived (`nonLog: 'full'`): the framework swaps in the non-log placeholder in log-only mode, so
this component is only rendered when non-log data is available.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { type CampaignNotz } from '$lib/campaign/campaigns/notz';
	import { getAllCards } from '$lib/card-data';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { notz }: { notz: CampaignNotz | null } = $props();

	const p = $derived(notz?.purist ?? null);
	const wins = $derived(notz?.wins ?? 0);
	const nameByCode = new Map(getAllCards().map((c) => [c.code, c.name]));

	const tiles = $derived<LitTile[]>(
		p
			? Object.entries(p.investigators)
					.sort((a, b) => b[1].total - a[1].total)
					.map(([code, tally]) => ({
						id: code,
						image: getCardImagePath(code, 'square'),
						label: nameByCode.get(code) ?? code,
						count: tally.total,
						detail: m.campaign_notz_purist_inv_detail({ count: String(tally.total) })
					}))
			: []
	);
	const rows = $derived<Stat[][]>(
		p
			? [
					[
						{ value: p.coreOnlyClears.total, label: m.campaign_notz_purist_clears(), byTier: p.coreOnlyClears.byTier },
						{ value: wins, label: m.campaign_notz_purist_total_clears() }
					]
				]
			: []
	);
	const hasData = $derived(wins > 0);
</script>

{#if hasData}
	<div class="space-y-4">
		<StatNumbers {rows} />
		{#if tiles.length}
			<LitTileGrid {tiles} layout="flex" objectTop />
		{/if}
		<p class="text-primary-500 text-center text-xs">{m.campaign_notz_purist_desc()}</p>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_notz_purist_empty()}</p>
{/if}
