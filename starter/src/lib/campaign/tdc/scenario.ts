import type { Scenario } from '$lib/core/campaign';
import {
	EncounterSet as KohakuEncounterSet,
	Scenario as KohakuScenario
} from '@5argon/arkham-kohaku';

import {
	agentsOfCthulhu,
	ancientEvils,
	chillingCold,
	darkCult,
	lockedDoors,
	nightgaunts,
	rats,
	strikingFear,
	theMidnightMasks
} from '../notz/encounter';
import {
	alienMachinery,
	cosmicLegacy,
	courtOfTheAncients,
	deepOnes,
	domination,
	dreams,
	elderMist,
	flood,
	obsidianCanyons,
	oneLastJob,
	pilgrims,
	rlyeh,
	sepulchreOfTheSleeper,
	starSpawn,
	stowaways,
	theApiary,
	theDoomOfArkhamPt1,
	theDoomOfArkhamPt2,
	theDrownedQuarter,
	theGrandVault,
	theInescapable,
	theWesternWall,
	underseaCreatures
} from './encounter';
import { m } from '@5argon/arkham-string';

export const oneLastJobScenario: Scenario = {
	kohakuScenario: KohakuScenario.OneLastJob,
	shortName: 'I',
	setups: [
		{
			shuffles: [
				{ encounterSet: oneLastJob, overwriteCount: 9 },
				dreams,
				chillingCold,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 0 },
				rats,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: oneLastJob,
				what: '**Sadie Sheldon**, **Naomi O’Bannion**, and both copies of **Gang Enforcer** are set aside, out of play.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Only the **location** cards are gathered from **The Midnight Masks**. None enter the encounter deck.'
			}
		]
	}
};

export const theWesternWallWesternScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheWesternWall,
	overrideName: m.campaignRegularTheDrownedCityScenarioTheWesternWall() + ' (West)',
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theWesternWall, overwriteCount: 4 },
				cosmicLegacy,
				deepOnes,
				flood,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 0 },
				{ encounterSet: theInescapable, overwriteCount: 3 },
				underseaCreatures,
				agentsOfCthulhu
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theWesternWall,
				what: 'Only 3x **Look Out!** and 1x **Deep One Matron** enter the encounter deck.'
			},
			{
				encounterSet: starSpawn,
				what: 'Only the **Coral Star Spawn** is gathered, set aside out of play.'
			},
			{
				encounterSet: theInescapable,
				what: 'Only 3x **Still Behind You** enter the encounter deck.'
			}
		]
	}
};

export const theWesternWallEasternScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheWesternWall,
	overrideName: m.campaignRegularTheDrownedCityScenarioTheWesternWall() + ' (East)',
	shortName: '?',
	setups: [
		{
			name: 'Creature not defeated',
			shuffles: [
				{ encounterSet: theWesternWall, overwriteCount: 4 },
				cosmicLegacy,
				deepOnes,
				flood,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 0 },
				{ encounterSet: theInescapable, overwriteCount: 4 },
				underseaCreatures,
				agentsOfCthulhu
			],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'The entire **The Inescapable** set is shuffled into the encounter deck.'
				}
			]
		},
		{
			name: 'Creature defeated',
			shuffles: [
				{ encounterSet: theWesternWall, overwriteCount: 4 },
				cosmicLegacy,
				deepOnes,
				flood,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 0 },
				underseaCreatures,
				agentsOfCthulhu
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theWesternWall,
				what: 'Only 3x **Look Out!** and 1x **Deep One Matron** enter the encounter deck.'
			},
			{
				encounterSet: starSpawn,
				what: 'Only the **Coral Star Spawn** is gathered, set aside out of play.'
			}
		]
	}
};

export const theDrownedQuarterScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheDrownedQuarter,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDrownedQuarter, overwriteCount: 3 },
				alienMachinery,
				cosmicLegacy,
				deepOnes,
				elderMist,
				flood,
				rlyeh,
				underseaCreatures
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theDrownedQuarter,
				what: 'Only 3x **Medusa** enter the encounter deck.'
			}
		]
	}
};

export const theApiaryWesternScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheApiary,
	overrideName: m.campaignRegularTheDrownedCityScenarioTheApiary() + ' (West)',
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theApiary, overwriteCount: 14 },
				cosmicLegacy,
				elderMist,
				{ encounterSet: theInescapable, overwriteCount: 0 },
				{ encounterSet: pilgrims, overwriteCount: 0 },
				darkCult,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theApiary,
				what: 'Remove the **Mother** enemy from the game.'
			},
			{
				encounterSet: theApiary,
				what: '13 cards from this set enter the encounter deck: 3 locations (**Growing Fields** and 2x **Fleshy Paths**) plus 3x **Apiary Tender**, 2x **Dangerous Curiosity**, 2x **Hungry Walls**, and 3x **Alien Eggs**. **Luminous Tunnels** is then shuffled into the bottom ten cards.'
			},
			{
				encounterSet: theApiary,
				what: 'The **Grotesque Amalgam** enemy is set aside, out of play.'
			},
			{
				encounterSet: pilgrims,
				what: 'The entire **Pilgrims** encounter set is gathered but set aside, out of play.'
			},
			{
				encounterSet: theInescapable,
				what: '**The Inescapable** encounter set is gathered but set aside, out of play. Remove it from the game instead if *the creature was defeated*.'
			}
		]
	}
};

