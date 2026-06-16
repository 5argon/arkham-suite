import type { Scenario } from '$lib/core/campaign';

import { EncounterSet as KohakuEncounterSet, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';
import { m } from '@5argon/arkham-string';
import {
	agentsOfYogSothoth,
	ancientEvils,
	chillingCold,
	darkCult,
	lockedDoors,
	nightgaunts,
	strikingFear,
	theMidnightMasks
} from '../notz/encounter';
import {
	agentsOfYig,
	cultOfPnakotus,
	deadlyTraps,
	doomedExpedition,
	expedition,
	forgottenRuins,
	guardiansOfTime,
	heartOfTheElders,
	knyan,
	pillarsOfJudgement,
	pnakoticBrotherhood,
	poison,
	rainforest,
	returnToKnyan,
	returnToPillarsOfJudgement,
	returnToShatteredAeons,
	returnToTheBoundaryBeyond,
	returnToTheCityOfArchives,
	returnToTheDepthsOfYoth,
	returnToTheDoomOfEztli,
	returnToTheRainforest,
	returnToTheUntamedWilds,
	returnToThreadsOfFate,
	returnToTurnBackTime,
	serpents,
	shatteredAeons,
	temporalFlux,
	temporalHunters,
	theBoundaryBeyond,
	theCityOfArchives,
	theDepthsOfYoth,
	theDoomOfEztli,
	theUntamedWilds,
	threadsOfFate,
	turnBackTime,
	venomousHate,
	yigsVenom
} from './encounter';

export const theUntamedWildsScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheUntamedWilds,
	shortName: 'I',
	setups: [
		{
			shuffles: [
				{ encounterSet: theUntamedWilds, overwriteCount: 0 },
				ancientEvils,
				{ encounterSet: rainforest, overwriteCount: 3 },
				{ encounterSet: serpents, overwriteCount: 6 },
				{ encounterSet: expedition, overwriteCount: 3 },
				{ encounterSet: guardiansOfTime, overwriteCount: 3 },
				{ encounterSet: agentsOfYig, overwriteCount: 0 },
				{ encounterSet: poison, overwriteCount: 2 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (10)',
				what: '5x Treacheries, 5x Locations'
			},
			{
				encounterSet: rainforest,
				what: '**Overgrown Ruins** and **Temple of the Fang** are set aside. 1x **Overgrowth** and 5 remaining locations are in the exploration deck.'
			},
			{ encounterSet: serpents, what: '1x **Snake Bite** is in the exploration deck.' },
			{
				encounterSet: expedition,
				what: '1x **Lost in the Wilds** and 1x **Low on Supplies** are in the exploration deck.'
			},
			{
				encounterSet: guardiansOfTime,
				what: '1x **Arrows from the Trees** is in the exploration deck.'
			},
			{
				encounterSet: agentsOfYig,
				what: 'The entire **Agents of Yig** encounter set is set aside, out of play.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-1-b.webp'
			}
		]
	}
};

export const theDoomOfEztliScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheDoomOfEztli,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDoomOfEztli, overwriteCount: 0 },
				{ encounterSet: chillingCold, overwriteCount: 3 },
				agentsOfYig,
				{ encounterSet: deadlyTraps, overwriteCount: 3 },
				{ encounterSet: forgottenRuins, overwriteCount: 5 },
				{ encounterSet: poison, overwriteCount: 2 },
				temporalFlux,
				yigsVenom
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (10)',
				what: '5x Treacheries, 5x Locations'
			},
			{
				encounterSet: deadlyTraps,
				what: '1x **Final Mistake** and 1x **Entombed** are in the exploration deck.'
			},
			{
				encounterSet: forgottenRuins,
				what: '1x **Ill Omen** and 1x **Deep Dark** are in the exploration deck.'
			},
			{
				encounterSet: chillingCold,
				what: '1x **Crypt Chill** is in the exploration deck.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-2-b.webp'
			}
		]
	}
};

export const threadsOfFateScenario: Scenario = {
	kohakuScenario: KohakuScenario.ThreadsOfFate,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: threadsOfFate, overwriteCount: 7 },
				darkCult,
				lockedDoors,
				nightgaunts,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				pnakoticBrotherhood
			]
		}
	],
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-3-b.webp'
			}
		]
	}
};

