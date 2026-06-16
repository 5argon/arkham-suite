import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

import {
	chillingCold,
	ghouls,
	lockedDoors,
	rats,
	strikingFear,
	theMidnightMasks
} from '../notz/encounter';
import {
	agentsOfTheColour,
	blight,
	dayOfTheFeast,
	fateOfTheVale,
	fire,
	hemlockHouse,
	horrorsInTheRock,
	mutations,
	myconids,
	refractions,
	residents,
	theFinalDay,
	theFirstDay,
	theForest,
	theLongestNight,
	theLostSister,
	theSecondDay,
	theSilentHeath,
	theThingInTheDepths,
	theTwistedHollow,
	theVale,
	transfiguration,
	writtenInRock
} from './encounter';

export const writtenInRockScenario: Scenario = {
	kohakuScenario: KohakuScenario.WrittenInRock,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: writtenInRock, overwriteCount: 0 },
				{ encounterSet: horrorsInTheRock, overwriteCount: 4 },
				refractions,
				chillingCold,
				ghouls,
				{ encounterSet: theFirstDay, overwriteCount: 3 },
				{ encounterSet: theSecondDay, overwriteCount: 0 },
				{ encounterSet: theFinalDay, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		specialGather: [
			{ encounterSet: residents, what: ['**River Hawthorne** (Day 1): place at the column 3 location.'] },
			{ encounterSet: residents, what: ['**Simeon Atwood** (Day 1 or 2): set aside, out of play.'] },
			{ encounterSet: residents, what: ['**Leah Atwood** (Day 3): set aside, out of play.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: writtenInRock,
				what: 'This set starts set aside, out of play. Its cards are shuffled into the encounter deck later, during the Cave-In interlude (Act 2).'
			},
			{
				encounterSet: horrorsInTheRock,
				what: 'Its 6 **Cave** locations are used by the setup and both **Crystal Parasite** enemies are set aside; only its 4 treacheries are shuffled in.'
			}
		]
	}
};

export const hemlockHouseScenario: Scenario = {
	kohakuScenario: KohakuScenario.HemlockHouse,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: hemlockHouse, overwriteCount: 2 },
				agentsOfTheColour,
				blight,
				{ encounterSet: fire, overwriteCount: 0 },
				transfiguration,
				lockedDoors,
				rats,
				{ encounterSet: theFirstDay, overwriteCount: 3 },
				{ encounterSet: theSecondDay, overwriteCount: 0 },
				{ encounterSet: theFinalDay, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		specialGather: [
			{ encounterSet: residents, what: ['**Judith Park** (Day 2 or 3): put into play at the Parlor.'] },
			{ encounterSet: residents, what: ['**Theo Peters** (Day 3): put into play at the Foyer.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: hemlockHouse,
				what: 'Only 2x **Grappling Spawn** enter the deck; the **Out of the Walls** and **Pulled In** treacheries are set aside until the house stirs.'
			},
			{
				encounterSet: fire,
				what: 'The entire **Fire!** set is set aside, out of play.'
			}
		]
	}
};

export const theSilentHeathScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheSilentHeath,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theSilentHeath, overwriteCount: 10 },
				agentsOfTheColour,
				blight,
				{ encounterSet: horrorsInTheRock, overwriteCount: 4 },
				refractions,
				transfiguration,
				strikingFear,
				{ encounterSet: theFirstDay, overwriteCount: 3 },
				{ encounterSet: theSecondDay, overwriteCount: 0 },
				{ encounterSet: theFinalDay, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		specialGather: [
			{ encounterSet: residents, what: ['**Leah Atwood** (Day 1): place at Pearl Estate Ruins.'] },
			{ encounterSet: residents, what: ['**Dr. Rosa Marquez** (Day 2): place at Crystal Grove.'] },
			{ encounterSet: residents, what: ['**Mother Rachel** (Day 3): place at Ashen Slope.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: theSilentHeath,
				what: 'The **Brood Queen** enemy is set aside; the rest of this set (10) enters the deck.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: 'Both **Crystal Parasite** enemies are set aside; only its 4 treacheries enter the deck.'
			}
		]
	}
};

