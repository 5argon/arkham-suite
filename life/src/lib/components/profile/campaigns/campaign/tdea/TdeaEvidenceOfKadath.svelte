<!--
@component
tdea bespoke widget — "Evidence of Kadath". The running count toward the Onyx Castle: the
most uncovered, plays that found all 10 Signs (the "Losing My Religion" achievement), and the
average. Its finale impact is LINEAR, not tiered — the Where the Gods Dwell scenario card
removes 1 clue from the Onyx Gates per tally. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdea } from '$lib/campaign/campaigns/tdea';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdea }: { tdea: CampaignTdea | null } = $props();
	const e = $derived(tdea?.evidenceOfKadath);
	const hasData = $derived(!!e && e.plays > 0);
	const avg = $derived(e && e.plays > 0 ? Math.round((e.total / e.plays) * 10) / 10 : null);
	const rows = $derived<Stat[][]>(
		hasData && e
			? [
					[
						{ value: e.max, label: m.campaign_tdea_evidence_max() },
						{ value: avg, label: m.campaign_tdea_evidence_avg() },
						{ value: e.allSigns, label: m.campaign_tdea_evidence_all_signs() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdea_evidence_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdea_evidence_empty()}</p>
{/if}
