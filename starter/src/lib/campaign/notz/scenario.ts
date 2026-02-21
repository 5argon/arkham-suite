import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
	kohakuScenario: KohakuScenario.TheGathering,
	shortName: 'I',
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
	kohakuScenario: KohakuScenario.TheMidnightMasks,
	shortName: 'II',
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
	kohakuScenario: KohakuScenario.TheDevourerBelow,
	shortName: 'III',
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
	kohakuScenario: KohakuScenario.ReturnToTheGathering,
	shortName: 'I',
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
	kohakuScenario: KohakuScenario.ReturnToTheMidnightMasks,
	shortName: 'II',
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
	kohakuScenario: KohakuScenario.ReturnToTheDevourerBelow,
	shortName: 'III',
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
