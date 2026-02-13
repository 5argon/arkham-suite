import {
	cityOfTheElderThings1Scenario,
	cityOfTheElderThings2Scenario,
	cityOfTheElderThings3Scenario,
	fatalMirageScenario,
	iceAndDeathPart1Scenario,
	iceAndDeathPart2Scenario,
	iceAndDeathPart3Scenario,
	theHeartOfMadness1Scenario,
	theHeartOfMadness2Scenario,
	toTheForbiddenPeaksScenario
} from '$lib/campaign/eote/scenario';
import { type Campaign } from '$lib/core/campaign';
import { ChaosToken } from '@5argon/arkham-kohaku';

import { expeditionTeam, memorialsOfTheLost, tekelili } from './encounter';

export const edgeOfTheEarthCampaign: Campaign = {
	scenarios: [
		cityOfTheElderThings1Scenario,
		cityOfTheElderThings2Scenario,
		cityOfTheElderThings3Scenario,
		fatalMirageScenario,
		iceAndDeathPart1Scenario,
		iceAndDeathPart2Scenario,
		iceAndDeathPart3Scenario,
		theHeartOfMadness1Scenario,
		theHeartOfMadness2Scenario,
		toTheForbiddenPeaksScenario
	],
	commonEncounterSets: [tekelili, expeditionTeam, memorialsOfTheLost],
	startingChaosBag: {
		easy: [
			ChaosToken.TokenP1,
			ChaosToken.TokenP1,
			ChaosToken.TokenP1,
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenCultist,
			ChaosToken.TokenTablet,
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
			ChaosToken.TokenFrost,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenCultist,
			ChaosToken.TokenTablet,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		],
		hard: [
			ChaosToken.Token0,
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenM3,
			ChaosToken.TokenM4,
			ChaosToken.TokenM4,
			ChaosToken.TokenM5,
			ChaosToken.TokenFrost,
			ChaosToken.TokenFrost,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenCultist,
			ChaosToken.TokenTablet,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		],
		expert: [
			ChaosToken.Token0,
			ChaosToken.TokenM1,
			ChaosToken.TokenM2,
			ChaosToken.TokenM2,
			ChaosToken.TokenM3,
			ChaosToken.TokenM4,
			ChaosToken.TokenM4,
			ChaosToken.TokenM5,
			ChaosToken.TokenM7,
			ChaosToken.TokenFrost,
			ChaosToken.TokenFrost,
			ChaosToken.TokenFrost,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenCultist,
			ChaosToken.TokenTablet,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		]
	}
};
