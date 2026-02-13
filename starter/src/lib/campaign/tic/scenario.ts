import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

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
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.ThePitOfDespair,
	setups: [
		{
			shuffles: [
				{ encounterSet: thePitOfDespair, overwriteCount: 0 },
				agentsOfCthulhu,
				rats,
				creaturesOfTheDeep,
				floodedCaverns,
				risingTide,
				shatteredMemories
			]
		}
	]
};

export const theVanishingOfElinaHarperScenario: Scenario = {
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.TheVanishingOfElinaHarper,
	setups: [
		{
			shuffles: [
				{ encounterSet: theVanishingOfElinaHarper, overwriteCount: 0 },
				chillingCold,
				lockedDoors,
				nightgaunts,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				agentsOfDagon,
				fogOverInnsmouth,
				theLocals
			]
		}
	]
};

export const inTooDeepScenario: Scenario = {
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.InTooDeep,
	setups: [
		{
			shuffles: [
				{ encounterSet: inTooDeep, overwriteCount: 0 },
				agentsOfCthulhu,
				creaturesOfTheDeep,
				risingTide,
				syzygy,
				theLocals
			]
		}
	]
};

export const devilReefScenario: Scenario = {
	index: 4,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.DevilReef,
	setups: [
		{
			shuffles: [
				{ encounterSet: devilReef, overwriteCount: 0 },
				agentsOfHydra,
				creaturesOfTheDeep,
				floodedCaverns,
				malfunction,
				risingTide
			]
		}
	]
};

export const horrorInHighGearScenario: Scenario = {
	index: 5,
	shortName: 'V',
	representativeSet: KohakuEncounterSet.HorrorInHighGear,
	setups: [
		{
			shuffles: [
				{ encounterSet: horrorInHighGear, overwriteCount: 0 },
				ancientEvils,
				fogOverInnsmouth,
				malfunction,
				shatteredMemories
			]
		}
	]
};

export const aLightInTheFogScenario: Scenario = {
	index: 6,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.ALightInTheFog,
	setups: [
		{
			shuffles: [
				{ encounterSet: aLightInTheFog, overwriteCount: 0 },
				strikingFear,
				creaturesOfTheDeep,
				floodedCaverns,
				risingTide,
				syzygy
			]
		}
	]
};

export const theLairOfDagonScenario: Scenario = {
	index: 7,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.TheLairOfDagon,
	setups: [
		{
			shuffles: [
				{ encounterSet: theLairOfDagon, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				agentsOfDagon,
				floodedCaverns,
				syzygy
			]
		}
	]
};

export const intoTheMaelstromScenario: Scenario = {
	index: 8,
	shortName: 'VIII',
	representativeSet: KohakuEncounterSet.IntoTheMaelstrom,
	setups: [
		{
			shuffles: [
				{ encounterSet: intoTheMaelstrom, overwriteCount: 0 },
				ancientEvils,
				agentsOfHydra,
				creaturesOfTheDeep,
				floodedCaverns,
				shatteredMemories,
				syzygy
			]
		}
	]
};
