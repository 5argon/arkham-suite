import { type Scenario } from '$lib/core/campaign';
import { ChaosToken, EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

import {
	agentsOfYogSothoth,
	ancientEvils,
	chillingCold,
	darkCult,
	lockedDoors,
	nightgaunts,
	rats,
	strikingFear
} from '../notz/encounter';
import {
	armitagesFate,
	badLuck,
	beastThralls,
	beyondTheThreshold,
	bishopsThralls,
	bloodOnTheAltar,
	creepingCold,
	dunwich,
	erraticFear,
	extracurricularActivity,
	hideousAbominations,
	lostInTimeAndSpace,
	naomisCrew,
	resurgentEvils,
	returnToBloodOnTheAltar,
	returnToExtracurricularActivity,
	returnToLostInTimeAndSpace,
	returnToTheEssexCountyExpress,
	returnToTheHouseAlwaysWins,
	returnToTheMiskatonicMuseum,
	returnToUndimensionedAndUnseen,
	returnToWhereDoomAwaits,
	secretDoors,
	sorcery,
	theBeyond,
	theEssexCountyExpress,
	theHouseAlwaysWins,
	theMiskatonicMuseum,
	undimensionedAndUnseen,
	whereDoomAwaits,
	whippoorwills,
	yogSothothsEmissaries
} from './encounter';

export const extracurricularActivityScenario: Scenario = {
	index: 1,
	shortName: 'I-A',
	representativeSet: KohakuEncounterSet.ExtracurricularActivity,
	setups: [
		{
			shuffles: [
				agentsOfYogSothoth,
				ancientEvils,
				lockedDoors,
				bishopsThralls,
				sorcery,
				theBeyond,
				whippoorwills
			],
			remaining: [extracurricularActivity]
		}
	],
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-1-b.webp'
			}
		]
	}
};

export const theHouseAlwaysWinsScenario: Scenario = {
	index: 2,
	shortName: 'I-B',
	representativeSet: KohakuEncounterSet.TheHouseAlwaysWins,
	setups: [
		{
			shuffles: [
				{ encounterSet: theHouseAlwaysWins, overwriteCount: 4 },
				rats,
				badLuck,
				naomisCrew
			],
			remaining: [strikingFear, hideousAbominations]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: hideousAbominations,
				what: 'The entire **Hideous Abominations** encounter set is set aside, out of play.'
			},
			{
				encounterSet: strikingFear,
				what: 'The entire **Striking Fear** encounter set is set aside, out of play.'
			}
		]
	},
	extraInfo: {	
		back: [
			{
				image: 'dwl/dwl-2-b.webp'
			}
		]
	}
};

export const theMiskatonicMuseumScenario: Scenario = {
	index: 3,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.TheMiskatonicMuseum,
	setups: [
		{
			shuffles: [
				{ encounterSet: theMiskatonicMuseum, overwriteCount: 10 },
				chillingCold,
				lockedDoors,
				badLuck,
				sorcery,
				theBeyond
			]
		}
	],
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-3-b.webp'
			}
		]
	}
};

export const theEssexCountyExpressScenario: Scenario = {
	index: 4,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.TheEssexCountyExpress,
	setups: [
		{
			shuffles: [
				{ encounterSet: theEssexCountyExpress, overwriteCount: 13 },
				ancientEvils,
				darkCult,
				strikingFear,
				theBeyond
			]
		}
	],
	commonSetup: {
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM2],
			standard: [ChaosToken.TokenM3],
			hard: [ChaosToken.TokenM4],
			expert: [ChaosToken.TokenM5]
		}
	},
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-4-b.webp'
			}
		]
	}
};

export const bloodOnTheAltarScenario: Scenario = {
	index: 5,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.BloodOnTheAltar,
	setups: [
		{
			shuffles: [
				{ encounterSet: bloodOnTheAltar, overwriteCount: 13 },
				ancientEvils,
				nightgaunts,
				dunwich,
				whippoorwills
			]
		},
		{
			shuffles: [
				{ encounterSet: bloodOnTheAltar, overwriteCount: 13 },
				ancientEvils,
				nightgaunts,
				dunwich,
				whippoorwills,
				naomisCrew
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Take out 3 encounter cards to attach under locations.'
			}
		],
		specialGather: [
			{ encounterSet: armitagesFate, overwriteCount: 1, what: ['**Dr. Henry Armitage**'] },
			{ encounterSet: theHouseAlwaysWins, overwriteCount: 1, what: ['**Dr. Francis Morgan**'] },
			{
				encounterSet: extracurricularActivity,
				overwriteCount: 1,
				what: ['**Professor Warren Rice**']
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-5-b.webp'
			}
		]
	}
};

