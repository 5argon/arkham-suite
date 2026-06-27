/**
 * scenario-extras.ts — adapter over campaign-data's per-scenario "Extra" CHOICE
 * inputs: facts the player chose but the campaign log never records (e.g. PtC Dim
 * Carcosa's "Hastur version" — which Act 2 you faced). The choices are now
 * declared in campaign-data (`scenarioMeta[].choices` + `-en.scenarioChoices`);
 * this just resolves them into the editor-friendly shape. Recorded in the Extra
 * tab's reserved `__choice` section.
 */
import { getCampaignLog, type CampaignLog } from '@5argon/arkham-campaign-data';

export interface ScenarioChoiceOption {
	value: string;
	label: string;
}

export interface ScenarioChoiceDef {
	id: string;
	label: string;
	/** Options with resolved labels (empty for a `counter` control). */
	options: ScenarioChoiceOption[];
	/** Editor control: dropdown (default), radio, a numeric counter, or a filtered card picker. */
	control: 'dropdown' | 'radio' | 'counter' | 'cards';
	/** `counter` bounds. */
	min?: number;
	max?: number;
	/** For the `cards` control: restricts the searchable pool (type / subtype / trait / code). */
	cardFilter?: { types?: string[]; subtypes?: string[]; traits?: string[]; codes?: string[] };
	/** Editor flow position relative to the universal Resolution + Victory-display fields (ArkhamCards
	 *  order): absent → before both; `'resolution'` → between them; `'victory'` → after the victory field. */
	after?: 'resolution' | 'victory';
}

/** The manual choices campaign-data declares for a scenario, resolved with labels. */
export function choicesForScenario(log: CampaignLog, scenario: string): ScenarioChoiceDef[] {
	const choices = log.db.scenarioMeta?.find((m) => m.id === scenario)?.choices;
	if (!choices?.length) return [];
	return choices.map((c) => {
		const en = log.en.scenarioChoices?.[`${scenario}.${c.id}`];
		return {
			id: c.id,
			label: en?.label ?? c.id,
			options: c.options.map((o) => ({ value: o, label: en?.options?.[o] ?? o })),
			control: c.control ?? 'dropdown',
			min: c.min,
			max: c.max,
			cardFilter: c.cardFilter,
			after: c.after,
		};
	});
}

/**
 * The manual choices for a STANDALONE scenario, resolved with labels. Standalones
 * live in the shared 'side' catalogue, so a standalone can declare the same
 * `counter`/`radio`/`dropdown` Extra controls a regular scenario can (e.g. Fortune
 * and Folly's "Completed Tasks"). Recorded on the standalone instance, not the
 * `__choice` section (which is keyed by scenario, not per standalone play).
 */
export function choicesForStandalone(standalone: string): ScenarioChoiceDef[] {
	const log = getCampaignLog('side');
	return log ? choicesForScenario(log, standalone) : [];
}

/** Label for a single choice (used by the lifetime aggregation). */
export function choiceLabel(log: CampaignLog, scenario: string, choiceId: string): string {
	return log.en.scenarioChoices?.[`${scenario}.${choiceId}`]?.label ?? choiceId;
}
