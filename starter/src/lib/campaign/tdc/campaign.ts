import type { Campaign } from '$lib/core/campaign';

import {
	courtOfTheAncientsScenario,
	obsidianCanyonsScenario,
	oneLastJobScenario,
	sepulchreOfTheSleeperScenario,
	theApiaryScenario,
	theDoomOfArkhamScenario,
	theDrownedQuarterScenario,
	theGrandVaultScenario,
	theWesternWallScenario
} from './scenario';

export const theDrownedCityCampaign: Campaign = {
	scenarios: [
		oneLastJobScenario,
		theWesternWallScenario,
		theDrownedQuarterScenario,
		theApiaryScenario,
		theGrandVaultScenario,
		courtOfTheAncientsScenario,
		obsidianCanyonsScenario,
		sepulchreOfTheSleeperScenario,
		theDoomOfArkhamScenario
	]
};
