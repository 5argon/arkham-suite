import {
	ChaosToken,
	EncounterSet as KohakuEncounterSet,
	Scenario as KohakuScenario
} from '@5argon/arkham-kohaku';

export interface EncounterSet {
	count: number;
	kohakuEncounterSet: KohakuEncounterSet;
}

export interface Campaign {
	scenarios: Scenario[];
	commonEncounterSets?: EncounterSet[];
	startingChaosBag?: PerDifficultySettings<ChaosToken[]>;
}

export interface Scenario {
	/** Reference to the kohaku scenario enum which contains index and representative set information */
	kohakuScenario: KohakuScenario;
	shortName?: string;
	overrideName?: string;

	setups: ScenarioSetup[];
	commonSetup?: ScenarioSetupSub;

	extraInfo?: {
		front?: ExtraInfo[];
		back?: ExtraInfo[];
	};
}

export interface ExtraInfo {
	heading?: string;
	paragraph?: string;
	bullets?: string[];
	image?: string;
}

export type ScenarioSetup = {
	name?: string;
	shuffles: EncounterSetItem[];
	remaining?: EncounterSetItem[];
	/**
	 * The starting encounter deck count can still change during setup (campaign log, player count,
	 * cards drawn out of the deck), so it is shown with an asterisk. Explain how in a note.
	 */
	asteriskCount?: boolean;
} & ScenarioSetupSub;

export interface ScenarioSetupSub {
	addBasicWeakness?: AdditionalWeakness[];
	addChaosToken?: ChaosToken[];
	addChaosTokenPerDifficulty?: PerDifficultySettings<ChaosToken[]>;
	notes?: ScenarioNote[];
	specialGather?: EncounterSetItem[];
}

export interface ScenarioNote {
	encounterSet?: EncounterSet;
	what: string;
	topic?: string;
}

export interface AdditionalWeakness {
	trait: string;
}

export type EncounterSetItem = EncounterSet | EncounterSetWithModification;

export interface EncounterSetWithModification {
	encounterSet: EncounterSet;
	overwriteCount?: number;
	what?: string[];
}

export function isEncounterSetWithModification(
	e: EncounterSetItem
): e is EncounterSetWithModification {
	return 'encounterSet' in e;
}

export function getEncounterInsideItem(e: EncounterSetItem) {
	if (isEncounterSetWithModification(e)) {
		return e.encounterSet;
	} else {
		return e;
	}
}

export interface PerDifficultySettings<T> {
	easy?: T;
	standard?: T;
	hard?: T;
	expert?: T;
}

export interface ScenarioTransition {
	/**
	 * Use `null` on the first scenario.
	 */
	from: Scenario | null;

	to: Scenario;
}
