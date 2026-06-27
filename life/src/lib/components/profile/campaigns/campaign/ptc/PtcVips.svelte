<!--
@component
PtC bespoke widget — "VIPs". The Last King's 5 dinner-party guests recur across the
campaign: an interviewed VIP later returns as an enemy that can be slain into the victory
display. Shown as a fixed 5×2 portrait grid (PtcVipGrid): row 1 the guest you interviewed,
row 2 the enemy you slew — each VIP greyed out until you've done it, across EVERY scenario.
-->
<script lang="ts">
	import { type CampaignPtc, VIP_ROSTER } from '$lib/campaign/campaigns/ptc';
	import PtcVipGrid from './PtcVipGrid.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc }: { ptc: CampaignPtc | null } = $props();

	// Interviewed is keyed by the guest (asset) code; slain by the enemy code — both aligned
	// to VIP_ROSTER so the grid's columns line up VIP-for-VIP.
	const interviewedCounts = $derived(VIP_ROSTER.map((v) => ptc?.vipsInterviewed[v.asset]?.total ?? 0));
	const slainCounts = $derived(VIP_ROSTER.map((v) => ptc?.vipsSlain[v.enemy]?.total ?? 0));
	const interviewedByTier = $derived(VIP_ROSTER.map((v) => ptc?.vipsInterviewed[v.asset]?.byTier ?? {}));
	const slainByTier = $derived(VIP_ROSTER.map((v) => ptc?.vipsSlain[v.enemy]?.byTier ?? {}));
	const hasData = $derived([...interviewedCounts, ...slainCounts].some((n) => n > 0));
</script>

{#if hasData}
	<PtcVipGrid
		{interviewedCounts}
		{slainCounts}
		{interviewedByTier}
		{slainByTier}
		slainRowLabel={m.campaign_ptc_vips_slain_row()}
	/>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_ptc_vips_empty()}</p>
{/if}