export const theBoundaryBeyondScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheBoundaryBeyond,
	shortName: 'IV',
	setups: [
		{
			name: 'Cultist',
			shuffles: [
				{ encounterSet: theBoundaryBeyond, overwriteCount: 7 },
				{ encounterSet: poison, overwriteCount: 2 },
				{ encounterSet: temporalFlux, overwriteCount: 3 },
				pnakoticBrotherhood,
				darkCult
			]
		},
		{
			name: 'Tablet',
			shuffles: [
				{ encounterSet: theBoundaryBeyond, overwriteCount: 7 },
				{ encounterSet: poison, overwriteCount: 2 },
				{ encounterSet: temporalFlux, overwriteCount: 3 },
				yigsVenom,
				guardiansOfTime
			]
		},
		{
			name: 'Neutral',
			shuffles: [
				{ encounterSet: theBoundaryBeyond, overwriteCount: 7 },
				{ encounterSet: poison, overwriteCount: 2 },
				{ encounterSet: temporalFlux, overwriteCount: 3 },
				pnakoticBrotherhood,
				guardiansOfTime
			]
		}
	],
	commonSetup: {
		specialGather: [{ encounterSet: theDoomOfEztli, what: ['**Harbinger of Valusia**'] }],
		notes: [
			{
				topic: 'Exploration Deck (16)',
				what: '4x Treacheries, 12x Locations'
			},
			{
				what: 'You might need a *Madness* or *Injury* random basic weakness.'
			},
			{
				encounterSet: theBoundaryBeyond,
				what: '1x **Window to Another Time** and 1x **Timeline Destabilization** are in the exploration deck.'
			},
			{
				encounterSet: temporalFlux,
				what: '1x **A Tear in Time** and 1x **Lost in Time** are in the exploration deck.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-4-b.webp'
			}
		]
	}
};

export const heartOfTheEldersPart1Scenario: Scenario = {
	kohakuScenario: KohakuScenario.HeartOfTheEldersPart1,
	shortName: 'V-A',
	overrideName: m.campaignRegularTheForgottenAgeScenarioHeartOfTheEldersPart1(),
	setups: [
		{
			shuffles: [
				{ encounterSet: heartOfTheElders, overwriteCount: 5 },
				{ encounterSet: pillarsOfJudgement, overwriteCount: 6 },
				{ encounterSet: expedition, overwriteCount: 3 },
				{ encounterSet: rainforest, overwriteCount: 4 },
				{ encounterSet: poison, overwriteCount: 2 },
				serpents
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (10~11)',
				what: '4x Treacheries, 6~7x Locations : 6x *Jungle* + 1x *Ruins* if no **Map**'
			},
			{
				encounterSet: heartOfTheElders,
				what: '1x **Pitfall** is in the exploration deck.'
			},
			{
				encounterSet: expedition,
				what: '1x **Lost in the Wild** and 1x **Low on Supplies** are in the exploration deck.'
			},
			{
				encounterSet: pillarsOfJudgement,
				what: '1x **Time-Wracked Woods** (*Jungle*) and 1x **Ants!** are in the exploration deck.'
			},
			{
				encounterSet: rainforest,
				what: '5x *Jungle* locations are all in the exploration deck.'
			},
			{
				encounterSet: pillarsOfJudgement,
				what: '**Stone Altar** (*Ruins*) is a part of 3 *Ruins* randomization, 2 other *Ruins* in the **Rainforest** set.'
			},
			{
				encounterSet: rainforest,
				what: '**Overgrown Ruins** (*Ruins*) and **Temple of the Fang** (*Ruins*) are part of 3 *Ruins* randomization with **Stone Altar** (*Ruins*) in the **Pillars of Judgment** set.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-5-b.webp'
			}
		]
	}
};