export const theApiaryEasternScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheApiary,
	overrideName: m.campaignRegularTheDrownedCityScenarioTheApiary() + ' (East)',
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theApiary, overwriteCount: 14 },
				cosmicLegacy,
				elderMist,
				{ encounterSet: theInescapable, overwriteCount: 0 },
				{ encounterSet: starSpawn, overwriteCount: 1 },
				stowaways,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theApiary,
				what: 'The **Mother** enemy is set aside, out of play.'
			},
			{
				encounterSet: theApiary,
				what: '13 cards from this set enter the encounter deck: 3 locations (**Growing Fields** and 2x **Fleshy Paths**) plus 3x **Apiary Tender**, 2x **Dangerous Curiosity**, 2x **Hungry Walls**, and 3x **Alien Eggs**. **Grasping Corridor** is then shuffled into the bottom ten cards.'
			},
			{
				encounterSet: theApiary,
				what: 'The **Grotesque Amalgam** enemy is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: 'Only the **Infected Star Spawn** enemy is gathered.'
			},
			{
				encounterSet: theInescapable,
				what: '**The Inescapable** encounter set is gathered but set aside, out of play. Remove it from the game instead if *the creature was defeated*.'
			}
		]
	}
};

export const theGrandVaultScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheGrandVault,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: theGrandVault, overwriteCount: 4 },
				alienMachinery,
				flood,
				{ encounterSet: theInescapable, overwriteCount: 3 },
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theGrandVault,
				what: 'Only 1x **Slitherer in Darkness** and 3x **Deadly Mechanisms** enter the encounter deck; the **Vault Attendant** enemies are set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: 'Shuffle the **Star Spawn** enemies, remove two at random from the game, and set the rest aside, out of play.'
			},
			{
				encounterSet: theInescapable,
				what: 'Only 3x **Still Behind You** enter the encounter deck.'
			}
		]
	}
};

export const courtOfTheAncientsWesternScenario: Scenario = {
	kohakuScenario: KohakuScenario.CourtOfTheAncients,
	overrideName: m.campaignRegularTheDrownedCityScenarioCourtOfTheAncients() + ' (West)',
	shortName: '?',
	setups: [
		{
			name: 'Creature not defeated',
			shuffles: [
				{ encounterSet: courtOfTheAncients, overwriteCount: 11 },
				domination,
				dreams,
				elderMist,
				{ encounterSet: theInescapable, overwriteCount: 3 },
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 1 },
				stowaways
			],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'Only 3x **Still Behind You** enter the encounter deck.'
				}
			]
		},
		{
			name: 'Creature defeated',
			shuffles: [
				{ encounterSet: courtOfTheAncients, overwriteCount: 11 },
				domination,
				dreams,
				elderMist,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 1 },
				stowaways
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: courtOfTheAncients,
				what: 'The **Colossal Tyrant** enemy is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: 'Set the **Star Spawn Observer** aside, then remove two of the other three at random. The last one enters the encounter deck.'
			}
		]
	}
};

export const courtOfTheAncientsEasternScenario: Scenario = {
	kohakuScenario: KohakuScenario.CourtOfTheAncients,
	overrideName: m.campaignRegularTheDrownedCityScenarioCourtOfTheAncients() + ' (East)',
	shortName: '?',
	setups: [
		{
			name: 'Creature not defeated',
			shuffles: [
				{ encounterSet: courtOfTheAncients, overwriteCount: 11 },
				domination,
				dreams,
				elderMist,
				{ encounterSet: theInescapable, overwriteCount: 3 },
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 0 },
				pilgrims
			],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'Only 3x **Still Behind You** enter the encounter deck.'
				}
			]
		},
		{
			name: 'Creature defeated',
			shuffles: [
				{ encounterSet: courtOfTheAncients, overwriteCount: 11 },
				domination,
				dreams,
				elderMist,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 0 },
				pilgrims
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: courtOfTheAncients,
				what: 'The **Colossal Tyrant** enemy is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: 'Only the **Star Spawn Observer** is gathered, set aside out of play.'
			}
		]
	}
};

