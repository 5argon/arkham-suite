/**
 * standalone-scenarios.ts — clean scenario lists + icons for the Standalone Archive
 * pickers / profile.
 *
 * campaign-data's `playableScenarios()` is broader than the set you'd play as a
 * one-off: it includes framing preludes typed as `story` (FHV's "Welcome to Hemlock
 * Vale", the Dawn/Evening beats), replay variants (EotE Fatal Mirage ×3), and — for
 * Return-To campaigns — BOTH the base scenario and its `return_to_` twin. kohaku's
 * `Scenario` enum is the CANONICAL set of real scenarios, so we filter to it and then
 * collapse each base/return-to pair to one entry (preferring the return-to variant).
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

/** The representative encounter set for a scenario id (campaign or standalone), for its icon. */
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

/**
 * The clean list of a campaign's standalone-playable scenarios (book order): real
 * scenarios only (framing/variant entries dropped via the kohaku filter), with each
 * Return-To base/twin pair collapsed to a single entry that prefers the `return_to_`
 * variant. Ids are campaign-data scenario ids (so the editor/profile can look them up).
 */
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
			chosen.set(base, id); // a Return-To campaign plays the return-to variant
		}
	}
	return order.map((base) => {
		const id = chosen.get(base)!;
		return { scenario: id, name: log.en.scenarioNames?.[id] ?? id };
	});
}
