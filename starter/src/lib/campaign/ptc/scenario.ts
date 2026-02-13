import { type Scenario } from '$lib/core/campaign';
import { ChaosToken, EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

import {
	agentsOfHastur,
	ancientEvils,
	chillingCold,
	darkCult,
	ghouls,
	lockedDoors,
	rats,
	strikingFear,
	theMidnightMasks
} from '../notz/encounter';
import {
	aPhantomOfTruth,
	blackStarsRise,
	byakhee,
	cultOfTheYellowSign,
	curtainCall,
	decayAndFilth,
	decayingReality,
	delusions,
	delusoryEvils,
	dimCarcosa,
	echoesOfThePast,
	evilPortents,
	hastursEnvoys,
	hastursGift,
	hauntings,
	inhabitantsOfCarcosa,
	maddeningDelusions,
	neuroticFear,
	returnToAPhantomOfTruth,
	returnToBlackStarsRise,
	returnToCurtainCall,
	returnToDimCarcosa,
	returnToEchoesOfThePast,
	returnToTheLastKing,
	returnToThePallidMask,
	returnToTheUnspeakableOath,
	theFloodBelow,
	theLastKing,
	thePallidMask,
	theStranger,
	theUnspeakableOath,
	theVortexAbove
} from './encounter';

export const curtainCallScenario: Scenario = {
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.CurtainCall,
	setups: [
		{
			shuffles: [
				{ encounterSet: curtainCall, overwriteCount: 0 },
				rats,
				strikingFear,
				cultOfTheYellowSign,
				delusions,
				evilPortents,
				hauntings
			]
		}
	]
};

export const theLastKingScenario: Scenario = {
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.TheLastKing,
	setups: [
		{
			shuffles: [
				{ encounterSet: theLastKing, overwriteCount: 4 },
				ancientEvils,
				decayAndFilth,
				hastursGift,
				theStranger
			]
		}
	]
};

export const echoesOfThePastScenario: Scenario = {
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.EchoesOfThePast,
	setups: [
		{
			name: '4 Players',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 5 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				delusions
			]
		},
		{
			name: '3 Players',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 6 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				delusions
			]
		},
		{
			name: '2 Players',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 7 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				delusions
			]
		},
		{
			name: '1 Player',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 8 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				delusions
			]
		}
	]
};

export const theUnspeakableOathScenario: Scenario = {
	index: 4,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.TheUnspeakableOath,
	setups: [
		{
			shuffles: [
				{ encounterSet: theUnspeakableOath, overwriteCount: 7 },
				{ encounterSet: agentsOfHastur, overwriteCount: 2 },
				decayAndFilth,
				delusions,
				{ encounterSet: hastursGift, overwriteCount: 2 }
			],
			remaining: [inhabitantsOfCarcosa]
		}
	]
};

export const aPhantomOfTruthScenario: Scenario = {
	index: 5,
	shortName: 'V',
	representativeSet: KohakuEncounterSet.APhantomOfTruth,
	setups: [
		{
			name: 'Doubt',
			shuffles: [
				{ encounterSet: aPhantomOfTruth, overwriteCount: 10 },
				agentsOfHastur,
				{ encounterSet: theMidnightMasks, overwriteCount: 2 },
				byakhee,
				evilPortents,
				theStranger
			]
		},
		{
			name: 'Conviction',
			shuffles: [
				{ encounterSet: aPhantomOfTruth, overwriteCount: 12 },
				agentsOfHastur,
				{ encounterSet: theMidnightMasks, overwriteCount: 3 },
				byakhee,
				{ encounterSet: evilPortents, overwriteCount: 4 },
				theStranger
			]
		}
	]
};

export const thePallidMaskScenario: Scenario = {
	index: 6,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.ThePallidMask,
	setups: [
		{
			shuffles: [
				{ encounterSet: thePallidMask, overwriteCount: 15 },
				chillingCold,
				ghouls,
				hauntings
			]
		}
	]
};

export const blackStarsRiseScenario: Scenario = {
	index: 7,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.BlackStarsRise,
	setups: [
		{
			shuffles: [
				{ encounterSet: blackStarsRise, overwriteCount: 6 },
				ancientEvils,
				darkCult,
				byakhee,
				evilPortents,
				{ encounterSet: inhabitantsOfCarcosa, overwriteCount: 2 },
				theStranger
			],
			remaining: [theFloodBelow, theVortexAbove]
		}
	],
	commonSetup: {
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM3],
			standard: [ChaosToken.TokenM5],
			hard: [ChaosToken.TokenM6],
			expert: [ChaosToken.TokenM7]
		},
		addBasicWeakness: [
			{ trait: 'Madness' },
			{ trait: 'Pact' },
			{ trait: 'Cultist' },
			{ trait: 'Detective' }
		]
	}
};

