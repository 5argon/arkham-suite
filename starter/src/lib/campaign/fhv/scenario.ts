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
	setups: [
		{
			shuffles: [writtenInRock, horrorsInTheRock, refractions, chillingCold, ghouls]
		}
	]
};

export const hemlockHouseScenario: Scenario = {
	kohakuScenario: KohakuScenario.HemlockHouse,
	setups: [
		{
			shuffles: [hemlockHouse, agentsOfTheColour, blight, fire, transfiguration, lockedDoors, rats]
		}
	]
};

export const theSilentHeathScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheSilentHeath,
	setups: [
		{
			shuffles: [
				theSilentHeath,
				agentsOfTheColour,
				blight,
				horrorsInTheRock,
				refractions,
				transfiguration,
				strikingFear
			]
		}
	]
};

export const theLostSisterScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheLostSister,
	setups: [
		{
			shuffles: [theLostSister, blight, horrorsInTheRock, mutations, myconids]
		}
	]
};

export const theThingInTheDepthsScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheThingInTheDepths,
	setups: [
		{
			shuffles: [theThingInTheDepths, blight, theForest, mutations]
		}
	]
};

export const theTwistedHollowScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheTwistedHollow,
	setups: [
		{
			shuffles: [theFirstDay, theTwistedHollow, theForest, myconids]
		}
	]
};

export const theLongestNightScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheLongestNight,
	setups: [
		{
			shuffles: [
				theSecondDay,
				theLongestNight,
				blight,
				transfiguration,
				fire,
				chillingCold,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theMidnightMasks,
				what: 'Only gather the treachery cards. Do not gather the locations, acts, agendas, or enemies from this set.'
			}
		]
	}
};

export const fateOfTheValeScenario: Scenario = {
	kohakuScenario: KohakuScenario.FateOfTheVale,
	setups: [
		{
			shuffles: [
				theFinalDay,
				fateOfTheVale,
				dayOfTheFeast,
				agentsOfTheColour,
				fire,
				horrorsInTheRock,
				refractions,
				residents,
				transfiguration,
				theVale
			]
		}
	]
};
