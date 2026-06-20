import type { Scenario } from '$lib/core/campaign';
import {
	EncounterSet as KohakuEncounterSet,
	Scenario as KohakuScenario
} from '@5argon/arkham-kohaku';

import {
	agentsOfShubNiggurath,
	ancientEvils,
	chillingCold,
	darkCult,
	lockedDoors,
	nightgaunts,
	rats,
	strikingFear,
	theDevourerBelow,
	theMidnightMasks
} from '../notz/encounter';
import {
	agentsOfAzathoth,
	anettesCoven,
	atDeathsDoorstep,
	beforeTheBlackThrone,
	bloodthirstySpirits,
	chillingMists,
	cityOfSins,
	cityOfTheDamned,
	disappearanceAtTheTwilightEstate,
	forTheGreaterGood,
	hexcraft,
	impendingEvils,
	inexorableFate,
	inTheClutchesOfChaos,
	musicOfTheDamned,
	realmOfDeath,
	returnToAtDeathsDoorstep,
	returnToBeforeTheBlackThrone,
	returnToDisappearanceAtTheTwilightEstate,
	returnToForTheGreaterGood,
	returnToInTheClutchesOfChaos,
	returnToTheSecretName,
	returnToTheWagesOfSin,
	returnToTheWitchingHour,
	returnToUnionAndDisillusion,
	secretsOfTheUniverse,
	silverTwilightLodge,
	spectralPredators,
	theSecretName,
	theWagesOfSin,
	theWatcher,
	theWitchingHour,
	trappedSpirits,
	unionAndDisillusion,
	unspeakableFate,
	unstableRealm,
	witchcraft
} from './encounter';

export const disappearanceAtTheTwilightEstateScenario: Scenario = {
	kohakuScenario: KohakuScenario.DisappearanceAtTheTwilightEstate,
	shortName: 'P',
	setups: [
		{
			shuffles: [
				{ encounterSet: disappearanceAtTheTwilightEstate, overwriteCount: 0 },
				{ encounterSet: atDeathsDoorstep, overwriteCount: 0 },
				chillingCold,
				inexorableFate,
				realmOfDeath,
				spectralPredators,
				{ encounterSet: theWatcher, overwriteCount: 2 },
				trappedSpirits
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'The starting encounter deck is reduced by setup instructions on the back of investigator cards.'
			},
			{
				encounterSet: atDeathsDoorstep,
				what: 'Only gather 7x *Spectral* locations.'
			},
			{
				encounterSet: theWatcher,
				what: 'Put **The Spectral Watcher** into play in the **Entry Hall**.'
			}
		]
	},
	extraInfo: {
		front: [
			{
				image: 'tcu/tcu-1-a.webp'
			}
		],
		back: [
			{
				image: 'tcu/tcu-1-b.webp'
			}
		]
	}
};

export const theWitchingHourScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheWitchingHour,
	shortName: 'I',
	setups: [
		{
			shuffles: [ancientEvils, strikingFear, anettesCoven, cityOfSins, witchcraft],
			remaining: [theWitchingHour, agentsOfShubNiggurath, agentsOfAzathoth, theDevourerBelow]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: agentsOfAzathoth,
				what: 'The entire **Agents of Azathoth** encounter set is set aside, out of play.'
			},
			{
				encounterSet: agentsOfShubNiggurath,
				what: 'The entire **Agents of Shub-Niggurath** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theDevourerBelow,
				what: 'Only gather 6x **Arkham Woods** locations.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tcu/tcu-2-b.webp'
			}
		]
	}
};

export const atDeathsDoorstepScenario: Scenario = {
	kohakuScenario: KohakuScenario.AtDeathsDoorstep,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: atDeathsDoorstep, overwriteCount: 0 },
				chillingCold,
				inexorableFate,
				silverTwilightLodge,
				spectralPredators,
				trappedSpirits
			],
			remaining: [realmOfDeath, theWatcher]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: realmOfDeath,
				what: 'The entire **Realm of Death** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theWatcher,
				what: 'The entire **The Watcher** encounter set is set aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tcu/tcu-3-b.webp'
			}
		]
	}
};

export const theSecretNameScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheSecretName,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: theSecretName, overwriteCount: 10 },
				rats,
				cityOfSins,
				inexorableFate,
				realmOfDeath,
				witchcraft
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theSecretName,
				what: 'In the starting encounter deck : **Meddlesome Familiar** (3x), **Extradimensional Visions** (2x), **Pulled by the Stars** (2x), **Disquieting Dreams** (2x), **Brown Jenkin**. (10 cards)'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tcu/tcu-4-b.webp'
			}
		]
	}
};

