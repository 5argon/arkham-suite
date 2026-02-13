import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

import {
	ancientEvils,
	chillingCold,
	darkCult,
	ghouls,
	lockedDoors,
	nightgaunts,
	rats,
	strikingFear
} from '../notz/encounter';
import {
	agentsOfAtlachNacha,
	agentsOfNyarlathotep,
	aThousandShapesOfHorror,
	beyondTheGatesOfSleep,
	corsairs,
	creaturesOfTheUnderworld,
	darkSideOfTheMoon,
	descentIntoThePitch,
	dreamersCurse,
	dreamlands,
	mergingRealities,
	pointOfNoReturn,
	spiders,
	terrorOfTheVale,
	theSearchForKadath,
	wakingNightmare,
	weaverOfTheCosmos,
	whereTheGodsDwell,
	whispersOfHypnos,
	zoogs
} from './encounter';

export const beyondTheGatesOfSleepScenario: Scenario = {
	index: 1,
	shortName: 'I-A',
	representativeSet: KohakuEncounterSet.BeyondTheGatesOfSleep,
	setups: [
		{
			shuffles: [
				{ encounterSet: beyondTheGatesOfSleep, overwriteCount: 3 },
				chillingCold,
				agentsOfNyarlathotep,
				dreamersCurse,
				dreamlands,
				zoogs
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'This scenario does not begin with an encounter deck in play.'
			},
			{
				encounterSet: beyondTheGatesOfSleep,
				what: '3 cards in the encounter deck : 2x **Lost in the Woods**, 1x **Ancient Zoog**. **Laboring Gug** is set aside.'
			}
		]
	}
};

export const wakingNightmareScenario: Scenario = {
	index: 2,
	shortName: 'I-B',
	representativeSet: KohakuEncounterSet.WakingNightmare,
	setups: [
		{
			shuffles: [
				{ encounterSet: wakingNightmare, overwriteCount: 2 },
				lockedDoors,
				strikingFear,
				mergingRealities,
				whispersOfHypnos
			],
			remaining: [spiders, agentsOfAtlachNacha]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: wakingNightmare,
				what: '2x **Suspicious Orderly** in the starting encounter deck.'
			},
			{
				encounterSet: spiders,
				what: 'The entire **Spiders** encounter set is set aside, out of play.'
			},
			{
				encounterSet: agentsOfAtlachNacha,
				what: 'The entire **Agents of Atlach-Nacha** encounter set is set aside, out of play.'
			}
		]
	}
};

