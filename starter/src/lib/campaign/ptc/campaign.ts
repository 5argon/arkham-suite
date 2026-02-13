import {
	aPhantomOfTruthScenario,
	blackStarsRiseScenario,
	curtainCallScenario,
	dimCarcosaScenario,
	echoesOfThePastScenario,
	returnToAPhantomOfTruthScenario,
	returnToBlackStarsRiseScenario,
	returnToCurtainCallScenario,
	returnToDimCarcosaScenario,
	returnToEchoesOfThePastScenario,
	returnToTheLastKingScenario,
	returnToThePallidMaskScenario,
	returnToTheUnspeakableOathScenario,
	theLastKingScenario,
	thePallidMaskScenario,
	theUnspeakableOathScenario
} from '$lib/campaign/ptc/scenario';
import { type Campaign } from '$lib/core/campaign';
import { ChaosToken } from '@5argon/arkham-kohaku';

export const thePathToCarcosaCampaign: Campaign = {
	scenarios: [
		aPhantomOfTruthScenario,
		blackStarsRiseScenario,
		curtainCallScenario,
		dimCarcosaScenario,
		echoesOfThePastScenario,
		theLastKingScenario,
		thePallidMaskScenario,
		theUnspeakableOathScenario
	],
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
			ChaosToken.TokenSkull,
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
			ChaosToken.TokenSkull,
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
			ChaosToken.TokenM4,
			ChaosToken.TokenM5,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
			ChaosToken.TokenSkull,
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
			ChaosToken.TokenSkull,
			ChaosToken.TokenAutofail,
			ChaosToken.TokenElderSign
		]
	}
};

export const returnToThePathToCarcosaCampaign: Campaign = {
	scenarios: [
		returnToAPhantomOfTruthScenario,
		returnToBlackStarsRiseScenario,
		returnToCurtainCallScenario,
		returnToDimCarcosaScenario,
		returnToEchoesOfThePastScenario,
		returnToTheLastKingScenario,
		returnToThePallidMaskScenario,
		returnToTheUnspeakableOathScenario
	],
	commonEncounterSets: [],
	startingChaosBag: {
		easy: [],
		standard: [],
		hard: [],
		expert: []
	}
};
