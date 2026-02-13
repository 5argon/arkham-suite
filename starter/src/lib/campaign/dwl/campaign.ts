import { type Campaign } from '$lib/core/campaign';
import { ChaosToken } from '@5argon/arkham-kohaku';

import { armitagesFate } from './encounter';
import {
	bloodOnTheAltarScenario,
	extracurricularActivityScenario,
	lostInTimeAndSpaceScenario,
	returnToBloodOnTheAltarScenario,
	returnToExtracurricularActivityScenario,
	returnToLostInTimeAndSpaceScenario,
	returnToTheEssexCountyExpressScenario,
	returnToTheHouseAlwaysWinsScenario,
	returnToTheMiskatonicMuseumScenario,
	returnToUndimensionedAndUnseenScenario,
	returnToWhereDoomAwaitsScenario,
	theEssexCountyExpressScenario,
	theHouseAlwaysWinsScenario,
	theMiskatonicMuseumScenario,
	undimensionedAndUnseenScenario,
	whereDoomAwaitsScenario
} from './scenario';

export const theDunwichLegacyCampaign: Campaign = {
	scenarios: [
		bloodOnTheAltarScenario,
		extracurricularActivityScenario,
		lostInTimeAndSpaceScenario,
		theEssexCountyExpressScenario,
		theHouseAlwaysWinsScenario,
		theMiskatonicMuseumScenario,
		undimensionedAndUnseenScenario,
		whereDoomAwaitsScenario
	],
	commonEncounterSets: [armitagesFate],
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
			ChaosToken.TokenCultist,
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
			ChaosToken.TokenCultist,
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
			ChaosToken.TokenCultist,
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
			ChaosToken.TokenCultist,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		]
	}
};

export const returnToTheDunwichLegacyCampaign: Campaign = {
	scenarios: [
		returnToBloodOnTheAltarScenario,
		returnToExtracurricularActivityScenario,
		returnToLostInTimeAndSpaceScenario,
		returnToTheEssexCountyExpressScenario,
		returnToTheHouseAlwaysWinsScenario,
		returnToTheMiskatonicMuseumScenario,
		returnToUndimensionedAndUnseenScenario,
		returnToWhereDoomAwaitsScenario
	],
	commonEncounterSets: [armitagesFate],
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
			ChaosToken.TokenCultist,
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
			ChaosToken.TokenCultist,
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
			ChaosToken.TokenCultist,
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
			ChaosToken.TokenCultist,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		]
	}
};
