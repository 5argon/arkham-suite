import type { Scenario } from '$lib/core/campaign';
import { ChaosToken, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
				chillingCold,
				inexorableFate,
				realmOfDeath,
				spectralPredators,
				{ encounterSet: theWatcher, overwriteCount: 2 },
				trappedSpirits
			],
			remaining: [disappearanceAtTheTwilightEstate, atDeathsDoorstep],
			asteriskCount: true
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Each investigator card back puts 1 or 2 encounter cards into play.'
			},
			{
				encounterSet: atDeathsDoorstep,
				what: 'Only gather the 7x ***Spectral*** locations.'
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
		addChaosTokenConditional: [
			{
				condition: 'If *you have accepted your fate*',
				tokens: [ChaosToken.TokenTablet, ChaosToken.TokenTablet]
			},
			{
				condition: 'If *you have rejected your fate*',
				tokens: [ChaosToken.TokenElderThing, ChaosToken.TokenElderThing]
			}
		],
		notes: [
			{
				encounterSet: theWitchingHour,
				what: 'In player order, each investigator puts 1 random **Witch-Haunted Woods** into play in front of them, until 5 are in play. Remove the other 2 from the game.'
			},
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
				chillingCold,
				inexorableFate,
				silverTwilightLodge,
				spectralPredators,
				trappedSpirits
			],
			remaining: [atDeathsDoorstep, realmOfDeath, theWatcher]
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
		addChaosTokenConditional: [
			{
				condition: 'If *the investigators told the Lodge about the coven*',
				tokens: [ChaosToken.TokenCultist]
			}
		],
		notes: [
			{
				encounterSet: theSecretName,
				what: 'Only 3x **Meddlesome Familiar**, 2x **Extradimensional Visions**, 2x **Pulled by the Stars**, 2x **Disquieting Dreams** and **Brown Jenkin** enter the encounter deck.'
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
				what: 'Only 8 non-***Spectral*** cards of this set enter the standard encounter deck. 2x **Malevolent Spirit**, 2x **Burdens of the Past** and 2x **Bane of the Living** go into the spectral encounter deck.'
			},
			{
				encounterSet: inexorableFate,
				what: 'The entire **Inexorable Fate** encounter set goes into the spectral encounter deck.'
			},
			{
				encounterSet: realmOfDeath,
				what: 'The entire **Realm of Death** encounter set goes into the spectral encounter deck.'
			},
			{
				encounterSet: trappedSpirits,
				what: 'The entire **Trapped Spirits** encounter set goes into the spectral encounter deck.'
			},
			{
				encounterSet: theWatcher,
				what: 'The entire **The Watcher** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theWagesOfSin,
				what: 'Locations start in play with their non-***Spectral*** side faceup.'
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
					what: 'Remove **Cell Keeper** and 2x **Knight of the Inner Circle** from the game.'
				},
				{
					encounterSet: darkCult,
					what: 'Remove 3x **Acolyte** and **Wizard of the Order** from the game.'
				}
			]
		},
		{
			name: 'Not members of the Lodge',
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
					what: 'Remove **Lodge Jailor** and 2x **Knight of the Outer Void** from the game.'
				},
				{
					encounterSet: silverTwilightLodge,
					what: 'Remove 3x **Lodge Neophyte** and **Keeper of Secrets** from the game.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Set aside 1 each of [skull], [cultist], [tablet] and [elder_thing] tokens from your collection (not from the chaos bag) as keys.'
			}
		]
	},
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
		startingDoom: [
			{
				amount: '+X',
				condition: 'If *X heretics were unleashed unto Arkham*'
			}
		],
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
				what: 'If *the investigators sided with the coven*, the braziers at **Forbidding Shore** and both **Unvisited Isle** in play start lit. Place 1 resource on each of them.'
			},
			{
				encounterSet: unionAndDisillusion,
				what: "**Watcher's Gaze** is set aside, out of play."
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
			],
			remaining: [secretsOfTheUniverse]
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
			remaining: [musicOfTheDamned],
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
				what: "Also gather the other variant's set for its **Hangman's Hill** and **Silver Twilight Lodge**. Shuffle them with the 6 removed locations to choose random locations."
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
				spectralPredators,
				{ encounterSet: theWatcher, overwriteCount: 2 },
				bloodthirstySpirits,
				chillingMists,
				unspeakableFate,
				unstableRealm
			],
			remaining: [
				disappearanceAtTheTwilightEstate,
				returnToDisappearanceAtTheTwilightEstate,
				atDeathsDoorstep,
				returnToAtDeathsDoorstep
			],
			asteriskCount: true
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Each investigator card back puts 1 or 2 encounter cards into play. Use **Mists from Beyond** for **Obscuring Fog**, **Unavoidable Demise** for **Terror in the Night** and **Screeching Banshee** for **Wraith**.'
			},
			{
				encounterSet: atDeathsDoorstep,
				what: 'Only gather the 7x ***Spectral*** locations.'
			},
			{
				encounterSet: returnToAtDeathsDoorstep,
				what: 'Only gather the ***Spectral*** **Wine Cellar**. It enters play with the other ***Spectral*** locations.'
			},
			{
				encounterSet: theWatcher,
				what: 'Put **The Spectral Watcher** into play in the **Entry Hall**.'
			}
		]
	}
};

