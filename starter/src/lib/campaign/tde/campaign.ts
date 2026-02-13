import {
	aThousandShapesOfHorrorScenario,
	beyondTheGatesOfSleepScenario,
	darkSideOfTheMoonScenario,
	pointOfNoReturnScenario,
	theSearchForKadathScenario,
	wakingNightmareScenario,
	weaverOfTheCosmosScenario,
	whereTheGodsDwellScenario
} from '$lib/campaign/tde/scenario';
import type { Campaign } from '$lib/core/campaign';

export const theDreamQuestCampaign: Campaign = {
	scenarios: [
		beyondTheGatesOfSleepScenario,
		theSearchForKadathScenario,
		darkSideOfTheMoonScenario,
		whereTheGodsDwellScenario
	],
	commonEncounterSets: [],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};

export const theWebOfDreamsCampaign: Campaign = {
	scenarios: [
		wakingNightmareScenario,
		aThousandShapesOfHorrorScenario,
		pointOfNoReturnScenario,
		weaverOfTheCosmosScenario
	],
	commonEncounterSets: [],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};
