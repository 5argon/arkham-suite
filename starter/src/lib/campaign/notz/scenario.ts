import type { Scenario } from '$lib/core/campaign';
import { ChaosToken, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
			name: '4 Players',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				chillingCold,
				{ encounterSet: darkCult, overwriteCount: 3 },
				lockedDoors,
				nightgaunts
			],
			remaining: [cultOfUmordhoth]
		},
		{
			name: '3 Players',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				chillingCold,
				{ encounterSet: darkCult, overwriteCount: 4 },
				lockedDoors,
				nightgaunts
			],
			remaining: [cultOfUmordhoth]
		},
		{
			name: '2 Players',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				chillingCold,
				{ encounterSet: darkCult, overwriteCount: 5 },
				lockedDoors,
				nightgaunts
			],
			remaining: [cultOfUmordhoth]
		},
		{
			name: '1 Player',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				chillingCold,
				darkCult,
				lockedDoors,
				nightgaunts
			],
			remaining: [cultOfUmordhoth]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: darkCult,
				what: '1 **Acolyte** per investigator beyond the first is spawned at setup instead of entering the encounter deck (at Southside, then Downtown, then the Graveyard).'
			},
			{
				what: 'If *the Ghoul Priest is still alive*, shuffle it into the encounter deck. The encounter deck has 1 more card.'
			}
		]
	}
};

export const theDevourerBelowScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheDevourerBelow,
	shortName: 'III',
	setups: [
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfCthulhu }
			]
		},
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfShubNiggurath }
			]
		},
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfHastur }
			]
		},
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				darkCult,
				ghouls,
				strikingFear,
				{ encounterSet: agentsOfYogSothoth }
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing],
		notes: [
			{
				what: 'If *the Ghoul Priest is still alive*, shuffle it into the encounter deck. The encounter deck has 1 more card.'
			}
		]
	}
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
				what: '**Corpse-Hungry Ghoul**, **Ghoul from the Depths**, and 2x **The Zealot’s Seal** are shuffled into the encounter deck.'
			}
		]
	}
};

export const returnToTheMidnightMasksScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheMidnightMasks,
	shortName: 'II',
	setups: [
		{
			name: '4 Players',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				{ encounterSet: returnToTheMidnightMasks, overwriteCount: 2 },
				chillingCold,
				lockedDoors,
				nightgaunts,
				{ encounterSet: theDevourersCult, overwriteCount: 3 }
			],
			remaining: [cultOfUmordhoth, returnToCultOfUmordhoth]
		},
		{
			name: '3 Players',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				{ encounterSet: returnToTheMidnightMasks, overwriteCount: 2 },
				chillingCold,
				lockedDoors,
				nightgaunts,
				{ encounterSet: theDevourersCult, overwriteCount: 4 }
			],
			remaining: [cultOfUmordhoth, returnToCultOfUmordhoth]
		},
		{
			name: '2 Players',
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				{ encounterSet: returnToTheMidnightMasks, overwriteCount: 2 },
				chillingCold,
				lockedDoors,
				nightgaunts,
				{ encounterSet: theDevourersCult, overwriteCount: 5 }
			],
			remaining: [cultOfUmordhoth, returnToCultOfUmordhoth]
		},
		{
			name: '1 Player',
			asteriskCount: true,
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
				what: 'Only 2x **Masked Horrors** enter the encounter deck. 1 out of 2 randomized **Predator or Prey?** (agenda 1a) is used without looking at its other side, the other is removed from the game.'
			},
			{
				topic: 'Cultist Deck (5)',
				what: '**Cult of Umôrdhoth** and **Return to Cult of Umôrdhoth** shuffled together, then 3 random cards are removed from the game without looking.'
			},
			{
				encounterSet: theDevourersCult,
				what: '1 **Disciple of the Devourer** per investigator beyond the first is spawned at setup instead of entering the encounter deck (at Southside, then Downtown, then the Graveyard).'
			},
			{
				what: 'If *the Ghoul Priest is still alive*, shuffle it into the encounter deck. The encounter deck has 1 more card.'
			}
		]
	}
};

export const returnToTheDevourerBelowScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheDevourerBelow,
	shortName: 'III',
	setups: [
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				{ encounterSet: returnToTheDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				ghoulsOfUmordhoth,
				theDevourersCult,
				strikingFear,
				agentsOfCthulhu
			]
		},
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				{ encounterSet: returnToTheDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				ghoulsOfUmordhoth,
				theDevourersCult,
				strikingFear,
				agentsOfShubNiggurath
			]
		},
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				{ encounterSet: returnToTheDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				ghoulsOfUmordhoth,
				theDevourersCult,
				strikingFear,
				agentsOfHastur
			]
		},
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: theDevourerBelow, overwriteCount: 2 },
				{ encounterSet: returnToTheDevourerBelow, overwriteCount: 2 },
				ancientEvils,
				ghoulsOfUmordhoth,
				theDevourersCult,
				strikingFear,
				agentsOfYogSothoth
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing],
		notes: [
			{
				encounterSet: returnToTheDevourerBelow,
				what: 'Only 2x **Umôrdhoth’s Hunger** enter the encounter deck.'
			},
			{
				what: 'If *the Ghoul Priest is still alive*, shuffle it into the encounter deck. The encounter deck has 1 more card.'
			}
		]
	}
};
