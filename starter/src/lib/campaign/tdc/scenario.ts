import type { Scenario } from '$lib/core/campaign';
import { ChaosToken, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
				rats,
				strikingFear
			],
			remaining: [theMidnightMasks]
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
				{ encounterSet: theInescapable, overwriteCount: 3 },
				underseaCreatures,
				agentsOfCthulhu
			],
			remaining: [starSpawn]
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
				what: 'Only the **Coral Star Spawn** is gathered and set aside, out of play.'
			},
			{
				encounterSet: theInescapable,
				what: '**The Inescapable** is set aside, out of play. Only 3x **Still Behind You** enter the encounter deck.'
			},
			{
				what: 'Add the flood tokens to the token pool. Each location on levels 2–3 starts **partially flooded**, and each location on levels 4–5 starts **fully flooded**.'
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
				theInescapable,
				underseaCreatures,
				agentsOfCthulhu
			],
			remaining: [starSpawn],
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
				underseaCreatures,
				agentsOfCthulhu
			],
			remaining: [starSpawn],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'The entire **The Inescapable** encounter set is removed from the game.'
				}
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
				what: 'Only the **Coral Star Spawn** is gathered and set aside, out of play.'
			},
			{
				what: 'Add the flood tokens to the token pool. Each location on levels 1–2 starts **fully flooded**, and each location on levels 3–4 starts **partially flooded**.'
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
			},
			{
				what: 'If *the expedition headed east*, increase the flood level of 1 [per_investigator] **Sea Floor** locations.'
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
				darkCult,
				strikingFear
			],
			remaining: [theInescapable, pilgrims]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: theApiary,
				what: 'Remove the **Mother** enemy from the game.'
			},
			{
				encounterSet: theApiary,
				what: '14 cards from this set enter the encounter deck. First shuffle 13: 3 locations (**Growing Fields** and 2x **Fleshy Paths**) plus 3x **Apiary Tender**, 2x **Dangerous Curiosity**, 2x **Hungry Walls**, and 3x **Alien Eggs**. Then shuffle **Luminous Tunnels** into the bottom 10 cards.'
			},
			{
				encounterSet: theApiary,
				what: 'The **Grotesque Amalgam** enemy is set aside, out of play.'
			},
			{
				encounterSet: pilgrims,
				what: 'The entire **Pilgrims** encounter set is set aside, out of play.'
			},
			{
				encounterSet: theInescapable,
				what: 'The entire **The Inescapable** encounter set is set aside, out of play.'
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
				{ encounterSet: starSpawn, overwriteCount: 1 },
				stowaways,
				strikingFear
			],
			remaining: [theInescapable]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenTablet],
		notes: [
			{
				encounterSet: theApiary,
				what: 'The **Mother** enemy is set aside, out of play.'
			},
			{
				encounterSet: theApiary,
				what: '14 cards from this set enter the encounter deck. First shuffle 13: 3 locations (**Growing Fields** and 2x **Fleshy Paths**) plus 3x **Apiary Tender**, 2x **Dangerous Curiosity**, 2x **Hungry Walls**, and 3x **Alien Eggs**. Then shuffle **Grasping Corridor** into the bottom 10 cards.'
			},
			{
				encounterSet: theApiary,
				what: 'The **Grotesque Amalgam** enemy is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: 'Only the **Infected Star Spawn** is gathered and shuffled into the encounter deck.'
			},
			{
				encounterSet: theInescapable,
				what: 'The entire **The Inescapable** encounter set is set aside, out of play. Remove it from the game instead if *the creature was defeated*.'
			}
		]
	}
};

export const theGrandVaultScenario: Scenario = {
	kohakuScenario: KohakuScenario.TheGrandVault,
	shortName: '?',
	setups: [
		{
			shuffles: [{ encounterSet: theGrandVault, overwriteCount: 4 }, alienMachinery, flood, rlyeh],
			remaining: [theInescapable, starSpawn]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing],
		notes: [
			{
				encounterSet: theGrandVault,
				what: 'Only 1x **Slitherer in Darkness** and 3x **Deadly Mechanisms** enter the encounter deck. The **Vault Attendant** enemies are set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: '2 out of 4 randomized **Star Spawn** enemy set aside, out of play, the rest are removed from the game.'
			},
			{
				encounterSet: theInescapable,
				what: 'The entire **The Inescapable** encounter set is set aside, out of play.'
			},
			{
				what: 'Add the flood tokens to the token pool. The 3 **Vault Chamber** locations in the bottom row start **partially flooded**.'
			},
			{
				what: 'If *the power was diverted*, place 1 resource on the bottom left **Vault Chamber**. Otherwise, place 1 resource on each of the bottom left, bottom right, and top right **Vault Chamber** locations. Each location with a resource is *activated*.'
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
					what: '**The Inescapable** is set aside, out of play. Only 3x **Still Behind You** enter the encounter deck.'
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
			],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'The entire **The Inescapable** encounter set is removed from the game.'
				}
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: courtOfTheAncients,
				what: 'The **Colossal Tyrant** enemy is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: '**Star Spawn Observer** is set aside, out of play. 1 out of the other 3 randomized **Star Spawn** enemy in the encounter deck, the rest are removed from the game.'
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
				pilgrims
			],
			remaining: [starSpawn],
			notes: [
				{
					encounterSet: theInescapable,
					what: '**The Inescapable** is set aside, out of play. Only 3x **Still Behind You** enter the encounter deck.'
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
				pilgrims
			],
			remaining: [starSpawn],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'The entire **The Inescapable** encounter set is removed from the game.'
				}
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenTablet],
		notes: [
			{
				encounterSet: courtOfTheAncients,
				what: 'The **Colossal Tyrant** enemy is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: 'Only the **Star Spawn Observer** is gathered and set aside, out of play.'
			},
			{
				what: 'Add the flood tokens to the token pool. Each location on level 1 starts **fully flooded**, and each location on level 2 starts **partially flooded**.'
			}
		]
	}
};

