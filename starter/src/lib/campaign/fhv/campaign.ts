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
		easy: [], // TODO: Add chaos bag tokens
		standard: [], // TODO: Add chaos bag tokens
		hard: [], // TODO: Add chaos bag tokens
		expert: [] // TODO: Add chaos bag tokens
	}
};
