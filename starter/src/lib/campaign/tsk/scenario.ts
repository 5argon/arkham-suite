import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

import {
	ancientEvils,
	chillingCold,
	darkCult,
	ghouls,
	lockedDoors,
	nightgaunts,
	strikingFear,
	theMidnightMasks
} from '../notz/encounter';
import {
	agentsOfTheOutside,
	agentsOfYuggoth,
	beyondTheBeyond,
	cleanupCrew,
	congressOfTheKey,
	crimsonConspiracy,
	dancingMad,
	darkVeiling,
	deadHeat,
	dealingsInTheDark,
	dogsOfWar,
	mysteriesAbound,
	onThinIce,
	outsiders,
	redCoterie,
	riddlesAndRain,
	sanguineShadows,
	scarletSorcery,
	secretWar,
	shadesOfSuffering,
	shadowOfADoubt,
	spatialAnomaly,
	spreadingCorruption,
	strangeHappenings,
	withoutATrace
} from './encounter';

export const riddlesAndRainScenario: Scenario = {
	index: 1,
	shortName: '5-A',
	representativeSet: KohakuEncounterSet.RiddlesAndRain,
	setups: [
		{
			shuffles: [
				{ encounterSet: riddlesAndRain, overwriteCount: 0 },
				darkVeiling,
				shadowOfADoubt,
				strangeHappenings,
				chillingCold,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 }
			],
			remaining: [crimsonConspiracy, outsiders]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (4)',
				what: '**The Red-Gloved Man**, **Coterie Agents** (A, B, and C).'
			}
		]
	}
};

export const deadHeatScenario: Scenario = {
	index: 2,
	shortName: '11-B',
	representativeSet: KohakuEncounterSet.DeadHeat,
	setups: [
		{
			shuffles: [
				{ encounterSet: deadHeat, overwriteCount: 8 },
				scarletSorcery,
				spreadingCorruption,
				ghouls,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: deadHeat,
				what: '2x **Ancient Raider** are set aside, out of play, along with unique enemies. The story card is also set aside at start.'
			}
		]
	}
};

export const sanguineShadowsScenario: Scenario = {
	index: 3,
	shortName: '16-D',
	representativeSet: KohakuEncounterSet.SanguineShadows,
	setups: [
		{
			shuffles: [
				{ encounterSet: sanguineShadows, overwriteCount: 8 },
				darkVeiling,
				mysteriesAbound,
				shadowOfADoubt,
				strangeHappenings,
				lockedDoors,
				nightgaunts
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (2)',
				what: '**La Chica Roja** and **Apportioned Ka**.'
			}
		]
	}
};

export const dealingsInTheDarkScenario: Scenario = {
	index: 4,
	shortName: '21-F',
	representativeSet: KohakuEncounterSet.DealingsInTheDark,
	setups: [
		{
			shuffles: [
				{ encounterSet: dealingsInTheDark, overwriteCount: 9 },
				{ encounterSet: agentsOfYuggoth, overwriteCount: 3 },
				darkVeiling,
				ancientEvils,
				darkCult,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 5 }
			],
			remaining: [{ encounterSet: agentsOfYuggoth, overwriteCount: 1 }]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (8)',
				what: '3x **Acolyte** (any), **Wizard of the Order**, **Sinister Aspirants** (A, B and C), and **Emissary from Yuggoth**.'
			},
			{
				what: 'The starting encounter deck count is reduced equal to amount of players, since each investigator draws a *Cultist* enemy at the start.'
			},
			{
				encounterSet: agentsOfYuggoth,
				what: '**The Emissary from Yuggoth** enemy is set aside, out of play.'
			}
		]
	}
};

