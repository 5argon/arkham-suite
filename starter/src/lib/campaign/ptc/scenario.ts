import { type Scenario } from '$lib/core/campaign';
import { ChaosToken, EncounterSet as KohakuEncounterSet, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
	kohakuScenario: KohakuScenario.CurtainCall,
	shortName: 'I',
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
	],
	commonSetup: {
		notes: [
			{
				encounterSet: curtainCall,
				what: 'None of this set enters the deck: **The Man in the Pallid Mask** and **Royal Emissary** are set aside, and its locations are placed in play.'
			}
		]
	}
};

export const theLastKingScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheLastKing,
	shortName: 'II',
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
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theLastKing,
				what: 'The **Dianne Devine** enemy is set aside, out of play.'
			}
		]
	}
};

export const echoesOfThePastScenario: Scenario = {
	kohakuScenario: KohakuScenario.EchoesOfThePast,
	shortName: 'III',
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
	],
	commonSetup: {
		notes: [
			{
				encounterSet: echoesOfThePast,
				what: '**Hidden Library**, **Possessed Oathspeaker**, **Mr. Peabody**, **The Tattered Cloak**, and **Clasp of Black Onyx** are set aside, out of play.'
			}
		]
	}
};

export const theUnspeakableOathScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheUnspeakableOath,
	shortName: 'IV',
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
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theUnspeakableOath,
				what: 'All **Monster**, **Possessed**, and **Lunatic** enemies (7 of each) are set aside in separate piles; **Daniel Chesterfield** and the **Patient Confinement** locations are also set aside.'
			}
		]
	}
};

export const aPhantomOfTruthScenario: Scenario = {
	kohakuScenario: KohakuScenario.APhantomOfTruth,
	shortName: 'V',
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
			],
			notes: [
				{
					encounterSet: aPhantomOfTruth,
					what: 'Remove both **Twin Suns** and 3x **Hunting Shadow** from the game.'
				}
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
			],
			notes: [
				{
					encounterSet: aPhantomOfTruth,
					what: 'Remove both **Black Stars Rise** and both **False Lead**.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: aPhantomOfTruth,
				what: 'The double-sided **The Organist** is set aside, out of play.'
			}
		]
	}
};

export const thePallidMaskScenario: Scenario = {
	kohakuScenario: KohakuScenario.ThePallidMask,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: thePallidMask, overwriteCount: 15 },
				chillingCold,
				ghouls,
				hauntings
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: thePallidMask,
				what: 'The **Tomb of Shadows** and **Blocked Passage** Catacombs locations and **The Man in the Pallid Mask** weakness are set aside, out of play.'
			}
		]
	}
};

export const blackStarsRiseScenario: Scenario = {
	kohakuScenario: KohakuScenario.BlackStarsRise,
	shortName: 'VII',
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
		],
		notes: [
			{
				encounterSet: blackStarsRise,
				what: 'Both act 3 cards, the **Beast of Aldebaran**, each **Tidal Terror**, each **Rift Seeker**, and the **Cloister** and **Knight** locations are set aside, out of play.'
			}
		]
	}
};

export const dimCarcosaScenario: Scenario = {
	kohakuScenario: KohakuScenario.DimCarcosa,
	shortName: 'VIII',
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
	],
	commonSetup: {
		notes: [
			{
				encounterSet: dimCarcosa,
				what: 'All three **Hastur** versions and the **Beast of Aldebaran** are set aside, out of play.'
			}
		]
	}
};

export const returnToCurtainCallScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToCurtainCall,
	shortName: 'I',
	setups: [
		{
			shuffles: [
				{ encounterSet: curtainCall, overwriteCount: 0 },
				{ encounterSet: returnToCurtainCall, overwriteCount: 1 },
				rats,
				cultOfTheYellowSign,
				evilPortents,
				hauntings,
				maddeningDelusions,
				neuroticFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: curtainCall,
				what: 'None of this set enters the deck: **The Man in the Pallid Mask** and **Royal Emissary** are set aside, and its locations are placed in play.'
			},
			{
				encounterSet: returnToCurtainCall,
				what: '**La Comtesse** is shuffled into the encounter deck.'
			}
		]
	}
};

export const returnToTheLastKingScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheLastKing,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: theLastKing, overwriteCount: 4 },
				{ encounterSet: returnToTheLastKing, overwriteCount: 2 },
				hastursGift,
				theStranger,
				decayingReality,
				delusoryEvils
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theLastKing,
				what: 'The new **Dianne Devine** ally and the **Shocking Display** treachery are set aside; the original Dianne Devine enemy is removed.'
			},
			{
				encounterSet: returnToTheLastKing,
				what: '2x **Crazed Guest** are shuffled into the encounter deck.'
			}
		]
	}
};

export const returnToEchoesOfThePastScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToEchoesOfThePast,
	shortName: 'III',
	setups: [
		{
			name: '4 Players',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 5 },
				{ encounterSet: returnToEchoesOfThePast, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				maddeningDelusions
			]
		},
		{
			name: '3 Players',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 6 },
				{ encounterSet: returnToEchoesOfThePast, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				maddeningDelusions
			]
		},
		{
			name: '2 Players',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 7 },
				{ encounterSet: returnToEchoesOfThePast, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				maddeningDelusions
			]
		},
		{
			name: '1 Player',
			shuffles: [
				{ encounterSet: echoesOfThePast, overwriteCount: 8 },
				{ encounterSet: returnToEchoesOfThePast, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				cultOfTheYellowSign,
				maddeningDelusions
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: echoesOfThePast,
				what: '**Hidden Library**, **Possessed Oathspeaker**, **Mr. Peabody**, **The Tattered Cloak**, and **Clasp of Black Onyx** are set aside, out of play.'
			}
		]
	}
};

export const returnToTheUnspeakableOathScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheUnspeakableOath,
	shortName: 'IV',
	setups: [
		{
			shuffles: [
				{ encounterSet: theUnspeakableOath, overwriteCount: 7 },
				{ encounterSet: returnToTheUnspeakableOath, overwriteCount: 1 },
				{ encounterSet: hastursGift, overwriteCount: 2 },
				{ encounterSet: hastursEnvoys, overwriteCount: 2 },
				decayingReality,
				maddeningDelusions
			],
			remaining: [inhabitantsOfCarcosa]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theUnspeakableOath,
				what: 'All **Monster**, **Possessed**, and **Lunatic** enemies (7 of each) are set aside in separate piles; **Daniel Chesterfield**, **Host of Insanity**, **Radical Treatment**, and **Patient Confinement** are also set aside.'
			},
			{
				encounterSet: returnToTheUnspeakableOath,
				what: '**Clouded Memory** is shuffled into the encounter deck (**Host of Insanity** and **Radical Treatment** are set aside).'
			}
		]
	}
};

export const returnToAPhantomOfTruthScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToAPhantomOfTruth,
	shortName: 'V',
	setups: [
		{
			name: 'Doubt',
			shuffles: [
				{ encounterSet: aPhantomOfTruth, overwriteCount: 10 },
				{ encounterSet: returnToAPhantomOfTruth, overwriteCount: 0 },
				{ encounterSet: theMidnightMasks, overwriteCount: 2 },
				byakhee,
				evilPortents,
				theStranger,
				hastursEnvoys
			],
			notes: [
				{
					encounterSet: aPhantomOfTruth,
					what: 'Remove **Twin Suns** and **Hunting Shadow**.'
				}
			]
		},
		{
			name: 'Conviction',
			shuffles: [
				{ encounterSet: aPhantomOfTruth, overwriteCount: 12 },
				{ encounterSet: returnToAPhantomOfTruth, overwriteCount: 0 },
				{ encounterSet: theMidnightMasks, overwriteCount: 3 },
				byakhee,
				{ encounterSet: evilPortents, overwriteCount: 4 },
				theStranger,
				hastursEnvoys
			],
			notes: [
				{
					encounterSet: aPhantomOfTruth,
					what: 'Remove **Black Stars Rise** and **False Lead**.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: aPhantomOfTruth,
				what: 'The double-sided **The Organist** and both **Figure in the Shadows** are set aside, out of play.'
			}
		]
	}
};

export const returnToThePallidMaskScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToThePallidMask,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: thePallidMask, overwriteCount: 15 },
				{ encounterSet: returnToThePallidMask, overwriteCount: 1 },
				chillingCold,
				ghouls,
				hauntings
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: thePallidMask,
				what: 'The **Tomb of Shadows** and **Blocked Passage** Catacombs locations and **The Man in the Pallid Mask** weakness are set aside, out of play.'
			},
			{
				encounterSet: returnToThePallidMask,
				what: '**Malformed Skeleton** is shuffled into the encounter deck.'
			}
		]
	}
};

export const returnToBlackStarsRiseScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToBlackStarsRise,
	shortName: 'VII',
	setups: [
		{
			shuffles: [
				{ encounterSet: blackStarsRise, overwriteCount: 6 },
				{ encounterSet: returnToBlackStarsRise, overwriteCount: 2 },
				darkCult,
				byakhee,
				evilPortents,
				{ encounterSet: inhabitantsOfCarcosa, overwriteCount: 2 },
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
		],
		notes: [
			{
				encounterSet: blackStarsRise,
				what: 'Both act 3 cards, the **Beast of Aldebaran**, each **Tidal Terror**, each **Rift Seeker**, and the **Cloister** and **Knight** locations are set aside, out of play.'
			},
			{
				encounterSet: returnToBlackStarsRise,
				what: '**Hastur’s Gaze** and **Hastur’s Grasp** are shuffled into the encounter deck.'
			}
		]
	}
};

export const returnToDimCarcosaScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToDimCarcosa,
	shortName: 'VIII',
	setups: [
		{
			shuffles: [
				{ encounterSet: dimCarcosa, overwriteCount: 11 },
				{ encounterSet: returnToDimCarcosa, overwriteCount: 1 },
				cultOfTheYellowSign,
				{ encounterSet: inhabitantsOfCarcosa, overwriteCount: 2 },
				hastursEnvoys,
				maddeningDelusions,
				neuroticFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: dimCarcosa,
				what: 'All three **Hastur** versions and the **Beast of Aldebaran** are set aside, out of play.'
			},
			{
				encounterSet: returnToDimCarcosa,
				what: '**High Priest of Hastur** is shuffled into the encounter deck.'
			}
		]
	}
};
