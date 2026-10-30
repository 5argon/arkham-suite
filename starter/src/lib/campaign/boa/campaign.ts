import type { Campaign } from '$lib/core/campaign';
import { ChaosToken } from '@5argon/arkham-kohaku';

import { queenOfAshScenario, smokeAndMirrorsScenario, spreadingFlamesScenario } from './scenario';

export const brethrenOfAshCampaign: Campaign = {
	scenarios: [spreadingFlamesScenario, smokeAndMirrorsScenario, queenOfAshScenario],
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
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenTablet,
			ChaosToken.TokenElderThing,
			ChaosToken.TokenAutofail,
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
			ChaosToken.TokenM4,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenTablet,
			ChaosToken.TokenElderThing,
			ChaosToken.TokenAutofail,
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
			ChaosToken.TokenM4,
			ChaosToken.TokenM5,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenTablet,
			ChaosToken.TokenElderThing,
			ChaosToken.TokenAutofail,
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
			ChaosToken.TokenM4,
			ChaosToken.TokenM5,
			ChaosToken.TokenM6,
			ChaosToken.TokenM8,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenTablet,
			ChaosToken.TokenElderThing,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		]
	}
};
