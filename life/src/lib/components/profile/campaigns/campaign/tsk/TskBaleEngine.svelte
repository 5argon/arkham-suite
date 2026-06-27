<!--
@component
TSK bespoke widget — The Bale Engine. A no-scenario Scarlet Key: it's won when Tuwile Masai joins
the cell, so it's fully log-derived (the "Tuwile Masai is on your side" note). He trusts you outright
at Infernal Machinery (Nairobi) when you've gathered enough Coterie allies; otherwise he flees to
Bermuda, where The Great Work gives a second chance to win him back. Numbers come from the shared
`tsk` aggregate (`baleEngine`); the Obtained count hovers to its per-difficulty breakdown.
-->
<script lang="ts">
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import { BALE_ENGINE_CARD } from '$lib/campaign/campaigns/tsk-solver';
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk-profile';
	import * as m from '$lib/paraglide/messages.js';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	const b = $derived(tsk?.baleEngine ?? null);
	const anyData = $derived(!!b && b.obtained.total + b.fled + b.lost > 0);
	const rows = $derived<Stat[][]>(
		b
			? [
					[
						{ value: b.obtained.total, label: m.campaign_tsk_bale_obtained(), byTier: b.obtained.byTier },
						{ value: b.nairobi, label: m.campaign_tsk_bale_nairobi() },
						{ value: b.bermuda, label: m.campaign_tsk_bale_bermuda() },
						{ value: b.fled, label: m.campaign_tsk_bale_fled() },
						{ value: b.lost, label: m.campaign_tsk_bale_lost() }
					]
				]
			: []
	);
</script>

{#if anyData}
	<div class="flex items-start gap-4">
		<CardThumb code={BALE_ENGINE_CARD} alt="The Bale Engine" objectTop />
		<div class="flex-1"><StatNumbers {rows} /></div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_bale_empty()}</p>
{/if}