export const undimensionedAndUnseenScenario: Scenario = {
	index: 6,
	shortName: 'V',
	representativeSet: KohakuEncounterSet.UndimensionedAndUnseen,
	setups: [
		{
			shuffles: [
				{ encounterSet: undimensionedAndUnseen, overwriteCount: 11 },
				strikingFear,
				beastThralls,
				dunwich,
				whippoorwills
			]
		}
	],
	commonSetup: {
		addBasicWeakness: [
			{
				trait: 'Madness'
			},
			{
				trait: 'Injury'
			},
			{
				trait: 'Pact'
			}
		]
	},
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-6-b.webp'
			}
		]
	}
};

export const whereDoomAwaitsScenario: Scenario = {
	index: 7,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.WhereDoomAwaits,
	setups: [
		{
			shuffles: [
				{ encounterSet: whereDoomAwaits, overwriteCount: 12 },
				ancientEvils,
				chillingCold,
				strikingFear,
				beastThralls,
				bishopsThralls,
				sorcery
			]
		},
		{
			shuffles: [
				{ encounterSet: whereDoomAwaits, overwriteCount: 12 },
				ancientEvils,
				chillingCold,
				strikingFear,
				beastThralls,
				bishopsThralls,
				sorcery,
				{ encounterSet: hideousAbominations, overwriteCount: 2 }
			],
			notes: [
				{
					encounterSet: hideousAbominations,
					what: 'One **Conglomeration of Spheres** at **Ascending Path**, the rest of the **Hideous Abominations** set in the encounter deck.'
				}
			]
		}
	],
	commonSetup: {
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM3],
			standard: [ChaosToken.TokenM5],
			hard: [ChaosToken.TokenM6],
			expert: [ChaosToken.TokenM7]
		}
	},
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-7-b.webp'
			}
		]
	}
};

export const lostInTimeAndSpaceScenario: Scenario = {
	index: 8,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.LostInTimeAndSpace,
	setups: [
		{
			shuffles: [
				{ encounterSet: lostInTimeAndSpace, overwriteCount: 23 },
				agentsOfYogSothoth,
				hideousAbominations,
				sorcery,
				theBeyond
			]
		}
	],
	extraInfo: {
		back: [
			{
				image: 'dwl/dwl-8-b.webp'
			}
		]
	}
};

export const returnToExtracurricularActivityScenario: Scenario = {
	index: 1,
	shortName: 'I-A',
	representativeSet: KohakuEncounterSet.ReturnToExtracurricularActivity,
	setups: [
		{
			name: 'As 1st Scenario',
			shuffles: [
				{ encounterSet: extracurricularActivity, overwriteCount: 0 },
				{ encounterSet: returnToExtracurricularActivity, overwriteCount: 2 },
				bishopsThralls,
				sorcery,
				whippoorwills,
				beyondTheThreshold,
				resurgentEvils,
				secretDoors,
				yogSothothsEmissaries
			],
			notes: [
				{
					encounterSet: returnToExtracurricularActivity,
					what: 'Both copies of **Enthralled Security Guard** in the encounter deck.'
				}
			]
		},
		{
			name: 'As 2nd Scenario',
			shuffles: [
				{ encounterSet: extracurricularActivity, overwriteCount: 0 },
				{ encounterSet: returnToExtracurricularActivity, overwriteCount: 1 },
				bishopsThralls,
				sorcery,
				whippoorwills,
				beyondTheThreshold,
				resurgentEvils,
				secretDoors,
				yogSothothsEmissaries
			],
			notes: [
				{
					encounterSet: returnToExtracurricularActivity,
					what: 'One **Enthralled Security Guard** is at the **Administration Building**, one in the encounter deck.'
				}
			]
		}
	]
};

export const returnToTheHouseAlwaysWinsScenario: Scenario = {
	index: 2,
	shortName: 'I-B',
	representativeSet: KohakuEncounterSet.ReturnToTheHouseAlwaysWins,
	setups: [
		{
			shuffles: [
				{ encounterSet: theHouseAlwaysWins, overwriteCount: 4 },
				{ encounterSet: returnToTheHouseAlwaysWins, overwriteCount: 4 },
				rats,
				badLuck,
				naomisCrew
			],
			remaining: [hideousAbominations, erraticFear]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: hideousAbominations,
				what: 'The entire **Hideous Abominations** encounter set is set aside, out of play.'
			},
			{
				encounterSet: erraticFear,
				what: 'The entire **Erratic Fear** encounter set is set aside, out of play.'
			}
		]
	}
};

export const returnToTheMiskatonicMuseumScenario: Scenario = {
	index: 5,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.ReturnToTheMiskatonicMuseum,
	setups: [
		{
			shuffles: [
				{ encounterSet: theMiskatonicMuseum, overwriteCount: 10 },
				{ encounterSet: returnToTheMiskatonicMuseum, overwriteCount: 4 },
				badLuck,
				sorcery,
				beyondTheThreshold,
				creepingCold,
				secretDoors
			]
		}
	]
};