export const obsidianCanyonsScenario: Scenario = {
	kohakuScenario: KohakuScenario.ObsidianCanyons,
	shortName: '?',
	setups: [
		{
			name: 'Creature not defeated',
			shuffles: [
				{ encounterSet: obsidianCanyons, overwriteCount: 12 },
				cosmicLegacy,
				elderMist,
				{ encounterSet: theInescapable, overwriteCount: 3 },
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 2 },
				{ encounterSet: ancientEvils, overwriteCount: 0 },
				{ encounterSet: chillingCold, overwriteCount: 0 },
				nightgaunts,
				{ encounterSet: strikingFear, overwriteCount: 0 }
			],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'Only 3x **Still Behind You** enter the encounter deck.'
				}
			]
		},
		{
			name: 'Creature defeated',
			shuffles: [
				{ encounterSet: obsidianCanyons, overwriteCount: 12 },
				cosmicLegacy,
				elderMist,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 2 },
				{ encounterSet: ancientEvils, overwriteCount: 0 },
				{ encounterSet: chillingCold, overwriteCount: 0 },
				nightgaunts,
				{ encounterSet: strikingFear, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: starSpawn,
				what: 'Shuffle the **Star Spawn** enemies and remove two at random from the game; the rest enter the encounter deck.'
			},
			{
				encounterSet: ancientEvils,
				what: 'The **Ancient Evils** set is used only for its **open sky** backs; set aside, not in the encounter deck.'
			},
			{
				encounterSet: chillingCold,
				what: 'The **Chilling Cold** set is used only for its **open sky** backs; set aside, not in the encounter deck.'
			},
			{
				encounterSet: strikingFear,
				what: 'The **Striking Fear** set is used only for its **open sky** backs; set aside, not in the encounter deck.'
			}
		]
	}
};

export const sepulchreOfTheSleeperScenario: Scenario = {
	kohakuScenario: KohakuScenario.SepulchreOfTheSleeper,
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: sepulchreOfTheSleeper, overwriteCount: 0 },
				domination,
				dreams,
				rlyeh,
				starSpawn,
				ancientEvils,
				strikingFear
			]
		}
	]
};

export const theDoomOfArkhamPart1Scenario: Scenario = {
	kohakuScenario: KohakuScenario.TheDoomOfArkham,
	overrideName: m.campaignRegularTheDrownedCityScenarioTheDoomOfArkhamPartI(),
	shortName: 'Finale (I)',
	setups: [
		{
			name: 'Standard / Hard / Expert',
			shuffles: [
				{ encounterSet: theDoomOfArkhamPt1, overwriteCount: 0 },
				deepOnes,
				domination,
				dreams,
				{ encounterSet: starSpawn, overwriteCount: 2 },
				agentsOfCthulhu,
				{ encounterSet: theMidnightMasks, overwriteCount: 0 }
			],
			notes: [
				{
					encounterSet: starSpawn,
					what: 'Shuffle the **Star Spawn** enemies and remove two at random from the game.'
				}
			]
		},
		{
			name: 'Easy',
			shuffles: [
				{ encounterSet: theDoomOfArkhamPt1, overwriteCount: 0 },
				deepOnes,
				domination,
				dreams,
				{ encounterSet: starSpawn, overwriteCount: 1 },
				agentsOfCthulhu,
				{ encounterSet: theMidnightMasks, overwriteCount: 0 }
			],
			notes: [
				{
					encounterSet: starSpawn,
					what: 'Shuffle the **Star Spawn** enemies and remove three at random from the game.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				what: 'Place starting doom on the agenda equal to the number of investigators.'
			},
			{
				encounterSet: theDoomOfArkhamPt1,
				what: '**Randall Tillinghast** is set aside, out of play; none of this set’s cards enter the encounter deck.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Gather only the **location** and **treachery** cards. Locations are placed in play and the treacheries go face-down under locations, so none enter the encounter deck.'
			}
		]
	}
};

export const theDoomOfArkhamPart2Scenario: Scenario = {
	kohakuScenario: KohakuScenario.TheDoomOfArkham,
	overrideName: m.campaignRegularTheDrownedCityScenarioTheDoomOfArkhamPartII(),
	shortName: 'Finale (II)',
	setups: [
		{
			shuffles: [
				{ encounterSet: theDoomOfArkhamPt2, overwriteCount: 8 },
				domination,
				elderMist,
				flood,
				{ encounterSet: starSpawn, overwriteCount: 0 },
				agentsOfCthulhu,
				{ encounterSet: theMidnightMasks, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: starSpawn,
				what: 'The entire **Star Spawn** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theMidnightMasks,
				what: 'Only the **location** cards are gathered from **The Midnight Masks**. None enter the encounter deck.'
			}
		]
	}
};