export const dancingMadScenario: Scenario = {
	index: 5,
	shortName: '28-I',
	representativeSet: KohakuEncounterSet.DancingMad,
	setups: [
		{
			name: 'v. I',
			shuffles: [
				{ encounterSet: dancingMad, overwriteCount: 2 },
				agentsOfTheOutside,
				secretWar,
				shadowOfADoubt
			],
			remaining: [cleanupCrew, crimsonConspiracy]
		},
		{
			name: 'v. II',
			shuffles: [
				{ encounterSet: dancingMad, overwriteCount: 2 },
				{ encounterSet: agentsOfTheOutside, overwriteCount: 2 },
				cleanupCrew,
				crimsonConspiracy,
				{ encounterSet: secretWar, overwriteCount: 5 },
				shadowOfADoubt
			],
			notes: [
				{
					encounterSet: agentsOfTheOutside,
					what: '2x **Paradigm Effacer** are set aside, out of play.'
				},
				{
					encounterSet: secretWar,
					what: '2x **Otherworldly Mimic** are set aside, out of play.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (8)',
				what: '**Desiderio Delgado Álvarez**, **Coterie Agents** (A, B and C), **Coterie Assassins** (A and B), and **Coterie Enforcers** (A and B).'
			}
		]
	}
};

export const onThinIceScenario: Scenario = {
	index: 6,
	shortName: '33-K',
	representativeSet: KohakuEncounterSet.OnThinIce,
	setups: [
		{
			shuffles: [
				{ encounterSet: onThinIce, overwriteCount: 8 },
				agentsOfTheOutside,
				agentsOfYuggoth,
				crimsonConspiracy,
				darkVeiling,
				outsiders,
				spatialAnomaly,
				chillingCold
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (9)',
				what: "**Emissary from Yuggoth**, and **Coterie Agents** (A, B and C). Also gather **Void Chimera**'s mini-card and the four special **Void Chimera** decoys."
			}
		]
	}
};

export const dogsOfWarScenario: Scenario = {
	index: 7,
	shortName: '38-N',
	representativeSet: KohakuEncounterSet.DogsOfWar,
	setups: [
		{
			name: 'v. I',
			shuffles: [
				{ encounterSet: dogsOfWar, overwriteCount: 6 },
				scarletSorcery,
				spatialAnomaly,
				spreadingCorruption,
				darkCult
			]
		},
		{
			name: 'v. II',
			shuffles: [
				{ encounterSet: dogsOfWar, overwriteCount: 6 },
				{ encounterSet: cleanupCrew, overwriteCount: 5 },
				scarletSorcery,
				spatialAnomaly,
				spreadingCorruption
			],
			notes: [
				{
					topic: 'Concealed Mini-Cards (4)',
					what: '**Coterie Assassins** (A and B) and **Coterie Enforcers** (A and B).'
				},
				{
					encounterSet: cleanupCrew,
					what: '**Coterie Assassin** (A) starts the game concealed, with 1 additional decoy for each other investigator in the game.'
				}
			]
		},
		{
			name: 'v. III',
			shuffles: [
				{ encounterSet: dogsOfWar, overwriteCount: 6 },
				cleanupCrew,
				scarletSorcery,
				spatialAnomaly,
				spreadingCorruption,
				darkCult
			],
			notes: [
				{
					topic: 'Concealed Mini-Cards (4)',
					what: '**Coterie Assassins** (A and B) and **Coterie Enforcers** (A and B).'
				}
			]
		}
	]
};

export const shadesOfSufferingScenario: Scenario = {
	index: 8,
	shortName: '46-Q',
	representativeSet: KohakuEncounterSet.ShadesOfSuffering,
	setups: [
		{
			shuffles: [
				{ encounterSet: shadesOfSuffering, overwriteCount: 5 },
				darkVeiling,
				mysteriesAbound,
				scarletSorcery,
				spreadingCorruption,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Card',
				what: '**Tzu San Niang**.'
			}
		]
	}
};

export const withoutATraceScenario: Scenario = {
	index: 9,
	shortName: '56-Y',
	representativeSet: KohakuEncounterSet.WithoutATrace,
	setups: [
		{
			shuffles: [
				{ encounterSet: withoutATrace, overwriteCount: 0 },
				agentsOfTheOutside,
				{ encounterSet: beyondTheBeyond, overwriteCount: 2 },
				{ encounterSet: outsiders, overwriteCount: 5 },
				secretWar,
				spreadingCorruption
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (3)',
				what: '**City of Remnants** (L, M and R).'
			},
			{
				encounterSet: outsiders,
				what: '**The Apocalyptic Presage** enemy is set aside, out of play.'
			}
		]
	}
};

export const congressOfTheKeysScenario: Scenario = {
	index: 10,
	shortName: '59-Z',
	representativeSet: KohakuEncounterSet.CongressOfTheKeys,
	setups: [
		{
			name: 'v. I',
			shuffles: [
				{ encounterSet: congressOfTheKey, overwriteCount: 0 },
				scarletSorcery,
				spatialAnomaly,
				spreadingCorruption,
				lockedDoors
			],
			remaining: [
				agentsOfTheOutside,
				{ encounterSet: beyondTheBeyond, overwriteCount: 2 },
				outsiders,
				secretWar,
				ancientEvils,
				{ encounterSet: strikingFear, overwriteCount: 4 },
				redCoterie
			],
			notes: [
				{
					encounterSet: spreadingCorruption,
					what: 'Reference v.II / v.III instruction for the 2nd encounter deck, but exclude the **Spreading Corruption** set which is already in the 1st deck. (You should have 26 cards.)'
				}
			]
		},
		{
			name: 'v. II/III',
			shuffles: [
				{ encounterSet: congressOfTheKey, overwriteCount: 0 },
				agentsOfTheOutside,
				{ encounterSet: beyondTheBeyond, overwriteCount: 2 },
				outsiders,
				secretWar,
				spreadingCorruption,
				ancientEvils,
				{ encounterSet: strikingFear, overwriteCount: 4 }
			],
			remaining: [redCoterie],
			notes: [
				{
					encounterSet: beyondTheBeyond,
					what: 'Remaining 9 cards form the **Otherworld deck**.'
				},
				{
					encounterSet: strikingFear,
					what: '3x **Rotting Remains** are removed from the encounter set.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				topic: 'Concealed Mini-Cards (4~5)',
				what: '**City of Remnants** (L, M, and R), **Mimetic Nemesis**, and **The Red-Gloved Man** (only if playing v. I or v. III).'
			},
			{
				encounterSet: redCoterie,
				what: 'For each *Coterie* enemy gathered, check if they are the bearer of any key(s) and also gather those keys.'
			}
		]
	}
};
