import type { Scenario } from '$lib/core/campaign';
import {
	EncounterSet as KohakuEncounterSet,
	Scenario as KohakuScenario
} from '@5argon/arkham-kohaku';

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
			{
				encounterSet: residents,
				what: ['**River Hawthorne** (Day 1): place at the column 3 location.']
			},
			{
				encounterSet: residents,
				what: ['**Simeon Atwood** (Day 1 or 2): set aside, out of play.']
			},
			{ encounterSet: residents, what: ['**Leah Atwood** (Day 3): set aside, out of play.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: writtenInRock,
				what: 'The **Written in Rock** set is set aside, out of play.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: 'Its 6 **Cave** locations are used by the setup and 2x **Crystal Parasite** enemies are set aside; only its 4 treacheries (2x **Chroma Blight** and 2x **Calcification**) are shuffled in.'
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
			{
				encounterSet: residents,
				what: ['**Judith Park** (Day 2 or 3): put into play at the Parlor.']
			},
			{ encounterSet: residents, what: ['**Theo Peters** (Day 3): put into play at the Foyer.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: hemlockHouse,
				what: 'Only 2x **Grappling Spawn** enter the deck; the **Out of the Walls** and **Pulled In** treacheries are set aside, out of play.'
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
				what: 'The **Brood Queen** enemy is set aside, out of play.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: '3 random **Horrors in the Rock** locations are set aside and the rest removed from the game; 2x **Crystal Parasite** enemies are set aside; only its 4 treacheries (2x **Chroma Blight** and 2x **Calcification**) enter the deck.'
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
			{
				encounterSet: residents,
				what: ['**Theo Peters** (Day 1 or 2): put into play under an investigator’s control.']
			}
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: theLostSister,
				what: 'The **Limulus Hybrid** and 2x **Crustacean Hybrid** enemies are set aside; its locations form the Caverns deck. The 9 cards shuffled in are 3x **Cavern Moss**, 3x **Reclaimed by Nature**, and 3x **Luminous Growth**.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: '2x **Crystal Parasite** enemies are set aside; only its 4 treacheries (2x **Chroma Blight** and 2x **Calcification**) enter the deck (its locations join the Caverns deck).'
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
			{
				encounterSet: residents,
				what: ['**Dr. Rosa Marquez** (Day 1): put into play under an investigator’s control.']
			},
			{ encounterSet: residents, what: ['**River Hawthorne** (Day 2 or 3): place at North Shore.'] }
		],
		notes: [
			{
				encounterSet: theFirstDay,
				what: 'Use the set matching the played day.'
			},
			{
				encounterSet: theThingInTheDepths,
				what: 'The **Thing in the Depths**, **Chelydran Hybrid**, and 5x **Grasping Tendril** enemies are set aside; only its 7 treacheries enter the deck: 3x **Ground Disturbance** and 4x **Sinking Sludge**.'
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
		specialGather: [
			{
				encounterSet: residents,
				what: [
					'**Dr. Rosa Marquez**: put into play under an investigator’s control (does not take an ally slot).'
				]
			},
			{ encounterSet: residents, what: ['**Bertie Musgrave**: set aside, out of play.'] },
			{
				encounterSet: residents,
				what: ['**Theo Peters**: set aside, out of play, if at Relationship Level 2 or higher.']
			},
			{
				encounterSet: residents,
				what: ['**Judith Park**: set aside, out of play, if at Relationship Level 2 or higher.']
			}
		],
		notes: [
			{
				what: 'Put the **Vale Lantern** into play under an investigator’s control, **Lit** side faceup: **with Boon** version if Mother Rachel showed the way, or the **without Boon** version if you lost the path. Remove the other. With a single investigator, it does not take a hand slot.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Woods Deck'
			},
			{
				paragraph:
					'Set **Twisted Hollow** and **Glimmering Meadow** aside, then remove 2 Western Woods locations (1 to 2 players) or 1 (3 to 4 players). Put 1 random remaining location into play as the starting location, shuffle the rest into the Woods deck, and reveal the top 4 around the start.'
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
				what: 'Only 2x **Endless Night** and 4x **Incursion** treacheries enter the encounter deck.'
			},
			{
				encounterSet: fire,
				what: 'The entire **Fire!** set is set aside, out of play.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Gather only 2x **False Lead** and 3x **Hunting Shadow**.'
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
				{ encounterSet: fateOfTheVale, overwriteCount: 8 },
				{ encounterSet: horrorsInTheRock, overwriteCount: 4 },
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
				what: '**The Abyss** replaces the encounter deck. The count shown is the encounter portion only; it does not include the top 5 cards of each investigator’s deck or each investigator card, which are also shuffled into **The Abyss**.'
			},
			{
				encounterSet: dayOfTheFeast,
				what: 'The entire **Day of the Feast** set is set aside, out of play.'
			},
			{
				encounterSet: fateOfTheVale,
				what: '2x **Crystal Mimic** and the 6 treacheries (2x **Sublimation**, 2x **Fragmentation**, 2x **Euphoria**) are shuffled into **The Abyss**.'
			},
			{
				encounterSet: fire,
				what: 'The entire **Fire!** set is set aside, out of play.'
			},
			{
				encounterSet: horrorsInTheRock,
				what: 'Its locations and both **Crystal Parasite** enemies are set aside; only its 4 treacheries (2x **Chroma Blight** and 2x **Calcification**) are shuffled into **The Abyss**.'
			},
			{
				encounterSet: residents,
				what: 'The entire **Residents** set is set aside, out of play.'
			},
			{
				encounterSet: theVale,
				what: 'The entire **The Vale** set is set aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Building The Abyss'
			},
			{
				bullets: [
					'After drawing opening hands, shuffle together all remaining encounter cards and the top 5 cards of each investigator’s deck.',
					'Split the shuffled deck in half and set one half aside.',
					'Shuffle each “true” investigator card into the other half, then place that half on top of the set-aside half.',
					'Place the double-sided **The Abyss** card on top, story card side faceup; it always covers the top and is never shuffled in.'
				]
			},
			{
				heading: 'The Abyss Rules'
			},
			{
				bullets: [
					'When an investigator would draw from the encounter deck, instead reveal from the bottom of The Abyss until an encounter-card back appears, draw it, and shuffle the rest back on top.',
					'Resolve a card drawn from The Abyss using the double-sided The Abyss story card.',
					'Player card and weakness effects targeting the encounter deck cannot interact with The Abyss and all fail.',
					'Encounter cards discarded this scenario are always placed on top of The Abyss.'
				]
			}
		]
	}
};
