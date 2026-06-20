import { type Scenario } from '$lib/core/campaign';
import {
	ChaosToken,
	EncounterSet as KohakuEncounterSet,
	Scenario as KohakuScenario
} from '@5argon/arkham-kohaku';

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
	]
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
				what: 'Place 1 clue on each of ***Bystander*** assets, plus 1 [per_investigator] additional clue.'
			},
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
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Sebastien Moreau**']
			}
		],
		notes: [
			{
				what: 'If **Sebastien Moreau** is under **VIPs Interviewed**: place 1 [per_investigator] clues on **Entry Hall**.'
			},
			{
				encounterSet: echoesOfThePast,
				what: 'The **Seeker of Carcosa** enemies start in play at Historical Society locations rather than shuffled into the deck: 0/1/2/3 for 1/2/3/4 players.'
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
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM2],
			standard: [ChaosToken.TokenM3],
			hard: [ChaosToken.TokenM4],
			expert: [ChaosToken.TokenM5]
		},
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Constance Dumaine**']
			}
		],
		notes: [
			{
				what: 'If **Constance Dumaine** is under **VIPs Interviewed**: each investigator places the top card of their deck facedown as a **Courage** asset (2 sanity).'
			},
			{
				what: 'Set aside two piles: 7 ***Monster*** and 7 ***Possessed*** enemies.'
			},
			{
				encounterSet: theUnspeakableOath,
				what: '2x **Asylum Gorger** ***(Monster)*** and 3x **Haunted Patient** ***(Possessed)*** are set aside.'
			},
			{
				encounterSet: hastursGift,
				what: '2x **Puppet of Hastur** and 2x **Seer of the Sign** ***(Possessed)*** are set aside; only 2x **Dance of the Yellow King** enter the encounter deck.'
			},
			{
				encounterSet: inhabitantsOfCarcosa,
				what: '1x **Beast of Aldebaran** and 2x **Spawn of Hali** ***(Monster)*** are set aside.'
			},
			{
				encounterSet: agentsOfHastur,
				what: '2x **Screeching Byakhee** ***(Monster)*** are set aside; only 2x **The Yellow Sign** enter the encounter deck.'
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
					what: 'Remove 2x **Twin Suns** from the game.'
				},
				{
					encounterSet: theMidnightMasks,
					what: 'Remove 3x **Hunting Shadow** from the game.'
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
					encounterSet: evilPortents,
					what: 'Remove 2x **Black Stars Rise** from the game.'
				},
				{
					encounterSet: theMidnightMasks,
					what: 'Remove 2x **False Lead** from the game.'
				}
			]
		}
	],
	commonSetup: {
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Jordan Perry**']
			}
		],
		notes: [
			{
				what: 'If **Jordan Perry** is under **VIPs Interviewed**: each investigator begins with 3 extra resources and starts at **Montparnasse**.'
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
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Ishimaru Haruko**']
			}
		],
		notes: [
			{
				what: 'If **Ishimaru Haruko** is under **VIPs Interviewed**: remember that “you opened a secret passageway.”'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Starting Location'
			},
			{
				paragraph:
					'Put a random Catacombs location (not the set-aside **Tomb of Shadows** or **Blocked Passage**) into play, Catacombs side faceup, and mark it with a resource token as the starting location. If you awoke inside the Catacombs, use **The Gate to Hell** as the starting location instead. Each investigator begins play there once it is revealed.'
			},
			{
				heading: 'Catacombs Deck'
			},
			{
				bullets: [
					'Shuffle the set-aside **Tomb of Shadows**, **Blocked Passage**, and 3 other random Catacombs locations to form the bottom 5 cards, Catacombs side faceup.',
					'Place every remaining Catacombs location on top in random order, all showing only the Catacombs side.'
				]
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
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Ashleigh Clarke**']
			}
		],
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
				what: 'If **Ashleigh Clarke** is under **VIPs Interviewed**: once per game, an investigator may remove 1 doom from an agenda in play as a [fast] ability. Use the back of this card as a reminder.'
			},
			{
				encounterSet: inhabitantsOfCarcosa,
				what: 'The **Beast of Aldebaran** is set aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Ashleigh’s Information'
			},
			{
				paragraph:
					'[fast] If **Ashleigh Clarke** is under **VIPs Interviewed**: Remove 1 doom from an agenda in play. (Limit once per game.)'
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
				what: 'Add starting doom to agenda 1a from your **Chasing the Stranger** tally: 3 doom (0 to 2), 2 doom (3 to 5), 1 doom (6 to 8), or none (9+).'
			},
			{
				what: 'Each investigator takes direct horror equal to half their sanity, rounded down (cannot be prevented). In the Realm of Carcosa, horror cannot defeat investigators.'
			},
			{
				encounterSet: inhabitantsOfCarcosa,
				what: 'The **Beast of Aldebaran** is set aside, out of play.'
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
				what: 'Place 1 clue on each of ***Bystander*** assets, plus 1 [per_investigator] additional clue.'
			},
			{
				encounterSet: returnToTheLastKing,
				what: 'The new **Dianne Devine** asset and the **Shocking Display** treachery are set aside; the original Dianne Devine enemy is removed.'
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
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Sebastien Moreau**']
			}
		],
		notes: [
			{
				what: 'If **Sebastien Moreau** is under **VIPs Interviewed**: place 1 [per_investigator] clues on **Entry Hall**.'
			},
			{
				encounterSet: echoesOfThePast,
				what: 'The **Seeker of Carcosa** enemies start in play at Historical Society locations rather than shuffled into the deck: 0/1/2/3 for 1/2/3/4 players.'
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
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM2],
			standard: [ChaosToken.TokenM3],
			hard: [ChaosToken.TokenM4],
			expert: [ChaosToken.TokenM5]
		},
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Constance Dumaine**']
			}
		],
		notes: [
			{
				what: 'If **Constance Dumaine** is under **VIPs Interviewed**: each investigator places the top card of their deck facedown as a **Courage** asset (2 sanity).'
			},
			{
				what: 'Set aside two piles: 7 ***Monster*** and 7 ***Possessed*** enemies.'
			},
			{
				encounterSet: returnToTheUnspeakableOath,
				what: '**Clouded Memory** is shuffled into the encounter deck (**Host of Insanity** and **Radical Treatment** are set aside).'
			},
			{
				encounterSet: theUnspeakableOath,
				what: '2x **Asylum Gorger** ***(Monster)*** and 3x **Haunted Patient** ***(Possessed)*** are set aside.'
			},
			{
				encounterSet: hastursEnvoys,
				what: '2x **Preying Byakhee** ***(Monster)*** are set aside; only 2x **The Sign of Hastur** enter the encounter deck.'
			},
			{
				encounterSet: hastursGift,
				what: '2x **Puppet of Hastur** and 2x **Seer of the Sign** ***(Possessed)*** are set aside; only 2x **Dance of the Yellow King** enter the encounter deck.'
			},
			{
				encounterSet: inhabitantsOfCarcosa,
				what: '1x **Beast of Aldebaran** and 2x **Spawn of Hali** ***(Monster)*** are set aside.'
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
					what: 'Remove 2x **Twin Suns** from the game.'
				},
				{
					encounterSet: theMidnightMasks,
					what: 'Remove 3x **Hunting Shadow** from the game.'
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
					encounterSet: evilPortents,
					what: 'Remove 2x **Black Stars Rise** from the game.'
				},
				{
					encounterSet: theMidnightMasks,
					what: 'Remove 2x **False Lead** from the game.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'If **Jordan Perry** is under **VIPs Interviewed**: each investigator begins with 3 extra resources and starts at **Montparnasse**.'
			},
			{
				encounterSet: returnToAPhantomOfTruth,
				what: '2x **Figure in the Shadows** are set aside, out of play.'
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
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Ishimaru Haruko**']
			}
		],
		notes: [
			{
				what: 'If **Ishimaru Haruko** is under **VIPs Interviewed**: remember that “you opened a secret passageway.”'
			},
			{
				encounterSet: returnToThePallidMask,
				what: '**Malformed Skeleton** is shuffled into the encounter deck.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Starting Location'
			},
			{
				paragraph:
					'Put a random Catacombs location (not the set-aside **Tomb of Shadows** or **Blocked Passage**) into play, Catacombs side faceup, and mark it with a resource token as the starting location. If you awoke inside the Catacombs, use **The Gate to Hell** as the starting location instead. Each investigator begins play there once it is revealed.'
			},
			{
				heading: 'Catacombs Deck'
			},
			{
				bullets: [
					'Shuffle the set-aside **Tomb of Shadows**, **Blocked Passage**, and 3 other random Catacombs locations to form the bottom 5 cards, Catacombs side faceup.',
					'Place every remaining Catacombs location on top in random order, all showing only the Catacombs side.'
				]
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
		specialGather: [
			{
				encounterSet: theLastKing,
				what: ['**Ashleigh Clarke**']
			}
		],
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
				what: 'If **Ashleigh Clarke** is under **VIPs Interviewed**: once per game, an investigator may remove 1 doom from an agenda in play as a [fast] ability. Use the back of this card as a reminder.'
			},
			{
				encounterSet: returnToBlackStarsRise,
				what: '**Hastur’s Gaze** and **Hastur’s Grasp** are shuffled into the encounter deck.'
			},
			{
				encounterSet: inhabitantsOfCarcosa,
				what: 'The **Beast of Aldebaran** is set aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Ashleigh’s Information'
			},
			{
				paragraph:
					'[fast] If **Ashleigh Clarke** is under **VIPs Interviewed**: Remove 1 doom from an agenda in play. (Limit once per game.)'
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
				what: 'Add starting doom to agenda 1a from your **Chasing the Stranger** tally: 3 doom (0 to 2), 2 doom (3 to 5), 1 doom (6 to 8), or none (9+).'
			},
			{
				what: 'Each investigator takes direct horror equal to half their sanity, rounded down (cannot be prevented). In the Realm of Carcosa, horror cannot defeat investigators.'
			},
			{
				encounterSet: returnToDimCarcosa,
				what: '**High Priest of Hastur** is shuffled into the encounter deck.'
			},
			{
				encounterSet: inhabitantsOfCarcosa,
				what: 'The **Beast of Aldebaran** is set aside, out of play.'
			}
		]
	}
};