export const theLostSisterScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheLostSister,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theLostSister, overwriteCount: 9 },
				blight,
				{ encounterSet: horrorsInTheRock, overwriteCount: 4 },
				mutations,
				myconids,
				{ encounterSet: theFirstDay, overwriteCount: 3 },
				{ encounterSet: theSecondDay, overwriteCount: 0 },
				{ encounterSet: theFinalDay, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		specialGather: [
			{ encounterSet: residents, what: ['**Theo Peters** (Day 1 or 2): put into play under an investigator’s control.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: theLostSister,
				what: 'The **Limulus Hybrid** and **Crustacean Hybrid** enemies are set aside; its locations form the Caverns deck.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: 'Both **Crystal Parasite** enemies are set aside; only its 4 treacheries enter the deck (its locations join the Caverns deck).'
			}
		]
	}
};

export const theThingInTheDepthsScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheThingInTheDepths,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theThingInTheDepths, overwriteCount: 7 },
				blight,
				theForest,
				mutations,
				{ encounterSet: theFirstDay, overwriteCount: 3 },
				{ encounterSet: theSecondDay, overwriteCount: 0 },
				{ encounterSet: theFinalDay, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		specialGather: [
			{ encounterSet: residents, what: ['**Judith Park** (Day 1): place at North Shore.'] },
			{ encounterSet: residents, what: ['**Dr. Rosa Marquez** (Day 1): put into play under an investigator’s control.'] },
			{ encounterSet: residents, what: ['**River Hawthorne** (Day 2 or 3): place at North Shore.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: theThingInTheDepths,
				what: 'The **Thing in the Depths**, **Chelydran Hybrid**, and 5x **Grasping Tendril** enemies are set aside; only its 7 treacheries enter the deck.'
			}
		]
	}
};

export const theTwistedHollowScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheTwistedHollow,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theTwistedHollow, overwriteCount: 9 },
				theForest,
				myconids,
				{ encounterSet: theFirstDay, overwriteCount: 3 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theTwistedHollow,
				what: 'A fixed Night 1 scenario. The **Twisted Hollow** and **Glimmering Meadow** locations are set aside to seed the Woods deck.'
			}
		]
	}
};

export const theLongestNightScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheLongestNight,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theLongestNight, overwriteCount: 6 },
				blight,
				transfiguration,
				{ encounterSet: fire, overwriteCount: 0 },
				chillingCold,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				strikingFear,
				{ encounterSet: theSecondDay, overwriteCount: 3 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theLongestNight,
				what: 'Only its 6 treacheries enter the encounter deck; its 15 enemies form a separate **Enemy deck**.'
			},
			{
				encounterSet: fire,
				what: 'The entire **Fire!** set and the **Ajax** story asset are set aside, out of play.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Only its 5 treachery cards are gathered.'
			}
		]
	}
};

export const fateOfTheValeScenario: Scenario = {
	kohakuScenario: KohakuScenario.FateOfTheVale,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: fateOfTheVale, overwriteCount: 6 },
				{ encounterSet: horrorsInTheRock, overwriteCount: 6 },
				agentsOfTheColour,
				refractions,
				transfiguration,
				{ encounterSet: theFinalDay, overwriteCount: 3 },
				{ encounterSet: dayOfTheFeast, overwriteCount: 0 },
				{ encounterSet: residents, overwriteCount: 0 },
				{ encounterSet: fire, overwriteCount: 0 },
				{ encounterSet: theVale, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: fateOfTheVale,
				what: 'The **Cosmic Emissary** and **Crystal Mimic** enemies are placed by the diagram; only its 6 treacheries enter the deck.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: 'Its locations are set aside; its enemies and treacheries (6) enter the deck.'
			},
			{
				encounterSet: dayOfTheFeast,
				what: 'Gathered but set aside for **The Abyss**, along with **Residents**, **Fire!**, and **The Vale**.'
			}
		]
	}
};
