<!--
@component
TDC bespoke widget — "The Fold". At Expedition to R'lyeh the party commits to a direction
(`expedition_headed_west` / `_east`); the same five drowned sites are reached from either
approach, harder the long way round. This tallies which way your expeditions went. StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc }: { tdc: CampaignTdc | null } = $props();
	const f = $derived(tdc?.fold ?? null);
	const hasData = $derived(!!f && f.west + f.east > 0);
	const rows = $derived<Stat[][]>(
		hasData && f
			? [
					[
						{ value: f.west, label: m.campaign_tdc_fold_west() },
						{ value: f.east, label: m.campaign_tdc_fold_east() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdc_fold_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_fold_empty()}</p>
{/if}