export const theWagesOfSinScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheWagesOfSin,
	shortName: 'IV',
	setups: [
		{
			shuffles: [
				{ encounterSet: theWagesOfSin, overwriteCount: 8 },
				anettesCoven,
				cityOfSins,
				witchcraft
			],
			remaining: [theWatcher, inexorableFate, realmOfDeath, trappedSpirits]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Spectral Encounter Deck',
				what: '20 Cards'
			},
			{
				encounterSet: theWagesOfSin,
				what: 'In the spectral encounter deck : **Malevolent Spirit** (2x), **Burdens of the Past** (2x), and **Bane of the Living** (2x). (6 cards)'
			},
			{
				encounterSet: inexorableFate,
				what: 'The entire **Inexorable Fate** set in the spectral encounter deck. (6 cards)'
			},
			{
				encounterSet: realmOfDeath,
				what: 'The entire **Realm of Death** set in the spectral encounter deck. (4 cards)'
			},
			{
				encounterSet: theWatcher,
				what: 'The entire **The Watcher** encounter set is set aside, out of play.'
			},
			{
				encounterSet: trappedSpirits,
				what: 'The entire **Trapped Spirits** set in the spectral encounter deck. (4 cards)'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tcu/tcu-5-b.webp'
			}
		]
	}
};

export const forTheGreaterGoodScenario: Scenario = {
	kohakuScenario: KohakuScenario.ForTheGreaterGood,
	shortName: 'V',
	setups: [
		{
			name: '"The investigators are members of the Lodge"',
			shuffles: [
				{ encounterSet: forTheGreaterGood, overwriteCount: 11 },
				ancientEvils,
				{ encounterSet: darkCult, overwriteCount: 2 },
				lockedDoors,
				cityOfSins,
				silverTwilightLodge
			],
			notes: [
				{
					encounterSet: forTheGreaterGood,
					what: 'Remove 3 cards from the game : **Cell Keeper** (1x), **Knight of the Inner Circle** (2x).'
				},
				{
					encounterSet: darkCult,
					what: 'Remove 4 cards from the game : **Acolyte** (3x), **Wizard of the Order** (1x).'
				}
			]
		},
		{
			name: 'Other',
			shuffles: [
				{ encounterSet: forTheGreaterGood, overwriteCount: 11 },
				ancientEvils,
				darkCult,
				lockedDoors,
				cityOfSins,
				{ encounterSet: silverTwilightLodge, overwriteCount: 2 }
			],
			notes: [
				{
					encounterSet: forTheGreaterGood,
					what: 'Remove 3 cards from the game : **Lodge Jailor** (1x), **Knight of the Outer Void** (2x).'
				},
				{
					encounterSet: silverTwilightLodge,
					what: 'Remove 4 cards from the game : **Lodge Neophyte** (3x), **Keeper of Secrets** (1x).'
				}
			]
		}
	],
	extraInfo: {
		back: [
			{
				image: 'tcu/tcu-6-b.webp'
			}
		]
	}
};

export const unionAndDisillusionScenario: Scenario = {
	kohakuScenario: KohakuScenario.UnionAndDisillusion,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: unionAndDisillusion, overwriteCount: 13 },
				ancientEvils,
				chillingCold,
				inexorableFate,
				realmOfDeath,
				spectralPredators
			],
			remaining: [anettesCoven, silverTwilightLodge, theWatcher]
		}
	],
	commonSetup: {
		specialGather: [
			{
				encounterSet: theWitchingHour,
				what: ['**Anette Mason**']
			},
			{
				encounterSet: atDeathsDoorstep,
				what: ['**Josef Meiger**']
			}
		],
		notes: [
			{
				what: 'For each heretic that was unleashed unto Arkham, place 1 doom on agenda 1a.'
			},
			{
				encounterSet: unionAndDisillusion,
				what: "**The Watcher's Gaze** treachery is set aside, out of play."
			},
			{
				encounterSet: anettesCoven,
				what: "The entire **Anette's Coven** encounter set is set aside, out of play."
			},
			{
				encounterSet: silverTwilightLodge,
				what: 'The entire **Silver Twilight Lodge** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theWatcher,
				what: 'The entire **The Watcher** encounter set is set aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tcu/tcu-7-b.webp'
			}
		]
	}
};

