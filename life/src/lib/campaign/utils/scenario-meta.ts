/**
 * scenario-meta.ts — look up one scenario's campaign-data metadata (resolutions, resolutionOutcomes,
 * choices, maxXp, victoryDisplay, …) by family + scenario id, so widgets don't repeat the
 * `getCampaignLog(family).db.scenarioMeta.find(id)` chain.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';

/** The metadata for one scenario in a family, or `undefined` when the family / scenario isn't found. */
export function scenarioMeta(family: string | null | undefined, scenarioId: string) {
	return getCampaignLog(family ?? '')?.db.scenarioMeta?.find((m) => m.id === scenarioId);
}
