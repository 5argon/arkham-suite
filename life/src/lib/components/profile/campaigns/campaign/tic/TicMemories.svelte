<!--
@component
TIC bespoke widget — "Memories Recovered". The 15 flashbacks scattered across the campaign
(the "You Wake Up In A Room…" achievement = all 15), as labelled tiles (the memories have no
card art) lit by recovery, grouped by scenario. Built on LitTileGrid.
-->
<script lang="ts">
	import { TIC_MEMORIES, type CampaignTic } from '$lib/campaign/campaigns/tic';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';

	let { tic }: { tic: CampaignTic | null } = $props();

	const LABEL: Record<string, () => string> = {
		meeting_with_thomas_dawson: m.campaign_tic_mem_dawson,
		battle_with_a_horrifying_devil: m.campaign_tic_mem_devil,
		decision_to_stick_together: m.campaign_tic_mem_stick_together,
		encounter_with_a_secret_cult: m.campaign_tic_mem_cult,
		a_deal_with_joe_sargent: m.campaign_tic_mem_sargent,
		a_followed_lead: m.campaign_tic_mem_lead,
		an_intervention: m.campaign_tic_mem_intervention,
		a_jailbreak: m.campaign_tic_mem_jailbreak,
		discovery_of_a_strange_idol: m.campaign_tic_mem_idol,
		discovery_of_an_unholy_mantle: m.campaign_tic_mem_mantle,
		discovery_of_a_mystical_relic: m.campaign_tic_mem_relic,
		conversation_with_mr_moore: m.campaign_tic_mem_moore,
		lifecycle_of_a_deep_one: m.campaign_tic_mem_lifecycle,
		stinging_betrayal: m.campaign_tic_mem_betrayal,
		horrific_truth: m.campaign_tic_mem_truth
	};

	const tiles = $derived<LitTile[]>(
		tic
			? TIC_MEMORIES.map((mm): LitTile => {
					const c = tic.memories.recovered[mm.id] ?? 0;
					return {
						id: mm.id,
						image: '',
						label: (LABEL[mm.id] ?? (() => mm.id))(),
						count: c,
						detail: c > 0 ? m.campaign_tic_mem_recovered({ times: times(c) }) : m.campaign_tic_mem_not_yet()
					};
				})
			: []
	);
	const hasData = $derived(!!tic && tic.memories.everRecovered > 0);
</script>

{#if hasData && tic}
	<p class="text-primary-500 mb-3 text-center text-sm">
		{m.campaign_tic_mem_headline({ count: tic.memories.everRecovered })}{#if tic.memories.allFifteen > 0}
			· {m.campaign_tic_mem_all({ count: tic.memories.allFifteen })}{/if}
	</p>
	<LitTileGrid {tiles} colsClass="grid-cols-3 @3xl:grid-cols-5" />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tic_mem_empty()}</p>
{/if}
