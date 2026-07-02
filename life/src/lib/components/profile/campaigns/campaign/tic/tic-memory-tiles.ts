/**
 * tic-memory-tiles.ts — the shared flashback ("Memories Recovered") label map + lit-tile builder for
 * TIC, used by both the campaign-wide Memories widget and the Pit of Despair passport (where the spine
 * begins). The 15 memories have no card art, so each tile is a label lit by recovery count.
 */
import { TIC_MEMORIES, type CampaignTic } from '$lib/campaign/campaigns/tic';
import type { ResolutionTally } from '$lib/campaign/outcomes/resolution-coverage';
import { tallyDetail } from '$lib/campaign/utils/difficulty';
import type { LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
import * as m from '$lib/paraglide/messages.js';

/** Memory id → display label (the flashbacks have no card art). */
export const TIC_MEMORY_LABEL: Record<string, () => string> = {
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

/** "Recovered ×N" + the per-difficulty split when more than one tier contributed. */
export function ticMemoryDetail(t: ResolutionTally | undefined): string {
	return tallyDetail(t, m.campaign_tic_mem_not_yet, (times) => m.campaign_tic_mem_recovered({ times }));
}

/** The lit tiles for the flashbacks found in one scenario, in book order. */
export function ticMemoryTiles(tic: CampaignTic | null, scenario: string): LitTile[] {
	return TIC_MEMORIES.filter((mm) => mm.scenario === scenario).map((mm): LitTile => {
		const t = tic?.memories.recovered[mm.id];
		return {
			id: mm.id,
			image: '',
			label: (TIC_MEMORY_LABEL[mm.id] ?? (() => mm.id))(),
			count: t?.total ?? 0,
			detail: ticMemoryDetail(t)
		};
	});
}