export const dimCarcosaScenario: Scenario = {
	index: 8,
	shortName: 'VIII',
	representativeSet: KohakuEncounterSet.DimCarcosa,
	setups: [
		{
			shuffles: [
				{ encounterSet: dimCarcosa, overwriteCount: 11 },
				agentsOfHastur,
				strikingFear,
				cultOfTheYellowSign,
				delusions,
				{ encounterSet: inhabitantsOfCarcosa, overwriteCount: 2 }
			]
		}
	]
};

export const returnToCurtainCallScenario: Scenario = {
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.ReturnToCurtainCall,
	setups: [
		{
			shuffles: [
				{ encounterSet: curtainCall, overwriteCount: 0 },
				{ encounterSet: returnToCurtainCall, overwriteCount: 0 },
				rats,
				cultOfTheYellowSign,
				evilPortents,
				hauntings,
				maddeningDelusions,
				neuroticFear
			]
		}
	]
};

export const returnToTheLastKingScenario: Scenario = {
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.ReturnToTheLastKing,
	setups: [
		{
			shuffles: [
				{ encounterSet: theLastKing, overwriteCount: 0 },
				{ encounterSet: returnToTheLastKing, overwriteCount: 0 },
				hastursGift,
				theStranger,
				decayingReality,
				delusoryEvils
			]
		}
	]
};

export const returnToEchoesOfThePastScenario: Scenario = {
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.ReturnToEchoesOfThePast,
	setups: [
		{
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 0 },
				{ encounterSet: returnToEchoesOfThePast, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				maddeningDelusions
			]
		}
	]
};

export const returnToTheUnspeakableOathScenario: Scenario = {
	index: 4,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.ReturnToTheUnspeakableOath,
	setups: [
		{
			shuffles: [
				{ encounterSet: theUnspeakableOath, overwriteCount: 0 },
				{ encounterSet: returnToTheUnspeakableOath, overwriteCount: 0 },
				hastursGift,
				inhabitantsOfCarcosa,
				decayingReality,
				hastursEnvoys,
				maddeningDelusions
			]
		}
	]
};

export const returnToAPhantomOfTruthScenario: Scenario = {
	index: 5,
	shortName: 'V',
	representativeSet: KohakuEncounterSet.ReturnToAPhantomOfTruth,
	setups: [
		{
			shuffles: [
				{ encounterSet: aPhantomOfTruth, overwriteCount: 0 },
				{ encounterSet: returnToAPhantomOfTruth, overwriteCount: 0 },
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				byakhee,
				evilPortents,
				theStranger,
				hastursEnvoys
			]
		}
	]
};

export const returnToThePallidMaskScenario: Scenario = {
	index: 6,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.ReturnToThePallidMask,
	setups: [
		{
			shuffles: [
				{ encounterSet: thePallidMask, overwriteCount: 0 },
				{ encounterSet: returnToThePallidMask, overwriteCount: 0 },
				chillingCold,
				ghouls,
				hauntings
			]
		}
	]
};

export const returnToBlackStarsRiseScenario: Scenario = {
	index: 7,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.ReturnToBlackStarsRise,
	setups: [
		{
			shuffles: [
				{ encounterSet: blackStarsRise, overwriteCount: 0 },
				{ encounterSet: returnToBlackStarsRise, overwriteCount: 0 },
				darkCult,
				byakhee,
				evilPortents,
				inhabitantsOfCarcosa,
				theStranger,
				delusoryEvils
			],
			remaining: [theFloodBelow, theVortexAbove]
		}
	],
	commonSetup: {
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM3],
			standard: [ChaosToken.TokenM5],
			hard: [ChaosToken.TokenM6],
			expert: [ChaosToken.TokenM7]
		},
		addBasicWeakness: [
			{ trait: 'Madness' },
			{ trait: 'Pact' },
			{ trait: 'Cultist' },
			{ trait: 'Detective' }
		]
	}
};

export const returnToDimCarcosaScenario: Scenario = {
	index: 8,
	shortName: 'VIII',
	representativeSet: KohakuEncounterSet.ReturnToDimCarcosa,
	setups: [
		{
			shuffles: [
				{ encounterSet: dimCarcosa, overwriteCount: 0 },
				{ encounterSet: returnToDimCarcosa, overwriteCount: 0 },
				cultOfTheYellowSign,
				inhabitantsOfCarcosa,
				hastursEnvoys,
				maddeningDelusions,
				neuroticFear
			]
		}
	]
};
