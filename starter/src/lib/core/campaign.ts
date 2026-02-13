import { ChaosToken, EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

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
	index: number;
	shortName?: string;
	representativeSet: KohakuEncounterSet;
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
