import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
			shuffles: [
				{ encounterSet: thePitOfDespair, overwriteCount: 0 },
				agentsOfCthulhu,
				rats,
				creaturesOfTheDeep,
				{ encounterSet: floodedCaverns, overwriteCount: 0 },
				risingTide,
				shatteredMemories
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: thePitOfDespair,
				what: 'None of **The Pit of Despair** enters the deck: **The Amalgam**, 2x **Blindsense**, and 3x **From the Depths** are set aside, out of play.'
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
				{ encounterSet: theVanishingOfElinaHarper, overwriteCount: 0 },
				chillingCold,
				lockedDoors,
				{ encounterSet: nightgaunts, overwriteCount: 2 },
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				agentsOfDagon,
				{ encounterSet: fogOverInnsmouth, overwriteCount: 2 },
				theLocals
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theVanishingOfElinaHarper,
				what: 'The suspects are placed as leads; none of **The Vanishing of Elina Harper** enters the encounter deck.'
			},
			{
				encounterSet: nightgaunts,
				what: '2x **Hunting Nightgaunt** enemies are set aside, out of play.'
			},
			{
				encounterSet: fogOverInnsmouth,
				what: 'The **Winged One** enemy is set aside, out of play.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Only its 5 treacheries are gathered.'
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
				{ encounterSet: inTooDeep, overwriteCount: 7 },
				agentsOfCthulhu,
				creaturesOfTheDeep,
				risingTide,
				syzygy,
				theLocals
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: inTooDeep,
				what: 'The **Innsmouth Shoggoth** and 2x **Ravager from the Deep** are set aside; Deep One enemies spawn at flooded locations during the chase.'
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
				{ encounterSet: floodedCaverns, overwriteCount: 0 },
				malfunction,
				risingTide
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: devilReef,
				what: 'Only its story-asset relics are set aside; all of its enemies and treacheries enter the deck.'
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
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: horrorInHighGear,
				what: 'Additional vehicle enemies spawn at setup as the player count rises, so the starting encounter deck shrinks accordingly.'
			}
		]
	}
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
				{ encounterSet: floodedCaverns, overwriteCount: 0 },
				risingTide,
				syzygy
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: aLightInTheFog,
				what: 'The **Oceiros Marsh** enemy and both **Worth His Salt** and **Taken Captive** treacheries are set aside, out of play.'
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
				agentsOfDagon,
				{ encounterSet: floodedCaverns, overwriteCount: 0 },
				{ encounterSet: syzygy, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theLairOfDagon,
				what: 'The **Apostle of Dagon** and **Dagon** enemies are set aside, out of play.'
			},
			{
				encounterSet: syzygy,
				what: '2x **Syzygy** and 2x **Tidal Alignment** treacheries are set aside, out of play.'
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
				{ encounterSet: floodedCaverns, overwriteCount: 0 },
				shatteredMemories,
				syzygy
			]
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
