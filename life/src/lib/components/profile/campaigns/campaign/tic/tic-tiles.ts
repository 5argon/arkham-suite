import { TIC_MEMORIES, type CampaignTic } from '$lib/campaign/campaigns/tic';
import { logText } from '$lib/campaign/records/campaign-log-source';
import { tallyDetail } from '$lib/campaign/utils/difficulty';
import type { Tally } from '$lib/campaign/utils/tally';
import type { LitTile } from '$lib/components/profile/_primitives';
import * as m from '$lib/paraglide/messages.js';

/** A tile lit by a tally; its hover is `some(times)` with the per-difficulty split, or `zero()`. */
export function tallyTile(
	tile: Pick<LitTile, 'id' | 'code' | 'label'>,
	t: Tally | undefined,
	zero: () => string,
	some: (times: string) => string
): LitTile {
	return { ...tile, count: t?.total ?? 0, detail: tallyDetail(t, zero, some) };
}

/** The flashbacks recovered in one scenario, in book order. */
export function ticMemoryTiles(tic: CampaignTic | null, scenario: string): LitTile[] {
	return TIC_MEMORIES.filter((mem) => mem.scenario === scenario).map((mem) =>
		tallyTile(
			{ id: mem.id, label: logText('tic', `memories_recovered.${mem.id}`) },
			tic?.memories.each[mem.id],
			m.campaign_tic_mem_not_yet,
			(times) => m.campaign_tic_mem_recovered({ times })
		)
	);
}
