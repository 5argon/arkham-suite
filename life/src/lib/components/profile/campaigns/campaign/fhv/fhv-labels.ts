import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { itemLabel } from '$lib/campaign/records/campaign-log-source';
import { choicesForScenario } from '$lib/campaign/stats/scenario-extras';

const log = getCampaignLog('fhv');

export function fhvAreaName(id: string): string {
	return log ? itemLabel(log, id) : id;
}

/** An Extra choice option as the editor words it, by `"<scenario>.<choice>"`. */
export function fhvOptionLabel(choice: string, value: string): string {
	return log?.en.scenarioChoices?.[choice]?.options?.[value] ?? value;
}

/** The Day/Night slots a scenario was recorded on, in clock order. */
export function fhvSlotLabels(scenario: string, slots: Record<string, number>): string[] {
	const playedOn = log
		? choicesForScenario(log, scenario).find((c) => c.id === 'played_on')
		: undefined;
	return (playedOn?.options ?? []).filter((o) => slots[o.value]).map((o) => o.label);
}
