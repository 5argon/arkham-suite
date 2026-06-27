<!--
@component
tdeb bespoke widget — "Steps of the Bridge". The running count toward Atlach-Nacha's web:
the most accrued, the average, and the Weaver-of-the-Cosmos doom THRESHOLD tier each play
landed in (0–2 → 0 doom · 3–5 → 1 · 6–8 → 2 · 9–11 → 3 · 12+ → 4). Built on StatNumbers.
-->
<script lang="ts">
	import type { CampaignTdeb } from '$lib/campaign/campaigns/tdeb';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdeb }: { tdeb: CampaignTdeb | null } = $props();
	const s = $derived(tdeb?.stepsOfTheBridge);
	const hasData = $derived(!!s && s.plays > 0);
	const avg = $derived(s && s.plays > 0 ? Math.round((s.total / s.plays) * 10) / 10 : null);
	const TIER_LABEL = [
		m.campaign_tdeb_steps_tier0,
		m.campaign_tdeb_steps_tier1,
		m.campaign_tdeb_steps_tier2,
		m.campaign_tdeb_steps_tier3,
		m.campaign_tdeb_steps_tier4
	];
	const rows = $derived<Stat[][]>(
		hasData && s
			? [
					[
						{ value: s.max, label: m.campaign_tdeb_steps_max() },
						{ value: avg, label: m.campaign_tdeb_steps_avg() }
					],
					[0, 1, 2, 3, 4].map((t) => ({ value: s.tiers[t] ?? 0, label: TIER_LABEL[t]() }))
				]
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
	<p class="text-primary-500 mt-3 text-center text-xs">{m.campaign_tdeb_steps_note()}</p>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdeb_steps_empty()}</p>
{/if}