export const theSearchForKadathScenario: Scenario = {
	index: 3,
	shortName: 'II-A',
	representativeSet: KohakuEncounterSet.TheSearchForKadath,
	setups: [
		{
			name: '1~2 Players',
			shuffles: [
				{ encounterSet: theSearchForKadath, overwriteCount: 7 },
				{ encounterSet: agentsOfNyarlathotep, overwriteCount: 3 },
				{ encounterSet: corsairs, overwriteCount: 2 },
				dreamlands,
				whispersOfHypnos,
				zoogs
			],
			notes: [
				{
					encounterSet: theSearchForKadath,
					what: '1x **Pack of Vooniths** at **Skai River**, 1x in the encounter deck.'
				}
			]
		},
		{
			name: '3~4 Players',
			shuffles: [
				{ encounterSet: theSearchForKadath, overwriteCount: 6 },
				{ encounterSet: agentsOfNyarlathotep, overwriteCount: 3 },
				{ encounterSet: corsairs, overwriteCount: 2 },
				dreamlands,
				whispersOfHypnos,
				zoogs
			],
			notes: [
				{
					encounterSet: theSearchForKadath,
					what: '1x **Pack of Vooniths** at **Skai River**, 1x at **Dylath Leen**.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theSearchForKadath,
				what: 'All 4 treachery cards in **The Search for Kadath** encounter set are in the encounter deck.'
			},
			{
				encounterSet: theSearchForKadath,
				what: 'For enemy cards, only 2x **Nightriders** and 0~1x **Pack of Vooniths** in the encounter deck. Other enemy cards of **The Search for Kadath** encounter set are set aside.'
			},
			{
				encounterSet: corsairs,
				what: '2x **Corsair of Leng** are set aside, out of play.'
			},
			{
				encounterSet: agentsOfNyarlathotep,
				what: '**The Crawling Mist** is set aside, out of play.'
			}
		]
	}
};

export const aThousandShapesOfHorrorScenario: Scenario = {
	index: 4,
	shortName: 'II-B',
	representativeSet: KohakuEncounterSet.AThousandShapesOfHorror,
	setups: [
		{
			shuffles: [
				{ encounterSet: aThousandShapesOfHorror, overwriteCount: 8 },
				chillingCold,
				ghouls,
				lockedDoors,
				rats,
				creaturesOfTheUnderworld,
				mergingRealities
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: aThousandShapesOfHorror,
				what: 'Every treachery except 4x **Endless Descent** is in the encounter deck.'
			}
		]
	}
};

export const darkSideOfTheMoonScenario: Scenario = {
	index: 5,
	shortName: 'III-A',
	representativeSet: KohakuEncounterSet.DarkSideOfTheMoon,
	setups: [
		{
			shuffles: [
				{ encounterSet: darkSideOfTheMoon, overwriteCount: 15 },
				ancientEvils,
				corsairs,
				dreamersCurse
			]
		}
	],
	commonSetup: {
		notes: [{ encounterSet: darkSideOfTheMoon, what: '**Moon Lizard** is set aside, out of play.' }]
	}
};

export const pointOfNoReturnScenario: Scenario = {
	index: 6,
	shortName: 'III-B',
	representativeSet: KohakuEncounterSet.PointOfNoReturn,
	setups: [
		{
			shuffles: [
				{ encounterSet: pointOfNoReturn, overwriteCount: 6 },
				ancientEvils,
				ghouls,
				strikingFear,
				creaturesOfTheUnderworld,
				whispersOfHypnos
			],
			remaining: [descentIntoThePitch, terrorOfTheVale, nightgaunts, agentsOfAtlachNacha]
		}
	],
	commonSetup: {
		specialGather: [
			{ encounterSet: beyondTheGatesOfSleep, what: ['**Enchanted Woods (Stone Trapdoor)**'] }
		],
		notes: [
			{
				encounterSet: pointOfNoReturn,
				what: '6 treachery cards in the starting encounter deck : 2x **Unexpected Ambush**, 2x **Taste of Lifeblood**, 2x **Lit by Death-Fire**.'
			},
			{
				encounterSet: descentIntoThePitch,
				what: 'The entire **Descent into the Pitch** encounter set is set aside, out of play.'
			},
			{
				encounterSet: terrorOfTheVale,
				what: 'The entire **Terror of the Vale** encounter set is set aside, out of play.'
			},
			{
				encounterSet: nightgaunts,
				what: 'The entire **Nightgaunts** encounter set is set aside, out of play.'
			},
			{
				encounterSet: agentsOfAtlachNacha,
				what: 'The entire **Agents of Atlach-Nacha** encounter set is set aside, out of play.'
			}
		]
	}
};

export const whereTheGodsDwellScenario: Scenario = {
	index: 7,
	shortName: 'IV-A',
	representativeSet: KohakuEncounterSet.WhereTheGodsDwell,
	setups: [
		{
			shuffles: [
				{ encounterSet: whereTheGodsDwell, overwriteCount: 9 },
				darkCult,
				{ encounterSet: agentsOfNyarlathotep, overwriteCount: 3 },
				dreamersCurse,
				whispersOfHypnos
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: whereTheGodsDwell,
				what: '5 treacheries in the starting encounter deck : 3x **Restless Journey**, 2x **Abandoned by the Gods**.'
			},
			{
				encounterSet: whereTheGodsDwell,
				what: '4 enemies in the starting encounter deck : 3x **Liar with No Face**, **Dhole of the Wastes**.'
			},
			{
				encounterSet: agentsOfNyarlathotep,
				what: '**The Crawling Mist** is set aside, out of play.'
			}
		]
	}
};

export const weaverOfTheCosmosScenario: Scenario = {
	index: 8,
	shortName: 'IV-B',
	representativeSet: KohakuEncounterSet.WeaverOfTheCosmos,
	setups: [
		{
			shuffles: [
				{ encounterSet: weaverOfTheCosmos, overwriteCount: 9 },
				ancientEvils,
				chillingCold,
				agentsOfAtlachNacha,
				spiders
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: weaverOfTheCosmos,
				what: '6 treacheries + 3 enemies in the starting encounter deck : 3x **Caught in a Web**, 3x **Endless Weaving**, 3x **Web-Spinner**.'
			}
		]
	}
};