export const inTheClutchesOfChaosScenario: Scenario = {
	kohakuScenario: KohakuScenario.InTheClutchesOfChaos,
	shortName: 'VII',
	setups: [
		{
			name: '"Anette Mason is possessed by evil"',
			shuffles: [
				{ encounterSet: inTheClutchesOfChaos, overwriteCount: 8 },
				{ encounterSet: musicOfTheDamned, overwriteCount: 4 },
				nightgaunts,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				anettesCoven,
				cityOfSins,
				witchcraft
			]
		},
		{
			name: '"Carl Sanford possesses the secrets of the universe"',
			shuffles: [
				{ encounterSet: inTheClutchesOfChaos, overwriteCount: 8 },
				{ encounterSet: secretsOfTheUniverse, overwriteCount: 4 },
				nightgaunts,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				silverTwilightLodge,
				strikingFear,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 }
			],
			notes: [
				{
					encounterSet: theMidnightMasks,
					what: 'Only gather the 5 treachery cards (2x **False Lead** and 3x **Hunting Shadow**).'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: "Gather **Silver Twilight Lodge** and **Hangman's Hill** from the other variant for breach randomization."
			},
			{
				encounterSet: agentsOfAzathoth,
				what: 'Set the **Piper of Azathoth** enemy aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				heading: 'Starting Breaches'
			},
			{
				paragraph:
					'Choose 2 (3 if 4 [per_investigator]) different random locations. Place 1 breach on each of those locations. If 2 [per_investigator]: Perform this step twice. If 3~4 [per_investigator]: Perform this step 3 times.'
			},
			{
				heading: 'Resolving Incursions'
			},
			{
				bullets: [
					'First, remove all breaches on that location.',
					'Second, place 1 doom on that location.',
					'Finally, place 1 breach on each connecting location. This can chain-react and cause additional incursions to occur, so beware!',
					'Once an incursion is resolved at a location, breaches from other incursions cannot be placed on that location for the remainder of that phase.'
				]
			},
			{
				image: 'tcu/tcu-8-b.webp'
			}
		]
	}
};

export const beforeTheBlackThroneScenario: Scenario = {
	kohakuScenario: KohakuScenario.BeforeTheBlackThrone,
	shortName: 'VIII',
	setups: [
		{
			shuffles: [
				{ encounterSet: beforeTheBlackThrone, overwriteCount: 12 },
				ancientEvils,
				darkCult,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				inexorableFate
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: "Don't forget potential chaos bag changes in the prior Interlude IV."
			},
			{
				encounterSet: agentsOfAzathoth,
				what: 'Set the **Piper of Azathoth** enemy aside, out of play.'
			}
		]
	},
	extraInfo: {
		front: [
			{
				image: 'tcu/tcu-9-a.webp'
			}
		],
		back: [
			{
				heading: 'The Cosmos'
			},
			{
				paragraph:
					'A new location cannot enter play in a position already occupied by a location. If a location’s connection instructions are impossible to fulfill, shuffle that location back into the Cosmos and cancel the effects of the move.'
			},
			{
				paragraph:
					'<b>“Cosmos –”</b> instructions are only resolved when a location is being drawn from the Cosmos. When revealing a Cosmos location that is already in play, do not follow its <b>“Cosmos –”</b> instructions.'
			},
			{ heading: 'Empty Space' },
			{
				paragraph:
					'During this scenario, you will sometimes be instructed to place “empty space” into play. This is done by taking the top card of the active investigator’s deck and putting it into play facedown, in the indicated position. If there is no active investigator, the top card(s) of the lead investigator’s deck should be used, instead.'
			},
			{
				paragraph:
					'Empty space is not a location, and cannot be entered by enemies or investigators unless otherwise noted. It does, however, count as a location for the purposes of determining the distance between two locations.'
			},
			{
				paragraph:
					'A location can enter play in a position occupied by empty space. Should this happen, the empty space card is shuffled back into its owner’s deck.'
			}
		]
	}
};

export const returnToDisappearanceAtTheTwilightEstateScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToDisappearanceAtTheTwilightEstate,
	shortName: 'P',
	setups: [
		{
			shuffles: [
				{ encounterSet: disappearanceAtTheTwilightEstate, overwriteCount: 0 },
				{ encounterSet: returnToDisappearanceAtTheTwilightEstate, overwriteCount: 0 },
				{ encounterSet: atDeathsDoorstep, overwriteCount: 7 },
				spectralPredators,
				theWatcher,
				bloodthirstySpirits,
				chillingMists,
				unspeakableFate,
				unstableRealm
			]
		}
	]
};

export const returnToTheWitchingHourScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheWitchingHour,
	shortName: 'I',
	setups: [
		{
			shuffles: [
				{ encounterSet: theWitchingHour, overwriteCount: 0 },
				{ encounterSet: returnToTheWitchingHour, overwriteCount: 0 },
				{ encounterSet: theDevourerBelow, overwriteCount: 0 },
				strikingFear,
				anettesCoven,
				cityOfTheDamned,
				hexcraft,
				impendingEvils
			],
			remaining: [agentsOfShubNiggurath, agentsOfAzathoth]
		}
	]
};

export const returnToAtDeathsDoorstepScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToAtDeathsDoorstep,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: atDeathsDoorstep, overwriteCount: 0 },
				{ encounterSet: returnToAtDeathsDoorstep, overwriteCount: 1 },
				silverTwilightLodge,
				spectralPredators,
				bloodthirstySpirits,
				chillingMists,
				unspeakableFate
			],
			remaining: [unstableRealm, theWatcher],
			notes: [
				{
					encounterSet: returnToAtDeathsDoorstep,
					what: '**Dmitri Konstantinov** is shuffled into the encounter deck (**Senator Nathaniel Rhodes** is put into play in the Entry Hall).'
				}
			]
		}
	]
};

export const returnToTheSecretNameScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheSecretName,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: theSecretName, overwriteCount: 10 },
				{ encounterSet: returnToTheSecretName, overwriteCount: 0 },
				rats,
				cityOfTheDamned,
				hexcraft,
				unspeakableFate,
				unstableRealm
			]
		}
	]
};

export const returnToTheWagesOfSinScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheWagesOfSin,
	shortName: 'IV',
	setups: [
		{
			shuffles: [
				{ encounterSet: theWagesOfSin, overwriteCount: 8 },
				{ encounterSet: returnToTheWagesOfSin, overwriteCount: 2 },
				anettesCoven,
				cityOfTheDamned,
				hexcraft
			],
			remaining: [theWatcher, bloodthirstySpirits, unspeakableFate, unstableRealm]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Spectral Encounter Deck',
				what: '20 Cards'
			},
			{
				encounterSet: returnToTheWagesOfSin,
				what: '2x **Witchweed** are shuffled into the starting encounter deck.'
			}
		]
	}
};

export const returnToForTheGreaterGoodScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToForTheGreaterGood,
	shortName: 'V',
	setups: [
		{
			shuffles: [
				{ encounterSet: forTheGreaterGood, overwriteCount: 7 },
				{ encounterSet: returnToForTheGreaterGood, overwriteCount: 0 },
				darkCult,
				lockedDoors,
				silverTwilightLodge,
				cityOfTheDamned,
				impendingEvils
			]
		}
	]
};

export const returnToUnionAndDisillusionScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToUnionAndDisillusion,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: unionAndDisillusion, overwriteCount: 13 },
				{ encounterSet: returnToUnionAndDisillusion, overwriteCount: 2 },
				spectralPredators,
				chillingMists,
				impendingEvils,
				unspeakableFate,
				unstableRealm
			],
			remaining: [anettesCoven, silverTwilightLodge, theWatcher],
			notes: [
				{
					encounterSet: returnToUnionAndDisillusion,
					what: '2x **Brazier Enchantment** are shuffled into the encounter deck.'
				}
			]
		}
	]
};

export const returnToInTheClutchesOfChaos1Scenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToInTheClutchesOfChaos,
	shortName: 'VII (v.I)',
	setups: [
		{
			shuffles: [
				{ encounterSet: inTheClutchesOfChaos, overwriteCount: 8 },
				{ encounterSet: returnToInTheClutchesOfChaos, overwriteCount: 0 },
				{ encounterSet: musicOfTheDamned, overwriteCount: 4 },
				nightgaunts,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				anettesCoven,
				cityOfTheDamned,
				hexcraft
			]
		}
	]
};

export const returnToInTheClutchesOfChaos2Scenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToInTheClutchesOfChaos,
	shortName: 'VII (v.II)',
	setups: [
		{
			shuffles: [
				{ encounterSet: inTheClutchesOfChaos, overwriteCount: 8 },
				{ encounterSet: returnToInTheClutchesOfChaos, overwriteCount: 0 },
				{ encounterSet: secretsOfTheUniverse, overwriteCount: 4 },
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				nightgaunts,
				strikingFear,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				silverTwilightLodge
			]
		}
	]
};

export const returnToBeforeTheBlackThroneScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToBeforeTheBlackThrone,
	shortName: 'VIII',
	setups: [
		{
			shuffles: [
				{ encounterSet: beforeTheBlackThrone, overwriteCount: 12 },
				{ encounterSet: returnToBeforeTheBlackThrone, overwriteCount: 0 },
				darkCult,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				impendingEvils,
				unspeakableFate
			]
		}
	]
};
