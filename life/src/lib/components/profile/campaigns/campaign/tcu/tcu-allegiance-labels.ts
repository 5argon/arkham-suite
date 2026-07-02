/**
 * tcu-allegiance-labels.ts — the shared icon + name resolution for TCU's five Lodge/Coven
 * allegiance decision points, used by both the allegiance chain and its per-decision source
 * table. The two interludes (The Price of Progress · The Inner Circle) carry no encounter set,
 * so they borrow their parent scenario's icon and aren't in campaign-data's scenarioNames.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import type { EncounterSet } from '@5argon/arkham-kohaku';
import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
import * as m from '$lib/paraglide/messages.js';

/** Interludes carry no encounter set — borrow the parent scenario's icon. */
const ICON_SCENARIO: Record<string, string> = {
	the_price_of_progress: 'at_deaths_doorstep',
	the_inner_circle: 'for_the_greater_good'
};

/** The encounter-set icon for an allegiance decision point (interludes borrow the parent scenario). */
export function allegianceIconSet(scenario: string): EncounterSet | null {
	return scenarioRepresentativeSet(ICON_SCENARIO[scenario] ?? scenario);
}

/** The 2 interludes aren't in campaign-data scenarioNames. */
const INTERLUDE: Record<string, () => string> = {
	the_price_of_progress: m.campaign_tcu_alleg_scen_price,
	the_inner_circle: m.campaign_tcu_alleg_scen_inner
};

/** Display name for an allegiance decision point. */
export function allegianceScenName(id: string): string {
	return getCampaignLog('tcu')?.en.scenarioNames?.[id] ?? INTERLUDE[id]?.() ?? id;
}
