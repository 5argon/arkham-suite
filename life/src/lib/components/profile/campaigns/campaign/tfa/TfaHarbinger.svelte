<!--
@component
TFA bespoke widget — "The Harbinger of Valusia". The recurring enemy carries its
damage across the campaign; this shows how wounded you left it (its remaining health
range across plays). A per-scenario trajectory would need Extra-tab counters (see the
plan); this is the log-derived final-health view. Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();
	const h = $derived(tfa?.harbinger);
	const hasData = $derived(!!h && h.recorded > 0);
	const rows = $derived<Stat[][]>(
		hasData && h
			? [
					[
						{ value: h.min, label: m.campaign_tfa_harbinger_min() },
						{ value: h.max, label: m.campaign_tfa_harbinger_max() }
					]
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_harbinger_empty()}</p>
{/if}
