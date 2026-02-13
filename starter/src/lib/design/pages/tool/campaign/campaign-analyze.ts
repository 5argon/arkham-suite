import {
	type Campaign,
	type EncounterSet,
	isEncounterSetWithModification,
	type Scenario
} from '$lib/core/campaign';
import { getEncounterSetFlag } from '$lib/utility/encounter-set-flag';
import {
	type Campaign as KohakuCampaign,
	encounterSet,
	specialOrderingEncounterSets
} from '@5argon/arkham-kohaku';
import { u } from '@5argon/arkham-string';

export function findCoreEncounters(c: Campaign, kohakuCampaign: KohakuCampaign): EncounterSet[] {
	return findUniqueEncounters(c).filter((x) => {
		return getEncounterSetFlag(x.kohakuEncounterSet, kohakuCampaign) === 'core';
	});
}

export function findUniqueScenarios(c: Campaign): Scenario[] {
	const unique = new Set<Scenario>();
	c.scenarios.forEach((x) => {
		unique.add(x);
	});
	return Array.from(unique).sort((a, b) => {
		return a.index - b.index;
	});
}

export function findUniqueEncounters(c: Campaign): EncounterSet[] {
	const encounterSets = c.scenarios.flatMap((x) => mergeEncounters(x));
	const unique = new Set<EncounterSet>();
	encounterSets.forEach((x) => {
		unique.add(x);
	});
	return Array.from(unique);
}

export interface TransitionInfo {
	keep: EncounterSet[];
	add: EncounterSet[];
	remove: EncounterSet[];
	removeToForesight: EncounterSet[];
	addToForesight: EncounterSet[];
}

export function mergeEncounters(s: Scenario | null): EncounterSet[] {
	if (s === null) {
		return [];
	}
	const es = new Set<EncounterSet>();
	s.setups.forEach((setup) => {
		setup.shuffles.forEach((x) => {
			if (isEncounterSetWithModification(x)) {
				es.add(x.encounterSet);
			} else {
				es.add(x);
			}
		});
		if (setup.remaining !== undefined) {
			setup.remaining.forEach((x) => {
				if (isEncounterSetWithModification(x)) {
					es.add(x.encounterSet);
				} else {
					es.add(x);
				}
			});
		}
	});
	return Array.from(es);
}

export function mergeEncountersPure(encounters: EncounterSet[]): EncounterSet[] {
	const es = new Set<EncounterSet>();
	encounters.forEach((x) => {
		es.add(x);
	});
	return Array.from(es);
}

/**
 * Central sorting function for encounter sets.
 * Groups by: Scenario Specific (Return To first) → Common → Return To Common → Core
 * Within each group, special ordered sets come first (in array order), then alphabetically by English name.
 */
export function sortEncounterSetsByGroup(
	es: EncounterSet[],
	kohakuCampaign: KohakuCampaign
): EncounterSet[] {
	const sorted = [...es];
	sorted.sort((a, b) => {
		const aFlag = getEncounterSetFlag(a.kohakuEncounterSet, kohakuCampaign);
		const bFlag = getEncounterSetFlag(b.kohakuEncounterSet, kohakuCampaign);

		// Determine group score (lower = earlier in order)
		function getGroupScore(
			flag: ReturnType<typeof getEncounterSetFlag>,
			encounterSetObj: EncounterSet
		): number {
			if (flag === 'scenario') {
				// Scenario sets: Return To scenarios (0) come before regular scenarios (1)
				return encounterSet.isReturnToEncounterSet(encounterSetObj.kohakuEncounterSet) ? 0 : 1;
			}
			if (flag === undefined) return 2; // Common
			if (flag === 'return-to') return 3; // Return To Common
			if (flag === 'core') return 4; // Core
			return 5; // fallback
		}

		const scoreA = getGroupScore(aFlag, a);
		const scoreB = getGroupScore(bFlag, b);

		if (scoreA !== scoreB) {
			return scoreA - scoreB;
		}

		// Within same group, check special ordering first
		const aIndexInSpecial = specialOrderingEncounterSets.indexOf(a.kohakuEncounterSet);
		const bIndexInSpecial = specialOrderingEncounterSets.indexOf(b.kohakuEncounterSet);

		const aIsSpecial = aIndexInSpecial !== -1;
		const bIsSpecial = bIndexInSpecial !== -1;

		if (aIsSpecial && bIsSpecial) {
			// Both in special list: sort by array order
			return aIndexInSpecial - bIndexInSpecial;
		}

		if (aIsSpecial && !bIsSpecial) {
			// Special comes before non-special
			return -1;
		}

		if (!aIsSpecial && bIsSpecial) {
			// Non-special comes after special
			return 1;
		}

		// Neither in special list: sort alphabetically by English name
		const nameA = u.encounterSetName(a.kohakuEncounterSet);
		const nameB = u.encounterSetName(b.kohakuEncounterSet);
		return nameA.localeCompare(nameB);
	});
	return sorted;
}

export function sortEncounters(es: EncounterSet[]): EncounterSet[] {
	const sorted = [...es];
	sorted.sort((a, b) => sortEncountersScore(a, b));
	return sorted;
}

export function sortEncountersScore(a: EncounterSet, b: EncounterSet): number {
	const nameA = u.encounterSetName(a.kohakuEncounterSet);
	const nameB = u.encounterSetName(b.kohakuEncounterSet);
	return nameA.localeCompare(nameB);
}

export function makeLongScenarioName(s: Scenario): string {
	const name = s.overrideName ?? u.encounterSetName(s.representativeSet);
	return s.shortName !== undefined ? `(${s.shortName}) ${name}` : name;
}
