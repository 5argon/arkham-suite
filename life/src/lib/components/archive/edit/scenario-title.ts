import type { CampaignLog } from '@5argon/arkham-campaign-data';
import { deslugScenario } from '$lib/campaign/stats/extra-imports';

/** A scenario's campaign-data name, or its de-slugged id when it has none. */
export function scenarioTitle(log: CampaignLog, id: string): string {
	return log.en.scenarioNames?.[id] ?? deslugScenario(id);
}
