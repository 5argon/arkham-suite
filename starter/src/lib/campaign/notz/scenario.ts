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
				{ encounterSet: theGathering, overwriteCount: 2 },
				{ encounterSet: returnToTheGathering, overwriteCount: 4 },
				ancientEvils,
				chillingCold,
				ghoulsOfUmordhoth,
				rats,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: returnToTheGathering,
				what: '**Corpse-Hungry Ghoul**, **Ghoul from the Depths**, and 2x **The Zealot’s Seal** are shuffled into the encounter deck. **Ghouls of Umördhoth** replaces the regular **Ghouls** set.'
			}
		]
	}
};

export const returnToTheMidnightMasksScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheMidnightMasks,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				{ encounterSet: returnToTheMidnightMasks, overwriteCount: 2 },
				chillingCold,
				lockedDoors,
				nightgaunts,
				theDevourersCult
			],
			remaining: [cultOfUmordhoth, returnToCultOfUmordhoth]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: returnToTheMidnightMasks,
				what: '2x **Masked Horrors** are shuffled into the encounter deck (**Narôgath** is set aside, entering play via the agenda). **The Devourer’s Cult** replaces the regular **Dark Cult** set.'
			}
		]
	}
};

export const returnToTheDevourerBelowScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheDevourerBelow,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				{ encounterSet: returnToTheDevourerBelow, overwriteCount: 2 },
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
	],
	commonSetup: {
		notes: [
			{
				encounterSet: returnToTheDevourerBelow,
				what: '2x **Umôrdhoth’s Hunger** are shuffled into the encounter deck (**Vault of Earthly Demise** is attached to Umôrdhoth and set aside). **Ghouls of Umördhoth** and **The Devourer’s Cult** replace the regular **Ghouls** and **Dark Cult** sets.'
			}
		]
	}
};
