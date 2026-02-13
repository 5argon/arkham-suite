import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

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
	index: 1,
	representativeSet: KohakuEncounterSet.WrittenInRock,
	setups: [
		{
			shuffles: [writtenInRock, horrorsInTheRock, refractions, chillingCold, ghouls]
		}
	]
};

export const hemlockHouseScenario: Scenario = {
	index: 2,
	representativeSet: KohakuEncounterSet.HemlockHouse,
	setups: [
		{
			shuffles: [hemlockHouse, agentsOfTheColour, blight, fire, transfiguration, lockedDoors, rats]
		}
	]
};

export const theSilentHeathScenario: Scenario = {
	index: 3,
	representativeSet: KohakuEncounterSet.TheSilentHeath,
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
	index: 4,
	representativeSet: KohakuEncounterSet.TheLostSister,
	setups: [
		{
			shuffles: [theLostSister, blight, horrorsInTheRock, mutations, myconids]
		}
	]
};

export const theThingInTheDepthsScenario: Scenario = {
	index: 5,
	representativeSet: KohakuEncounterSet.TheThingInTheDepths,
	setups: [
		{
			shuffles: [theThingInTheDepths, blight, theForest, mutations]
		}
	]
};

export const theTwistedHollowScenario: Scenario = {
	index: 6,
	representativeSet: KohakuEncounterSet.TheTwistedHollow,
	setups: [
		{
			shuffles: [theFirstDay, theTwistedHollow, theForest, myconids]
		}
	]
};

export const theLongestNightScenario: Scenario = {
	index: 7,
	representativeSet: KohakuEncounterSet.TheLongestNight,
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
	index: 8,
	representativeSet: KohakuEncounterSet.FateOfTheVale,
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
