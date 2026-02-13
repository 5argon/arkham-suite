import {
	returnToTheDevourerBelowScenario,
	returnToTheGatheringScenario,
	returnToTheMidnightMasksScenario,
	theDevourerBelowScenario,
	theGatheringScenario,
	theMidnightMasksScenario
} from '$lib/campaign/notz/scenario';
import type { Campaign } from '$lib/core/campaign';

export const nightOfTheZealotCampaign: Campaign = {
	scenarios: [theGatheringScenario, theMidnightMasksScenario, theDevourerBelowScenario]
};

export const returnToTheNightOfTheZealotCampaign: Campaign = {
	scenarios: [
		returnToTheGatheringScenario,
		returnToTheMidnightMasksScenario,
		returnToTheDevourerBelowScenario
	]
};
