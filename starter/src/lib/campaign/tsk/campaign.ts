import {
	congressOfTheKeysScenario,
	dancingMadScenario,
	deadHeatScenario,
	dealingsInTheDarkScenario,
	dogsOfWarScenario,
	onThinIceScenario,
	riddlesAndRainScenario,
	sanguineShadowsScenario,
	shadesOfSufferingScenario,
	withoutATraceScenario
} from '$lib/campaign/tsk/scenario';
import type { Campaign } from '$lib/core/campaign';

import { globetrotting, redCoterie } from './encounter';

export const theScarletKeysCampaign: Campaign = {
	scenarios: [
		congressOfTheKeysScenario,
		dancingMadScenario,
		deadHeatScenario,
		dealingsInTheDarkScenario,
		dogsOfWarScenario,
		onThinIceScenario,
		riddlesAndRainScenario,
		sanguineShadowsScenario,
		shadesOfSufferingScenario,
		withoutATraceScenario
	],
	commonEncounterSets: [globetrotting, redCoterie],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};
