import type { Scenario } from '$lib/core/campaign';
import { Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

import {
	agentsOfCthulhu,
	ancientEvils,
	chillingCold,
	darkCult,
	lockedDoors,
	nightgaunts,
	rats,
	strikingFear,
	theMidnightMasks
} from '../notz/encounter';
import {
	agentsOfDagon,
	agentsOfHydra,
	aLightInTheFog,
	creaturesOfTheDeep,
	devilReef,
	floodedCaverns,
	fogOverInnsmouth,
	horrorInHighGear,
	inTooDeep,
	intoTheMaelstrom,
	malfunction,
	risingTide,
	shatteredMemories,
	syzygy,
	theLairOfDagon,
	theLocals,
	thePitOfDespair,
	theVanishingOfElinaHarper
} from './encounter';

export const thePitOfDespairScenario: Scenario = {
	kohakuScenario: KohakuScenario.ThePitOfDespair,
	shortName: 'I',
	setups: [
		{
			shuffles: [agentsOfCthulhu, rats, creaturesOfTheDeep, risingTide, shatteredMemories],
			remaining: [thePitOfDespair, floodedCaverns]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: thePitOfDespair,
				what: '**The Amalgam** enemy, 2x **Blindsense** and 3x **From the Depths** treacheries are set aside, out of play.'
			}
		]
	}
};

export const theVanishingOfElinaHarperScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheVanishingOfElinaHarper,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				chillingCold,
				lockedDoors,
				{ encounterSet: nightgaunts, overwriteCount: 2 },
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				agentsOfDagon,
				{ encounterSet: fogOverInnsmouth, overwriteCount: 2 },
				theLocals
			],
			remaining: [theVanishingOfElinaHarper]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Leads Deck (10)',
				what: '1 random ***Suspect*** enemy and 1 random ***Hideout*** location go facedown beneath **Finding Agent Harper** without looking at them. The other 10 are shuffled together to form the Leads deck.'
			},
			{
				encounterSet: fogOverInnsmouth,
				what: 'The **Winged One** enemy is set aside, out of play.'
			},
			{
				encounterSet: nightgaunts,
				what: '2x **Hunting Nightgaunt** enemies are set aside, out of play.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Only its 5 treacheries are gathered: 2x **False Lead** and 3x **Hunting Shadow**.'
			}
		]
	}
};

export const inTooDeepScenario: Scenario = {
	kohakuScenario: KohakuScenario.InTooDeep,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: inTooDeep, overwriteCount: 9 },
				{ encounterSet: agentsOfCthulhu, overwriteCount: 2 },
				creaturesOfTheDeep,
				risingTide,
				syzygy,
				theLocals
			]
		}
	],
	commonSetup: {
		specialGather: [
			{
				encounterSet: theVanishingOfElinaHarper,
				overwriteCount: 1,
				what: ['**Angry Mob** (back of **Finding Agent Harper**): set aside, out of play.']
			}
		],
		notes: [
			{
				encounterSet: inTooDeep,
				what: 'The **Innsmouth Shoggoth** and 2x **Ravager from the Deep** enemies are set aside, out of play.'
			},
			{
				encounterSet: agentsOfCthulhu,
				what: '2x **Young Deep One** enemies are set aside, out of play.'
			},
			{
				encounterSet: theVanishingOfElinaHarper,
				what: 'Each ***Suspect*** enemy that is *out for blood* in the Campaign Log is put into play at its location by its revelation ability, without clues on it.'
			},
			{
				what: '**The House on Water Street**, **Innsmouth Harbour** and **Desolate Coastline** start partially flooded.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Barriers'
			},
			{
				paragraph:
					'Barriers are resource tokens placed between two locations and block investigator movement along that path.'
			},
			{
				bullets: [
					'If 1 or more barriers sit between two locations, investigators cannot move between them, even if they are connected.',
					'Barriers are removed by certain location abilities or the act 1a ability. More barriers between two locations require more uses to clear the path.',
					'A hunter enemy moves along the shortest path not blocked by barriers, ignoring barriers only if no such path exists. All other enemy movement ignores barriers.'
				]
			}
		]
	}
};

