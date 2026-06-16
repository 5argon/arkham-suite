import {
	fateOfTheValeScenario,
	hemlockHouseScenario,
	theLongestNightScenario,
	theLostSisterScenario,
	theSilentHeathScenario,
	theThingInTheDepthsScenario,
	theTwistedHollowScenario,
	writtenInRockScenario
} from '$lib/campaign/fhv/scenario';
import type { Campaign } from '$lib/core/campaign';
import { ChaosToken } from '@5argon/arkham-kohaku';

import {
	dayOfRain,
	dayOfRest,
	dayOfTheFeast,
	theFinalDay,
	theFirstDay,
	theSecondDay
} from './encounter';

export const theFeastOfHemlockValeCampaign: Campaign = {
	scenarios: [
		fateOfTheValeScenario,
		theLongestNightScenario,
		theSilentHeathScenario,
		hemlockHouseScenario,
		theLostSisterScenario,
		theThingInTheDepthsScenario,
		theTwistedHollowScenario,
		writtenInRockScenario
	],
	commonEncounterSets: [
		theFirstDay,
		theSecondDay,
		theFinalDay,
		dayOfRest,
		dayOfRain,
		dayOfTheFeast
	],
	startingChaosBag: {
		easy: [
			ChaosToken.TokenP1,
			ChaosToken.TokenP1,
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenM3,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenElderSign
		],
		standard: [
			ChaosToken.TokenP1,
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenM3,
			ChaosToken.TokenM3,
			ChaosToken.TokenM4,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenElderSign
		],
		hard: [
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenM3,
			ChaosToken.TokenM3,
			ChaosToken.TokenM5,
			ChaosToken.TokenM5,
			ChaosToken.TokenM7,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenElderSign
		],
		expert: [
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenM3,
			ChaosToken.TokenM3,
			ChaosToken.TokenM4,
			ChaosToken.TokenM5,
			ChaosToken.TokenM5,
			ChaosToken.TokenM6,
			ChaosToken.TokenM6,
			ChaosToken.TokenM8,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenElderSign
		]
	}
};
