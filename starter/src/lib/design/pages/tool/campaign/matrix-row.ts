import type { EncounterSet, Scenario } from '$lib/core/campaign';
import { encounterSet } from '@5argon/arkham-kohaku';

import { mergeEncounters } from './campaign-analyze';

export interface MatrixRow {
	scenario: Scenario;
	specificSets: EncounterSet[];
	/**
	 * Must manually match with the header. `null` will left it blank.
	 */
	orderedEncounterSets: (EncounterSet | null)[];
}

export function createMatrixRows(
	scenarios: Scenario[],
	reused: EncounterSet[],
	returnTo: EncounterSet[],
	core: EncounterSet[]
): MatrixRow[] {
	return scenarios.map<MatrixRow>((x) => {
		const ordered: (EncounterSet | null)[] = [];
		const encounters = mergeEncounters(x);
		reused.forEach((y) => {
			ordered.push(encounters.includes(y) ? y : null);
		});
		returnTo.forEach((y) => {
			ordered.push(encounters.includes(y) ? y : null);
		});
		core.forEach((y) => {
			ordered.push(encounters.includes(y) ? y : null);
		});

		const specificSets: EncounterSet[] = [];
		encounters.forEach((y) => {
			if (!ordered.includes(y)) {
				specificSets.push(y);
			}
		});
		// Sort specific sets so Return To scenario sets come before regular scenario sets
		specificSets.sort((a, b) => {
			const aIsReturnToScenario =
				encounterSet.isReturnToEncounterSet(a.kohakuEncounterSet) &&
				encounterSet.isScenarioExclusiveEncounterSet(a.kohakuEncounterSet);
			const bIsScenario =
				encounterSet.isScenarioExclusiveEncounterSet(b.kohakuEncounterSet) &&
				!encounterSet.isReturnToEncounterSet(b.kohakuEncounterSet);

			if (aIsReturnToScenario && bIsScenario) {
				return -1;
			}

			const aIsScenario =
				encounterSet.isScenarioExclusiveEncounterSet(a.kohakuEncounterSet) &&
				!encounterSet.isReturnToEncounterSet(a.kohakuEncounterSet);
			const bIsReturnToScenario =
				encounterSet.isReturnToEncounterSet(b.kohakuEncounterSet) &&
				encounterSet.isScenarioExclusiveEncounterSet(b.kohakuEncounterSet);

			if (aIsScenario && bIsReturnToScenario) {
				return 1;
			}
			return 0;
		});
		return {
			scenario: x,
			specificSets: specificSets,
			orderedEncounterSets: ordered
		};
	});
}