export const devilReefScenario: Scenario = {
	kohakuScenario: KohakuScenario.DevilReef,
	shortName: 'IV',
	setups: [
		{
			shuffles: [
				{ encounterSet: devilReef, overwriteCount: 15 },
				agentsOfHydra,
				creaturesOfTheDeep,
				malfunction,
				risingTide
			],
			remaining: [floodedCaverns]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Tidal Tunnel Deck (8)',
				what: "The 6 Tidal Tunnel locations of this set and 2x **Bootlegger's Hideaway** are shuffled into the Tidal Tunnel deck, unrevealed side faceup."
			}
		]
	}
};

export const horrorInHighGearScenario: Scenario = {
	kohakuScenario: KohakuScenario.HorrorInHighGear,
	shortName: 'V',
	setups: [
		{
			name: '1 Player',
			shuffles: [
				{ encounterSet: horrorInHighGear, overwriteCount: 14 },
				ancientEvils,
				fogOverInnsmouth,
				malfunction,
				shatteredMemories
			]
		},
		{
			name: '2 to 3 Players',
			shuffles: [
				{ encounterSet: horrorInHighGear, overwriteCount: 13 },
				ancientEvils,
				fogOverInnsmouth,
				malfunction,
				shatteredMemories
			],
			notes: [
				{
					encounterSet: horrorInHighGear,
					what: '1 random ***Vehicle*** enemy spawns at the rearmost location.'
				}
			]
		},
		{
			name: '4 Players',
			shuffles: [
				{ encounterSet: horrorInHighGear, overwriteCount: 12 },
				ancientEvils,
				fogOverInnsmouth,
				malfunction,
				shatteredMemories
			],
			notes: [
				{
					encounterSet: horrorInHighGear,
					what: '2 random ***Vehicle*** enemies spawn at the rearmost location.'
				}
			]
		}
	]
};

export const aLightInTheFogScenario: Scenario = {
	kohakuScenario: KohakuScenario.ALightInTheFog,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: aLightInTheFog, overwriteCount: 13 },
				strikingFear,
				creaturesOfTheDeep,
				risingTide,
				syzygy
			],
			remaining: [floodedCaverns]
		}
	],
	commonSetup: {
		startingDoom: [
			{
				amount: '+1',
				condition: 'If *the investigators reached Falcon Point after sunrise*'
			},
			{
				amount: '+1',
				condition: 'If *the tide has grown stronger*'
			}
		],
		notes: [
			{
				encounterSet: aLightInTheFog,
				what: 'The **Oceiros Marsh** enemy, 2x **Worth His Salt** and 2x **Taken Captive** treacheries are set aside, out of play.'
			}
		]
	}
};

export const theLairOfDagonScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheLairOfDagon,
	shortName: 'VII',
	setups: [
		{
			shuffles: [
				{ encounterSet: theLairOfDagon, overwriteCount: 15 },
				darkCult,
				lockedDoors,
				agentsOfDagon
			],
			remaining: [floodedCaverns, syzygy]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Count the entries under *Memories Recovered* in the Campaign Log. With 4 or fewer, add 5 [bless] tokens to the chaos bag. With 5 to 7, add 2 [curse] tokens. With 8 or more, add 5 [curse] tokens.'
			},
			{
				encounterSet: theLairOfDagon,
				what: 'The **Apostle of Dagon** and **Dagon** enemies are set aside, out of play.'
			},
			{
				encounterSet: syzygy,
				what: 'The entire **Syzygy** encounter set is set aside, out of play.'
			}
		]
	}
};

export const intoTheMaelstromScenario: Scenario = {
	kohakuScenario: KohakuScenario.IntoTheMaelstrom,
	shortName: 'VIII',
	setups: [
		{
			shuffles: [
				{ encounterSet: intoTheMaelstrom, overwriteCount: 11 },
				ancientEvils,
				{ encounterSet: agentsOfHydra, overwriteCount: 3 },
				creaturesOfTheDeep,
				shatteredMemories,
				syzygy
			],
			remaining: [floodedCaverns]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: intoTheMaelstrom,
				what: 'The **Aquatic Abomination**, **Hydra**, and **Dagon** enemies are set aside, out of play.'
			},
			{
				encounterSet: agentsOfHydra,
				what: 'The **Lloigor** enemy is set aside, out of play.'
			}
		]
	}
};