export const heartOfTheEldersPart2Scenario: Scenario = {
	kohakuScenario: KohakuScenario.HeartOfTheEldersPart2,
	shortName: 'V-B',
	overrideName: m.campaignRegularTheForgottenAgeScenarioHeartOfTheEldersPart2(),
	setups: [
		{
			shuffles: [
				{ encounterSet: heartOfTheElders, overwriteCount: 5 },
				{ encounterSet: knyan, overwriteCount: 2 },
				{ encounterSet: deadlyTraps, overwriteCount: 4 },
				{ encounterSet: forgottenRuins, overwriteCount: 6 },
				{ encounterSet: poison, overwriteCount: 2 },
				agentsOfYig,
				yigsVenom
			]
		}
	],
	commonSetup: {
		specialGather: [{ encounterSet: theDoomOfEztli, what: ['**Harbinger of Valusia**'] }],
		notes: [
			{
				topic: 'Exploration Deck (9)',
				what: '4x Treacheries, 5x Locations'
			},
			{
				encounterSet: heartOfTheElders,
				what: '1x **Pitfall** is in the exploration deck.'
			},
			{
				encounterSet: knyan,
				what: '1x **No Turning Back** and 5 locations other than **Descent to Yoth** are in the exploration deck.'
			},
			{
				encounterSet: deadlyTraps,
				what: '1x **Final Mistake** is in the exploration deck.'
			},
			{
				encounterSet: forgottenRuins,
				what: '1x **Deep Dark** is in the exploration deck.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-6-b.webp'
			}
		]
	}
};

export const theCityOfArchivesScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheCityOfArchives,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: theCityOfArchives, overwriteCount: 17 },
				{ encounterSet: agentsOfYogSothoth, overwriteCount: 3 },
				chillingCold,
				lockedDoors,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: agentsOfYogSothoth,
				what: '1x **Yithian Observer** is either spawned or in the victory display.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-7-b.webp'
			}
		]
	}
};

export const theDepthsOfYothScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheDepthsOfYoth,
	shortName: 'VII',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDepthsOfYoth, overwriteCount: 15 },
				agentsOfYig,
				expedition,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				yigsVenom
			]
		}
	],
	commonSetup: {
		specialGather: [{ encounterSet: theDoomOfEztli, what: ['**Harbinger of Valusia**'] }],
		notes: [
			{
				encounterSet: theDepthsOfYoth,
				what: 'If you have 0 tally mark, 2x **Pit Warden** are removed from the starting encounter deck.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-8-b.webp'
			}
		]
	}
};

export const shatteredAeonsScenario: Scenario = {
	kohakuScenario: KohakuScenario.ShatteredAeons,
	shortName: 'VIII',
	setups: [
		{
			name: 'Cultist',
			shuffles: [
				{ encounterSet: shatteredAeons, overwriteCount: 10 },
				pnakoticBrotherhood,
				{ encounterSet: temporalFlux, overwriteCount: 4 },
				{ encounterSet: ancientEvils, overwriteCount: 2 },
				darkCult
			]
		},
		{
			name: 'Tablet',
			shuffles: [
				{ encounterSet: shatteredAeons, overwriteCount: 10 },
				pnakoticBrotherhood,
				{ encounterSet: temporalFlux, overwriteCount: 4 },
				{ encounterSet: ancientEvils, overwriteCount: 2 },
				agentsOfYig
			]
		},
		{
			name: 'Neutral',
			shuffles: [
				{ encounterSet: shatteredAeons, overwriteCount: 10 },
				pnakoticBrotherhood,
				{ encounterSet: temporalFlux, overwriteCount: 4 },
				{ encounterSet: ancientEvils, overwriteCount: 2 },
				darkCult,
				agentsOfYig
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (6)',
				what: '3x Treacheries, 3x Locations'
			},
			{
				encounterSet: shatteredAeons,
				what: '3 *Otherworld* locations, 1x **Wracked by Time**, and 1x **Between Worlds** are in the exploration deck.'
			},
			{
				encounterSet: ancientEvils,
				what: '1x **Ancient Evils** is in the exploration deck.'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-9-b.webp'
			}
		]
	}
};

export const turnBackTimeScenario: Scenario = {
	kohakuScenario: KohakuScenario.TurnBackTime,
	shortName: 'IX',
	setups: [
		{
			shuffles: [
				{ encounterSet: turnBackTime, overwriteCount: 0 },
				{ encounterSet: theDoomOfEztli, overwriteCount: 0 },
				chillingCold,
				agentsOfYig,
				deadlyTraps,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				temporalFlux,
				yigsVenom
			]
		}
	]
};

export const returnToTheUntamedWildsScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheUntamedWilds,
	shortName: 'I',
	setups: [
		{
			shuffles: [
				{ encounterSet: theUntamedWilds, overwriteCount: 0 },
				returnToTheUntamedWilds,
				ancientEvils,
				{ encounterSet: agentsOfYig, overwriteCount: 0 },
				{ encounterSet: guardiansOfTime, overwriteCount: 3 },
				{ encounterSet: poison, overwriteCount: 2 },
				{ encounterSet: rainforest, overwriteCount: 3 },
				{ encounterSet: serpents, overwriteCount: 6 },
				{ encounterSet: doomedExpedition, overwriteCount: 3 },
				returnToTheRainforest
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (5)',
				what: '5x Locations'
			},
			{
				encounterSet: returnToTheUntamedWilds,
				what: '**Forced**: After a successful exploration ends, Shuffle the top card of the encounter deck into the exploration deck.'
			},
			{
				encounterSet: agentsOfYig,
				what: 'The entire **Agents of Yig** encounter set is set aside, out of play.'
			}
		]
	}
};

export const returnToTheDoomOfEztliScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheDoomOfEztli,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDoomOfEztli, overwriteCount: 0 },
				{ encounterSet: returnToTheDoomOfEztli, overwriteCount: 0 },
				chillingCold,
				agentsOfYig,
				deadlyTraps,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				temporalHunters,
				venomousHate
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (5)',
				what: '5x Locations (no Treacheries; they start in the encounter deck)'
			},
			{
				encounterSet: returnToTheDoomOfEztli,
				what: '**Forced**: After a successful exploration ends, Shuffle the top card of the encounter deck into the exploration deck.'
			}
		]
	}
};

export const returnToThreadsOfFateScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToThreadsOfFate,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: threadsOfFate, overwriteCount: 7 },
				{ encounterSet: returnToThreadsOfFate, overwriteCount: 0 },
				lockedDoors,
				nightgaunts,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				pnakoticBrotherhood,
				cultOfPnakotus
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: cultOfPnakotus,
				what: 'Replaces the regular **Dark Cult** set. **Return to Threads of Fate** locations are placed during setup; none enter the encounter deck.'
			}
		]
	}
};

export const returnToTheBoundaryBeyondScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheBoundaryBeyond,
	shortName: 'IV',
	setups: [
		{
			shuffles: [
				{ encounterSet: theBoundaryBeyond, overwriteCount: 9 },
				{ encounterSet: returnToTheBoundaryBeyond, overwriteCount: 0 },
				{ encounterSet: poison, overwriteCount: 2 },
				temporalHunters,
				pnakoticBrotherhood,
				cultOfPnakotus
			]
		}
	],
	commonSetup: {
		specialGather: [{ encounterSet: theDoomOfEztli, what: ['**Harbinger of Valusia**'] }],
		notes: [
			{
				topic: 'Exploration Deck (12)',
				what: '12x Locations (no Treacheries; they start in the encounter deck)'
			},
			{
				what: 'You might need a *Madness* or *Injury* random basic weakness.'
			},
			{
				encounterSet: cultOfPnakotus,
				what: 'Replaces the regular **Dark Cult** set. This is the *Cultist* version of the scenario.'
			}
		]
	}
};

export const returnToHeartOfTheEldersPart1Scenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToHeartOfTheEldersPart1,
	shortName: 'V-A',
	overrideName: m.campaignRegularTheForgottenAgeScenarioHeartOfTheEldersPart1(),
	setups: [
		{
			shuffles: [
				{ encounterSet: heartOfTheElders, overwriteCount: 6 },
				{ encounterSet: pillarsOfJudgement, overwriteCount: 7 },
				{ encounterSet: returnToPillarsOfJudgement, overwriteCount: 2 },
				{ encounterSet: poison, overwriteCount: 2 },
				{ encounterSet: rainforest, overwriteCount: 4 },
				serpents,
				doomedExpedition,
				{ encounterSet: returnToTheRainforest, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (6~7)',
				what: '6~7x Locations (no Treacheries; they start in the encounter deck) : 6x *Jungle* + 1x *Ruins* if no **Map**'
			},
			{
				encounterSet: returnToPillarsOfJudgement,
				what: '2x **Feathered Serpent** are shuffled into the encounter deck (**The Winged Serpent** is set aside). **Return to the Rainforest** locations replace the basic *Jungle* locations in the exploration deck.'
			}
		]
	}
};