export const returnToTheEssexCountyExpressScenario: Scenario = {
	index: 6,
	shortName: 'III',
	representativeSet: KohakuEncounterSet.ReturnToTheEssexCountyExpress,
	setups: [
		{
			shuffles: [
				{ encounterSet: theEssexCountyExpress, overwriteCount: 13 },
				{ encounterSet: returnToTheEssexCountyExpress, overwriteCount: 0 },
				darkCult,
				beyondTheThreshold,
				erraticFear,
				resurgentEvils
			]
		}
	],
	commonSetup: {
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM2],
			standard: [ChaosToken.TokenM3],
			hard: [ChaosToken.TokenM4],
			expert: [ChaosToken.TokenM5]
		}
	}
};

export const returnToBloodOnTheAltarScenario: Scenario = {
	index: 7,
	shortName: 'IV',
	representativeSet: KohakuEncounterSet.ReturnToBloodOnTheAltar,
	setups: [
		{
			shuffles: [
				{ encounterSet: bloodOnTheAltar, overwriteCount: 13 },
				nightgaunts,
				dunwich,
				whippoorwills,
				resurgentEvils
			],
			remaining: [returnToBloodOnTheAltar],
			notes: [
				{
					encounterSet: returnToBloodOnTheAltar,
					what: 'Both copies of **Hired Gun** are set aside.'
				}
			]
		},
		{
			shuffles: [
				{ encounterSet: bloodOnTheAltar, overwriteCount: 13 },
				{ encounterSet: returnToBloodOnTheAltar, overwriteCount: 1 },
				nightgaunts,
				dunwich,
				whippoorwills,
				resurgentEvils,
				naomisCrew
			],
			notes: [
				{
					encounterSet: returnToBloodOnTheAltar,
					what: 'One **Hired Gun** at a location not connected to **Village Commons**, the other copy in the encounter deck.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: "Take out 3 non-**Naomi's Crew** encounter cards to attach under locations."
			}
		],
		specialGather: [
			{ encounterSet: armitagesFate, overwriteCount: 1, what: ['**Dr. Henry Armitage**'] },
			{ encounterSet: theHouseAlwaysWins, overwriteCount: 1, what: ['**Dr. Francis Morgan**'] },
			{
				encounterSet: extracurricularActivity,
				overwriteCount: 1,
				what: ['**Professor Warren Rice**']
			}
		]
	}
};

export const returnToUndimensionedAndUnseenScenario: Scenario = {
	index: 8,
	shortName: 'V',
	representativeSet: KohakuEncounterSet.ReturnToUndimensionedAndUnseen,
	setups: [
		{
			shuffles: [
				{ encounterSet: undimensionedAndUnseen, overwriteCount: 11 },
				{ encounterSet: returnToUndimensionedAndUnseen, overwriteCount: 2 },
				beastThralls,
				dunwich,
				whippoorwills,
				erraticFear
			]
		}
	],
	commonSetup: {
		addBasicWeakness: [
			{
				trait: '*Madness*'
			},
			{
				trait: '*Injury*'
			},
			{
				trait: '*Pact*'
			}
		]
	}
};

export const returnToWhereDoomAwaitsScenario: Scenario = {
	index: 9,
	shortName: 'VI',
	representativeSet: KohakuEncounterSet.ReturnToWhereDoomAwaits,
	setups: [
		{
			shuffles: [
				{ encounterSet: whereDoomAwaits, overwriteCount: 12 },
				{ encounterSet: returnToWhereDoomAwaits, overwriteCount: 0 },
				beastThralls,
				bishopsThralls,
				sorcery,
				creepingCold,
				erraticFear,
				resurgentEvils
			]
		},
		{
			shuffles: [
				{ encounterSet: whereDoomAwaits, overwriteCount: 12 },
				{ encounterSet: returnToWhereDoomAwaits, overwriteCount: 0 },
				beastThralls,
				bishopsThralls,
				sorcery,
				creepingCold,
				erraticFear,
				resurgentEvils,
				{ encounterSet: hideousAbominations, overwriteCount: 2 }
			],
			notes: [
				{
					encounterSet: hideousAbominations,
					what: '1x **Conglomeration of Spheres** at **Ascending Path**, the rest of the **Hideous Abominations** set in the encounter deck.'
				}
			]
		}
	],
	commonSetup: {
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenM3],
			standard: [ChaosToken.TokenM5],
			hard: [ChaosToken.TokenM6],
			expert: [ChaosToken.TokenM7]
		}
	}
};

export const returnToLostInTimeAndSpaceScenario: Scenario = {
	index: 10,
	shortName: 'VII',
	representativeSet: KohakuEncounterSet.ReturnToLostInTimeAndSpace,
	setups: [
		{
			shuffles: [
				{ encounterSet: lostInTimeAndSpace, overwriteCount: 23 },
				{ encounterSet: returnToLostInTimeAndSpace, overwriteCount: 3 },
				hideousAbominations,
				sorcery,
				beyondTheThreshold,
				yogSothothsEmissaries
			]
		}
	]
};
