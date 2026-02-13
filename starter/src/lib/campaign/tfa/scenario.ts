import type { Scenario } from '$lib/core/campaign';

import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';
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
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.TheUntamedWilds,
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
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.TheDoomOfEztli,
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
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.ThreadsOfFate,
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
	index: 4,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.TheBoundaryBeyond,
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
	index: 5,
	shortName: 'V-A',
	representativeSet: KohakuEncounterSet.HeartOfTheElders,
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
	index: 6,
	shortName: 'V-B',
	representativeSet: KohakuEncounterSet.HeartOfTheElders,
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
	index: 7,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.TheCityOfArchives,
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
	index: 8,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.TheDepthsOfYoth,
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
	}
};

export const shatteredAeonsScenario: Scenario = {
	index: 9,
	shortName: 'VIII',
	representativeSet: KohakuEncounterSet.ShatteredAeons,
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
				image: 'tfa/tfa-8-b.webp'
			}
		]
	}
};

export const turnBackTimeScenario: Scenario = {
	index: 10,
	shortName: 'IX',
	representativeSet: KohakuEncounterSet.TurnBackTime,
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
	],
	extraInfo: {
		back: [
			{
				image: 'tfa/tfa-9-b.webp'
			}
		]
	}
};

export const returnToTheUntamedWildsScenario: Scenario = {
	index: 1,
	shortName: 'I',
	representativeSet: KohakuEncounterSet.ReturnToTheUntamedWilds,
	setups: [
		{
			shuffles: [
				{ encounterSet: theUntamedWilds, overwriteCount: 0 },
				{ encounterSet: returnToTheUntamedWilds, overwriteCount: 0 },
				ancientEvils,
				agentsOfYig,
				guardiansOfTime,
				{ encounterSet: poison, overwriteCount: 2 },
				rainforest,
				serpents,
				doomedExpedition,
				returnToTheRainforest
			]
		}
	]
};

export const returnToTheDoomOfEztliScenario: Scenario = {
	index: 2,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.ReturnToTheDoomOfEztli,
	setups: [
		{
			shuffles: [
				{ encounterSet: theDoomOfEztli, overwriteCount: 0 },
				{ encounterSet: returnToTheDoomOfEztli, overwriteCount: 0 },
				{ encounterSet: chillingCold, overwriteCount: 3 },
				agentsOfYig,
				{ encounterSet: deadlyTraps, overwriteCount: 3 },
				{ encounterSet: forgottenRuins, overwriteCount: 5 },
				{ encounterSet: poison, overwriteCount: 2 },
				serpents,
				temporalHunters,
				venomousHate
			]
		}
	]
};

export const returnToThreadsOfFateScenario: Scenario = {
	index: 3,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.ReturnToThreadsOfFate,
	setups: [
		{
			shuffles: [
				{ encounterSet: threadsOfFate, overwriteCount: 0 },
				{ encounterSet: returnToThreadsOfFate, overwriteCount: 0 },
				lockedDoors,
				nightgaunts,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 },
				pnakoticBrotherhood,
				cultOfPnakotus
			]
		}
	]
};

export const returnToTheBoundaryBeyondScenario: Scenario = {
	index: 4,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.ReturnToTheBoundaryBeyond,
	setups: [
		{
			shuffles: [
				{ encounterSet: theBoundaryBeyond, overwriteCount: 0 },
				{ encounterSet: returnToTheBoundaryBeyond, overwriteCount: 0 },
				guardiansOfTime,
				pnakoticBrotherhood,
				{ encounterSet: poison, overwriteCount: 2 },
				cultOfPnakotus,
				temporalHunters,
				venomousHate
			]
		}
	]
};

export const returnToHeartOfTheEldersPart1Scenario: Scenario = {
	index: 5,
	shortName: 'V-A',
	representativeSet: KohakuEncounterSet.ReturnToPillarsOfJudgment,
	overrideName: m.campaignRegularTheForgottenAgeScenarioHeartOfTheEldersPart1(),
	setups: [
		{
			shuffles: [
				{ encounterSet: heartOfTheElders, overwriteCount: 0 },
				{ encounterSet: pillarsOfJudgement, overwriteCount: 0 },
				{ encounterSet: returnToPillarsOfJudgement, overwriteCount: 0 },
				{ encounterSet: poison, overwriteCount: 2 },
				rainforest,
				doomedExpedition,
				returnToTheRainforest
			]
		}
	]
};

export const returnToHeartOfTheEldersPart2Scenario: Scenario = {
	index: 6,
	shortName: 'V-B',
	representativeSet: KohakuEncounterSet.ReturnToKnyan,
	overrideName: m.campaignRegularTheForgottenAgeScenarioHeartOfTheEldersPart2(),
	setups: [
		{
			shuffles: [
				{ encounterSet: heartOfTheElders, overwriteCount: 0 },
				{ encounterSet: knyan, overwriteCount: 0 },
				{ encounterSet: returnToKnyan, overwriteCount: 0 },
				agentsOfYig,
				deadlyTraps,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				venomousHate
			]
		}
	]
};

export const returnToTheCityOfArchivesScenario: Scenario = {
	index: 7,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.ReturnToTheCityOfArchives,
	setups: [
		{
			shuffles: [
				{ encounterSet: theCityOfArchives, overwriteCount: 0 },
				{ encounterSet: returnToTheCityOfArchives, overwriteCount: 0 },
				agentsOfYogSothoth,
				chillingCold,
				lockedDoors,
				strikingFear
			]
		}
	]
};

export const returnToTheDepthsOfYothScenario: Scenario = {
	index: 8,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.ReturnToTheDepthsOfYoth,
	setups: [
		{
			shuffles: [
				{ encounterSet: theDepthsOfYoth, overwriteCount: 0 },
				{ encounterSet: returnToTheDepthsOfYoth, overwriteCount: 0 },
				agentsOfYig,
				forgottenRuins,
				{ encounterSet: poison, overwriteCount: 2 },
				doomedExpedition,
				venomousHate
			]
		}
	]
};

export const returnToShatteredAeonsScenario: Scenario = {
	index: 9,
	shortName: 'VIII',
	representativeSet: KohakuEncounterSet.ReturnToShatteredAeons,
	setups: [
		{
			shuffles: [
				{ encounterSet: shatteredAeons, overwriteCount: 0 },
				{ encounterSet: returnToShatteredAeons, overwriteCount: 0 },
				ancientEvils,
				agentsOfYig,
				pnakoticBrotherhood,
				cultOfPnakotus,
				temporalHunters
			]
		}
	]
};

export const returnToTurnBackTimeScenario: Scenario = {
	index: 10,
	shortName: 'IX',
	representativeSet: KohakuEncounterSet.ReturnToTurnBackTime,
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
