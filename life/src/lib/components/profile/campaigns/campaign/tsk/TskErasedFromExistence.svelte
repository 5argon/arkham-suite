<!--
@component
TSK bespoke widget — Erased From Existence. In Dancing Mad and On Thin Ice the cell can exile a
unique card "from existence", recorded as a card-level campaign-log note (`erased_from_existence_*`).
Because it's a log fact (not deck data) it's shared across the cell, regardless of who bore the card.
Shows the 10 most recently erased unique cards — each a CardLine (via the shared CardLineList), with
the finish date of the campaign it happened in as the trailing column. Fed by the `tsk` aggregate.
-->
<script lang="ts">
	import CardLineList from '$lib/components/profile/_primitives/CardLineList.svelte';
	import FinishDate from '$lib/components/profile/_primitives/FinishDate.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk-profile';

	let { tsk }: { tsk: CampaignTsk | null } = $props();

	// The aggregate already caps the list at 10, newest first; CardLineList drops any code that
	// doesn't resolve to a card.
	const erased = $derived(tsk?.erasedFromExistence ?? []);
</script>

{#if erased.length}
	<div class="overflow-x-auto">
		<CardLineList items={erased}>
			{#snippet trailing(it)}<FinishDate ms={it.finishDate} />{/snippet}
		</CardLineList>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tsk_erased_empty()}</p>
{/if}
