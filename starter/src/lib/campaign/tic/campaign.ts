import {
	aLightInTheFogScenario,
	devilReefScenario,
	horrorInHighGearScenario,
	inTooDeepScenario,
	intoTheMaelstromScenario,
	theLairOfDagonScenario,
	thePitOfDespairScenario,
	theVanishingOfElinaHarperScenario
} from '$lib/campaign/tic/scenario';
import type { Campaign } from '$lib/core/campaign';

export const theInnsmouthConspiracyCampaign: Campaign = {
	scenarios: [
		aLightInTheFogScenario,
		devilReefScenario,
		horrorInHighGearScenario,
		inTooDeepScenario,
		intoTheMaelstromScenario,
		theLairOfDagonScenario,
		thePitOfDespairScenario,
		theVanishingOfElinaHarperScenario
	],
	commonEncounterSets: [],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};
