import {
	heartOfTheEldersPart1Scenario,
	heartOfTheEldersPart2Scenario,
	returnToHeartOfTheEldersPart1Scenario,
	returnToHeartOfTheEldersPart2Scenario,
	returnToShatteredAeonsScenario,
	returnToTheBoundaryBeyondScenario,
	returnToTheCityOfArchivesScenario,
	returnToTheDepthsOfYothScenario,
	returnToTheDoomOfEztliScenario,
	returnToTheUntamedWildsScenario,
	returnToThreadsOfFateScenario,
	shatteredAeonsScenario,
	theBoundaryBeyondScenario,
	theCityOfArchivesScenario,
	theDepthsOfYothScenario,
	theDoomOfEztliScenario,
	theUntamedWildsScenario,
	threadsOfFateScenario
} from '$lib/campaign/tfa/scenario';
import type { Campaign } from '$lib/core/campaign';

export const theForgottenAgeCampaign: Campaign = {
	scenarios: [
		heartOfTheEldersPart1Scenario,
		heartOfTheEldersPart2Scenario,
		shatteredAeonsScenario,
		theBoundaryBeyondScenario,
		theCityOfArchivesScenario,
		theDepthsOfYothScenario,
		theDoomOfEztliScenario,
		theUntamedWildsScenario,
		threadsOfFateScenario
	],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};

export const returnToTheForgottenAgeCampaign: Campaign = {
	scenarios: [
		returnToHeartOfTheEldersPart1Scenario,
		returnToHeartOfTheEldersPart2Scenario,
		returnToShatteredAeonsScenario,
		returnToTheBoundaryBeyondScenario,
		returnToTheCityOfArchivesScenario,
		returnToTheDepthsOfYothScenario,
		returnToTheDoomOfEztliScenario,
		returnToTheUntamedWildsScenario,
		returnToThreadsOfFateScenario
	],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};