export const returnToTheWitchingHourScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheWitchingHour,
	shortName: 'I',
	setups: [
		{
			shuffles: [strikingFear, anettesCoven, cityOfTheDamned, hexcraft, impendingEvils],
			remaining: [
				theWitchingHour,
				returnToTheWitchingHour,
				theDevourerBelow,
				agentsOfShubNiggurath,
				agentsOfAzathoth
			]
		}
	],
	commonSetup: {
		addChaosTokenConditional: [
			{
				condition: 'If *you have accepted your fate*',
				tokens: [ChaosToken.TokenTablet, ChaosToken.TokenTablet]
			},
			{
				condition: 'If *you have rejected your fate*',
				tokens: [ChaosToken.TokenElderThing, ChaosToken.TokenElderThing]
			}
		],
		notes: [
			{
				what: 'Include the 2 new **Witch-Haunted Woods** for 9 in total. In player order, each investigator puts 1 random **Witch-Haunted Woods** into play in front of them, until 5 are in play. Remove the other 4 from the game.'
			},
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
	}
};

export const returnToAtDeathsDoorstepScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToAtDeathsDoorstep,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: returnToAtDeathsDoorstep, overwriteCount: 1 },
				silverTwilightLodge,
				spectralPredators,
				bloodthirstySpirits,
				chillingMists,
				unspeakableFate
			],
			remaining: [atDeathsDoorstep, unstableRealm, theWatcher],
			notes: [
				{
					encounterSet: returnToAtDeathsDoorstep,
					what: 'Only **Dmitri Konstantinov** enters the encounter deck. **Senator Nathaniel Rhodes** starts in play in the **Entry Hall** with 1 [per_investigator] clues.'
				},
				{
					encounterSet: unstableRealm,
					what: 'The entire **Unstable Realm** encounter set is set aside, out of play. When act 1b shuffles **Realm of Death** into the encounter deck, shuffle **Unstable Realm** in instead.'
				},
				{
					encounterSet: theWatcher,
					what: 'The entire **The Watcher** encounter set is set aside, out of play.'
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
				rats,
				cityOfTheDamned,
				hexcraft,
				unspeakableFate,
				unstableRealm
			],
			remaining: [returnToTheSecretName]
		}
	],
	commonSetup: {
		addChaosTokenConditional: [
			{
				condition: 'If *the investigators told the Lodge about the coven*',
				tokens: [ChaosToken.TokenCultist]
			}
		],
		notes: [
			{
				encounterSet: theSecretName,
				what: 'Only 3x **Meddlesome Familiar**, 2x **Extradimensional Visions**, 2x **Pulled by the Stars**, 2x **Disquieting Dreams** and **Brown Jenkin** enter the encounter deck.'
			}
		]
	}
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
				encounterSet: theWagesOfSin,
				what: 'Only 8 non-***Spectral*** cards of this set enter the standard encounter deck. 2x **Malevolent Spirit**, 2x **Burdens of the Past** and 2x **Bane of the Living** go into the spectral encounter deck.'
			},
			{
				encounterSet: returnToTheWagesOfSin,
				what: 'Only 2x **Witchweed** enter the standard encounter deck.'
			},
			{
				encounterSet: bloodthirstySpirits,
				what: 'The entire **Bloodthirsty Spirits** encounter set goes into the spectral encounter deck.'
			},
			{
				encounterSet: unspeakableFate,
				what: 'The entire **Unspeakable Fate** encounter set goes into the spectral encounter deck.'
			},
			{
				encounterSet: unstableRealm,
				what: 'The entire **Unstable Realm** encounter set goes into the spectral encounter deck.'
			},
			{
				encounterSet: theWatcher,
				what: 'The entire **The Watcher** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theWagesOfSin,
				what: 'Locations start in play with their non-***Spectral*** side faceup.'
			}
		]
	}
};

export const returnToForTheGreaterGoodScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToForTheGreaterGood,
	shortName: 'V',
	setups: [
		{
			name: '"The investigators are members of the Lodge"',
			shuffles: [
				{ encounterSet: forTheGreaterGood, overwriteCount: 11 },
				{ encounterSet: darkCult, overwriteCount: 2 },
				lockedDoors,
				silverTwilightLodge,
				cityOfTheDamned,
				impendingEvils
			],
			remaining: [returnToForTheGreaterGood],
			notes: [
				{
					encounterSet: forTheGreaterGood,
					what: 'Remove **Cell Keeper** and 2x **Knight of the Inner Circle** from the game.'
				},
				{
					encounterSet: darkCult,
					what: 'Remove 3x **Acolyte** and **Wizard of the Order** from the game.'
				}
			]
		},
		{
			name: 'Not members of the Lodge',
			shuffles: [
				{ encounterSet: forTheGreaterGood, overwriteCount: 11 },
				darkCult,
				lockedDoors,
				{ encounterSet: silverTwilightLodge, overwriteCount: 2 },
				cityOfTheDamned,
				impendingEvils
			],
			remaining: [returnToForTheGreaterGood],
			notes: [
				{
					encounterSet: forTheGreaterGood,
					what: 'Remove **Lodge Jailor** and 2x **Knight of the Outer Void** from the game.'
				},
				{
					encounterSet: silverTwilightLodge,
					what: 'Remove 3x **Lodge Neophyte** and **Keeper of Secrets** from the game.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Set aside 1 each of [skull], [cultist], [tablet] and [elder_thing] tokens from your collection (not from the chaos bag) as keys.'
			}
		]
	}
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
			remaining: [anettesCoven, silverTwilightLodge, theWatcher]
		}
	],
	commonSetup: {
		startingDoom: [
			{
				amount: '+X',
				condition: 'If *X heretics were unleashed unto Arkham*'
			}
		],
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
				what: 'If *the investigators sided with the coven*, the braziers at **Forbidding Shore** and both **Unvisited Isle** in play start lit. Place 1 resource on each of them.'
			},
			{
				encounterSet: unionAndDisillusion,
				what: "**Watcher's Gaze** is set aside, out of play."
			},
			{
				encounterSet: returnToUnionAndDisillusion,
				what: 'Only 2x **Brazier Enchantment** enter the encounter deck.'
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
	}
};

export const returnToInTheClutchesOfChaos1Scenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToInTheClutchesOfChaos,
	shortName: 'VII (v.I)',
	setups: [
		{
			name: '"Anette Mason is possessed by evil"',
			shuffles: [
				{ encounterSet: inTheClutchesOfChaos, overwriteCount: 8 },
				{ encounterSet: musicOfTheDamned, overwriteCount: 4 },
				nightgaunts,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				anettesCoven,
				cityOfTheDamned,
				hexcraft
			],
			remaining: [returnToInTheClutchesOfChaos, secretsOfTheUniverse]
		}
	],
	commonSetup: {
		notes: [
			{
				what: "Also gather **Secrets of the Universe** for its **Hangman's Hill** and **Silver Twilight Lodge**. Shuffle them with the removed locations to choose random locations."
			},
			{
				encounterSet: agentsOfAzathoth,
				what: 'Set the **Piper of Azathoth** enemy aside, out of play.'
			}
		]
	}
};

export const returnToInTheClutchesOfChaos2Scenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToInTheClutchesOfChaos,
	shortName: 'VII (v.II)',
	setups: [
		{
			name: '"Carl Sanford possesses the secrets of the universe"',
			shuffles: [
				{ encounterSet: inTheClutchesOfChaos, overwriteCount: 8 },
				{ encounterSet: secretsOfTheUniverse, overwriteCount: 4 },
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				nightgaunts,
				strikingFear,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				silverTwilightLodge
			],
			remaining: [returnToInTheClutchesOfChaos, musicOfTheDamned]
		}
	],
	commonSetup: {
		notes: [
			{
				what: "Also gather **Music of the Damned** for its **Hangman's Hill** and **Silver Twilight Lodge**. Shuffle them with the removed locations to choose random locations."
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Only gather the 5 treachery cards (2x **False Lead** and 3x **Hunting Shadow**).'
			},
			{
				encounterSet: agentsOfAzathoth,
				what: 'Set the **Piper of Azathoth** enemy aside, out of play.'
			}
		]
	}
};

export const returnToBeforeTheBlackThroneScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToBeforeTheBlackThrone,
	shortName: 'VIII',
	setups: [
		{
			shuffles: [
				{ encounterSet: beforeTheBlackThrone, overwriteCount: 12 },
				darkCult,
				{ encounterSet: agentsOfAzathoth, overwriteCount: 3 },
				impendingEvils,
				unspeakableFate
			],
			remaining: [returnToBeforeTheBlackThrone]
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
	}
};
