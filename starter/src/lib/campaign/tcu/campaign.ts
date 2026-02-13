import {
	atDeathsDoorstepScenario,
	beforeTheBlackThroneScenario,
	disappearanceAtTheTwilightEstateScenario,
	forTheGreaterGoodScenario,
	inTheClutchesOfChaosScenario,
	returnToAtDeathsDoorstepScenario,
	returnToBeforeTheBlackThroneScenario,
	returnToDisappearanceAtTheTwilightEstateScenario,
	returnToForTheGreaterGoodScenario,
	returnToInTheClutchesOfChaos1Scenario,
	returnToInTheClutchesOfChaos2Scenario,
	returnToTheSecretNameScenario,
	returnToTheWagesOfSinScenario,
	returnToTheWitchingHourScenario,
	returnToUnionAndDisillusionScenario,
	theSecretNameScenario,
	theWagesOfSinScenario,
	theWitchingHourScenario,
	unionAndDisillusionScenario
} from '$lib/campaign/tcu/scenario';
import type { Campaign } from '$lib/core/campaign';

export const theCircleUndoneCampaign: Campaign = {
	scenarios: [
		atDeathsDoorstepScenario,
		beforeTheBlackThroneScenario,
		disappearanceAtTheTwilightEstateScenario,
		forTheGreaterGoodScenario,
		inTheClutchesOfChaosScenario,
		theSecretNameScenario,
		theWagesOfSinScenario,
		theWitchingHourScenario,
		unionAndDisillusionScenario
	],
	commonEncounterSets: [],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};

export const returnToTheCircleUndoneCampaign: Campaign = {
	commonEncounterSets: [],
	scenarios: [
		returnToAtDeathsDoorstepScenario,
		returnToBeforeTheBlackThroneScenario,
		returnToDisappearanceAtTheTwilightEstateScenario,
		returnToForTheGreaterGoodScenario,
		returnToInTheClutchesOfChaos1Scenario,
		returnToInTheClutchesOfChaos2Scenario,
		returnToTheSecretNameScenario,
		returnToTheWagesOfSinScenario,
		returnToTheWitchingHourScenario,
		returnToUnionAndDisillusionScenario
	],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};
