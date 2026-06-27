<!--
@component
TSK bespoke widget — The Ruinous Chime. A no-scenario Scarlet Key won on Dr. Dewi Irawan's quest, a
race against time: you meet her in Perth (Paranatural Selection), chase her to New Guinea, and win
the Chime only by reaching Manokwari (Metamorphosis) before she vanishes from existence. Fully
log-derived (the "Dr. Irawan joined the cell" note). Numbers come from the shared `tsk` aggregate
(`ruinousChime`); the Obtained count hovers to its per-difficulty breakdown.
-->
<script lang="ts">
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import { RUINOUS_CHIME_CARD } from '$lib/campaign/campaigns/tsk-solver';
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk-profile';
	import * as m from '$lib/paraglide/messages.js';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	const c = $derived(tsk?.ruinousChime ?? null);
	const anyData = $derived(!!c && c.met + c.obtained.total + c.vanished > 0);
	const rows = $derived<Stat[][]>(
		c
			? [
					[
						{ value: c.obtained.total, label: m.campaign_tsk_chime_obtained(), byTier: c.obtained.byTier },
						{ value: c.met, label: m.campaign_tsk_chime_met() },
						{ value: c.newGuinea, label: m.campaign_tsk_chime_new_guinea() },
						{ value: c.vanished, label: m.campaign_tsk_chime_vanished() }
					]
				]
			: []
	);
</script>

{#if anyData}
	<div class="flex items-start gap-4">
		<CardThumb code={RUINOUS_CHIME_CARD} alt="The Ruinous Chime" objectTop />
		<div class="flex-1"><StatNumbers {rows} /></div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_chime_empty()}</p>
{/if}
