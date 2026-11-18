/**
 * Scenario lists and icons for the Standalone Archive pickers and profile. campaign-data's
 * `playableScenarios()` also holds framing preludes (FHV's "Welcome to Hemlock Vale"), replay
 * variants (EotE's Fatal Mirage ×3) and, for Return-to campaigns, both the base scenario and its
 * `return_to_` twin; kohaku's `Scenario` enum is the set of real scenarios.
 */
import {
	Scenario,
	StandaloneScenario,
	getScenarioData,
	standaloneScenarioRepresentativeSet,
	type EncounterSet,
} from '@5argon/arkham-kohaku';
import { getCampaignLog, playableScenarios } from '@5argon/arkham-campaign-data';

const KOHAKU_SCENARIOS = new Set<string>(Object.values(Scenario));
const STANDALONE_SCENARIOS = new Set<string>(Object.values(StandaloneScenario));

/** The encounter set whose icon stands for a campaign or standalone scenario. */
export function scenarioRepresentativeSet(id: string): EncounterSet | null {
	if (KOHAKU_SCENARIOS.has(id)) {
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}
	if (STANDALONE_SCENARIOS.has(id)) {
		return standaloneScenarioRepresentativeSet[id as StandaloneScenario] ?? null;
	}
	return null;
}

export interface PlayableScenarioOption {
	scenario: string;
	name: string;
}

/** A campaign's real scenarios in book order, each Return-to pair collapsed onto its `return_to_`
 *  variant (the one a Return-to campaign plays). */
export function campaignPlayableScenarios(campaignCode: string): PlayableScenarioOption[] {
	const log = getCampaignLog(campaignCode);
	if (!log) return [];
	const ids = playableScenarios(log).filter((id) => KOHAKU_SCENARIOS.has(id));
	const order: string[] = [];
	const chosen = new Map<string, string>();
	for (const id of ids) {
		const base = id.replace(/^return_to_/, '');
		if (!chosen.has(base)) {
			order.push(base);
			chosen.set(base, id);
		} else if (id.startsWith('return_to_')) {
			chosen.set(base, id);
		}
	}
	return order.map((base) => {
		const id = chosen.get(base)!;
		return { scenario: id, name: log.en.scenarioNames?.[id] ?? id };
	});
}
