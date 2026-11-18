import { getCampaignLog } from '@5argon/arkham-campaign-data';

/** One scenario's campaign-data metadata (resolutions, verdicts, choices, reward kind, …). Only the
 *  family's own log is searched: a merged Return-to scenario needs `familyScenarioMeta`. */
export function scenarioMeta(family: string | null | undefined, scenarioId: string) {
	return getCampaignLog(family ?? '')?.db.scenarioMeta?.find((m) => m.id === scenarioId);
}

export type ResolutionVerdict = 'win' | 'loss' | 'neutral';

/** Resolution id → verdict; empty when none are curated. */
export function scenarioVerdicts(
	meta: ReturnType<typeof scenarioMeta>
): Record<string, ResolutionVerdict> {
	return meta?.resolutionOutcomes ?? {};
}
