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
				floodedCaverns,
				risingTide,
				shatteredMemories
			]
		}
	]
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
	kohakuScenario: KohakuScenario.InTooDeep,
	shortName: 'III',
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
	kohakuScenario: KohakuScenario.DevilReef,
	shortName: 'IV',
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
	kohakuScenario: KohakuScenario.HorrorInHighGear,
	shortName: 'V',
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
	kohakuScenario: KohakuScenario.ALightInTheFog,
	shortName: 'VI',
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
	kohakuScenario: KohakuScenario.TheLairOfDagon,
	shortName: 'VII',
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
	kohakuScenario: KohakuScenario.IntoTheMaelstrom,
	shortName: 'VIII',
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
