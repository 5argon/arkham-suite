<!--
@component
TSK bespoke widget — The Ruinous Chime. A no-scenario Scarlet Key won on Dr. Dewi Irawan's quest, a
race against time: you meet her in Perth (Paranatural Selection), chase her to New Guinea, and win
the Chime only by reaching Manokwari (Metamorphosis) before she vanishes from existence. Fully
log-derived (the "Dr. Irawan joined the cell" note). Numbers come from the shared `tsk` aggregate
(`ruinousChime`); the Obtained count hovers to its per-difficulty breakdown.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { RUINOUS_CHIME_CARD } from '$lib/campaign/tsk-solver';
	import type { CampaignTsk } from '$lib/campaign/tsk-profile';
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
	const img = getCardImagePath(RUINOUS_CHIME_CARD, 'square');
</script>

{#if anyData}
	<div class="flex items-start gap-4">
		<img
			src={img}
			alt="The Ruinous Chime"
			class="border-primary-300 dark:border-primary-600 h-16 w-16 shrink-0 rounded border object-cover object-top shadow"
			loading="lazy"
		/>
		<div class="flex-1"><StatNumbers {rows} /></div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_chime_empty()}</p>
{/if}
