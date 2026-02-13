import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

import {
	agentsOfCthulhu,
	agentsOfHastur,
	agentsOfShubNiggurath,
	agentsOfYogSothoth,
	ancientEvils,
	chillingCold,
	cultOfUmordhoth,
	darkCult,
	ghouls,
	ghoulsOfUmordhoth,
	lockedDoors,
	nightgaunts,
	rats,
	returnToCultOfUmordhoth,
	returnToTheDevourerBelow,
	returnToTheGathering,
	returnToTheMidnightMasks,
	strikingFear,
	theDevourerBelow,
	theDevourersCult,
	theGathering,
	theMidnightMasks
} from './encounter';

export const theGatheringScenario: Scenario = {
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.TheGathering,
	setups: [
		{
			shuffles: [
				{ encounterSet: theGathering, overwriteCount: 2 },
				ancientEvils,
				chillingCold,
				ghouls,
				rats,
				strikingFear
			]
		}
	]
};

export const theMidnightMasksScenario: Scenario = {
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.TheMidnightMasks,
	setups: [
		{
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				chillingCold,
				darkCult,
				lockedDoors,
				nightgaunts
			],
			remaining: [cultOfUmordhoth]
		}
	]
};

export const theDevourerBelowScenario: Scenario = {
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.TheDevourerBelow,
	setups: [
		{
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfCthulhu }
			],
			remaining: [cultOfUmordhoth]
		},
		{
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfShubNiggurath }
			],
			remaining: [cultOfUmordhoth]
		},
		{
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfHastur }
			],
			remaining: [cultOfUmordhoth]
		},
		{
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfYogSothoth }
			],
			remaining: [cultOfUmordhoth]
		}
	]
};

export const returnToTheGatheringScenario: Scenario = {
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.ReturnToTheGathering,
	setups: [
		{
			shuffles: [
				{ encounterSet: theGathering, overwriteCount: 0 },
				{ encounterSet: returnToTheGathering, overwriteCount: 0 },
				ancientEvils,
				chillingCold,
				ghoulsOfUmordhoth,
				rats,
				strikingFear
			]
		}
	]
};

export const returnToTheMidnightMasksScenario: Scenario = {
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.ReturnToTheMidnightMasks,
	setups: [
		{
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 0 },
				{ encounterSet: returnToTheMidnightMasks, overwriteCount: 0 },
				chillingCold,
				lockedDoors,
				nightgaunts,
				theDevourersCult
			],
			remaining: [cultOfUmordhoth, returnToCultOfUmordhoth]
		}
	]
};

export const returnToTheDevourerBelowScenario: Scenario = {
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.ReturnToTheDevourerBelow,
	setups: [
		{
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 0 },
				{ encounterSet: returnToTheDevourerBelow, overwriteCount: 0 },
				ancientEvils,
				ghoulsOfUmordhoth,
				theDevourersCult,
				strikingFear,
				returnToCultOfUmordhoth
			],
			remaining: [
				agentsOfCthulhu,
				agentsOfHastur,
				agentsOfShubNiggurath,
				agentsOfYogSothoth,
				cultOfUmordhoth
			]
		}
	]
};