export const returnToHeartOfTheEldersPart2Scenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToHeartOfTheEldersPart2,
	shortName: 'V-B',
	overrideName: m.campaignRegularTheForgottenAgeScenarioHeartOfTheEldersPart2(),
	setups: [
		{
			shuffles: [
				{ encounterSet: heartOfTheElders, overwriteCount: 6 },
				{ encounterSet: knyan, overwriteCount: 3 },
				{ encounterSet: returnToKnyan, overwriteCount: 0 },
				agentsOfYig,
				{ encounterSet: deadlyTraps, overwriteCount: 5 },
				{ encounterSet: forgottenRuins, overwriteCount: 7 },
				{ encounterSet: poison, overwriteCount: 2 },
				venomousHate
			]
		}
	],
	commonSetup: {
		specialGather: [{ encounterSet: theDoomOfEztli, what: ['**Harbinger of Valusia**'] }],
		notes: [
			{
				topic: 'Exploration Deck (5)',
				what: '5x Locations (no Treacheries; they start in the encounter deck)'
			},
			{
				encounterSet: knyan,
				what: '5 locations other than **Descent to Yoth** are in the exploration deck; **No Turning Back** starts in the encounter deck.'
			},
			{
				encounterSet: returnToKnyan,
				what: '**Forced**: After a successful exploration ends, Shuffle the top card of the encounter deck into the exploration deck.'
			}
		]
	}
};

export const returnToTheCityOfArchivesScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheCityOfArchives,
	shortName: 'VI',
	setups: [
		{
			shuffles: [
				{ encounterSet: theCityOfArchives, overwriteCount: 17 },
				{ encounterSet: returnToTheCityOfArchives, overwriteCount: 2 },
				{ encounterSet: agentsOfYogSothoth, overwriteCount: 3 },
				chillingCold,
				lockedDoors,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: agentsOfYogSothoth,
				what: '1x **Yithian Observer** is either spawned or in the victory display.'
			},
			{
				encounterSet: returnToTheCityOfArchives,
				what: '2x **Captive Subjects** are shuffled into the encounter deck.'
			}
		]
	}
};

export const returnToTheDepthsOfYothScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTheDepthsOfYoth,
	shortName: 'VII',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDepthsOfYoth, overwriteCount: 15 },
				{ encounterSet: returnToTheDepthsOfYoth, overwriteCount: 0 },
				agentsOfYig,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				doomedExpedition,
				venomousHate
			]
		}
	],
	commonSetup: {
		specialGather: [{ encounterSet: theDoomOfEztli, what: ['**Harbinger of Valusia**'] }],
		notes: [
			{
				encounterSet: theDepthsOfYoth,
				what: 'If you have 0 tally mark, 2x **Pit Warden** are removed from the starting encounter deck.'
			}
		]
	}
};

export const returnToShatteredAeonsScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToShatteredAeons,
	shortName: 'VIII',
	setups: [
		{
			shuffles: [
				{ encounterSet: shatteredAeons, overwriteCount: 12 },
				{ encounterSet: returnToShatteredAeons, overwriteCount: 2 },
				ancientEvils,
				agentsOfYig,
				pnakoticBrotherhood,
				{ encounterSet: temporalHunters, overwriteCount: 4 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Exploration Deck (3)',
				what: '3x Locations (no Treacheries; they start in the encounter deck)'
			},
			{
				encounterSet: returnToShatteredAeons,
				what: '2x **Unknowable Past** are shuffled into the encounter deck. This is the *Tablet* version of the scenario.'
			},
			{
				encounterSet: shatteredAeons,
				what: '3 *Otherworld* locations are in the exploration deck; **Wracked by Time** and **Between Worlds** start in the encounter deck.'
			}
		]
	}
};

export const returnToTurnBackTimeScenario: Scenario = {
	kohakuScenario: KohakuScenario.ReturnToTurnBackTime,
	shortName: 'IX',
	setups: [
		{
			shuffles: [
				{ encounterSet: turnBackTime, overwriteCount: 0 },
				{ encounterSet: returnToTurnBackTime, overwriteCount: 0 },
				{ encounterSet: theDoomOfEztli, overwriteCount: 0 },
				chillingCold,
				agentsOfYig,
				deadlyTraps,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				serpents,
				temporalHunters,
				venomousHate
			]
		}
	]
};