// The act 1 grid is 3 rows by 4 columns: R’lyeh Streets, 4 open sky, and 7 cards from the bottom
// of the Summit deck. Both expeditions start the Summit deck with 14 locations.
const obsidianCanyonsSummitNote = (removed: string, setAside: string) => ({
	topic: 'Summit Deck (8)',
	what: `Counted after filling act 1 grid, **Central Spire** shuffled into the top 3. ${setAside} stay set aside. ${removed}`
});

const obsidianCanyonsOpenSkyNote = (sets: string, gathered: number) => ({
	topic: `Open Sky (${gathered - 4})`,
	what: `This deck is ${gathered} cards from ${sets} with 4 of them go into the act 1 grid.`
});

export const obsidianCanyonsWesternScenario: Scenario = {
	kohakuScenario: KohakuScenario.ObsidianCanyons,
	overrideName: m.campaignRegularTheDrownedCityScenarioObsidianCanyons() + ' (West)',
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
				nightgaunts
			],
			remaining: [ancientEvils, chillingCold, strikingFear],
			notes: [
				{
					encounterSet: theInescapable,
					what: '**The Inescapable** spawns at the location farthest from all investigators, exhausted. Only 3x **Still Behind You** enter the encounter deck.'
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
				nightgaunts
			],
			remaining: [ancientEvils, chillingCold, strikingFear],
			notes: [
				{
					encounterSet: theInescapable,
					what: 'The entire **The Inescapable** encounter set is removed from the game.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: obsidianCanyons,
				what: 'The story card starts **Eastern Winds** side faceup in a **western expedition**.'
			},
			{
				encounterSet: starSpawn,
				what: '2 out of 4 randomized **Star Spawn** enemy in the encounter deck, the rest are removed from the game.'
			},
			obsidianCanyonsSummitNote(
				'**Ancient Dome** is not used in this version.',
				'**Floating Spire**, **Western Wall**, and **Aerial Waterfall**'
			),
			obsidianCanyonsOpenSkyNote('**Ancient Evils**, **Chilling Cold**, and **Striking Fear**', 14)
		]
	}
};

export const obsidianCanyonsEasternScenario: Scenario = {
	kohakuScenario: KohakuScenario.ObsidianCanyons,
	overrideName: m.campaignRegularTheDrownedCityScenarioObsidianCanyons() + ' (East)',
	shortName: '?',
	setups: [
		{
			shuffles: [
				{ encounterSet: obsidianCanyons, overwriteCount: 11 },
				cosmicLegacy,
				elderMist,
				rlyeh,
				{ encounterSet: starSpawn, overwriteCount: 1 },
				nightgaunts
			],
			remaining: [theInescapable, chillingCold, strikingFear]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: obsidianCanyons,
				what: 'The story card starts **Western Winds** side faceup in an **eastern expedition**. One **Star Vampire** is removed from the game.'
			},
			{
				encounterSet: theInescapable,
				what: 'The entire **The Inescapable** encounter set is set aside, out of play.'
			},
			{
				encounterSet: starSpawn,
				what: '1 out of 4 randomized **Star Spawn** enemy in the encounter deck, the rest are removed from the game.'
			},
			obsidianCanyonsSummitNote(
				'**Western Wall** and **Floating Spire** are not used in this version',
				'**Aerial Waterfall** and **Ancient Dome**'
			),
			obsidianCanyonsOpenSkyNote('**Chilling Cold** and **Striking Fear**', 11)
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
				agentsOfCthulhu
			],
			remaining: [theMidnightMasks],
			notes: [
				{
					encounterSet: starSpawn,
					what: '2 out of 4 randomized **Star Spawn** enemy in the encounter deck, the rest are removed from the game.'
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
				agentsOfCthulhu
			],
			remaining: [theMidnightMasks],
			notes: [
				{
					encounterSet: starSpawn,
					what: '1 out of 4 randomized **Star Spawn** enemy in the encounter deck, the rest are removed from the game.'
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
				what: '**Randall Tillinghast** is set aside, out of play. None of this set’s cards enter the encounter deck.'
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
				agentsOfCthulhu
			],
			remaining: [starSpawn, theMidnightMasks]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing],
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
