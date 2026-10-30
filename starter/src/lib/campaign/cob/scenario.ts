import type { Scenario } from '$lib/core/campaign';
import { ChaosToken, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

import { arcaneLock, deadEnds, flyingTerrors, reekingDecay } from '../boa/encounter';
import {
	afflicted,
	agentsOfZburamoarte,
	bloodBlight,
	bloodMoney,
	bloodMoon,
	bloodthirst,
	childrenOfBlood,
	friendsInLowPlaces,
	hunted,
	infected,
	misinformation,
	mongrels,
	newHorizons,
	preyedUpon,
	riverOfBlood,
	sanguineSecrets,
	stalked,
	vermin
} from './encounter';

const afflictedNote = {
	encounterSet: afflicted,
	what: 'Only gathered if there are 3 or 4 investigators. (Not included in the card count.)'
};

export const riverOfBloodScenario: Scenario = {
	kohakuScenario: KohakuScenario.RiverOfBlood,
	shortName: 'I',
	setups: [
		{
			name: 'Easy / Standard',
			shuffles: [
				{ encounterSet: riverOfBlood, overwriteCount: 3 },
				childrenOfBlood,
				bloodBlight,
				hunted,
				bloodMoon,
				misinformation,
				{ encounterSet: preyedUpon, overwriteCount: 2 },
				vermin,
				deadEnds,
				flyingTerrors
			],
			remaining: [infected, afflicted],
			notes: [
				{
					encounterSet: preyedUpon,
					what: 'Each **Night Feeder** is set aside, out of play.'
				}
			]
		},
		{
			name: 'Hard / Expert',
			shuffles: [
				{ encounterSet: riverOfBlood, overwriteCount: 3 },
				childrenOfBlood,
				bloodBlight,
				hunted,
				bloodMoon,
				misinformation,
				{ encounterSet: agentsOfZburamoarte, overwriteCount: 2 },
				mongrels,
				deadEnds,
				flyingTerrors
			],
			remaining: [infected, afflicted],
			notes: [
				{
					encounterSet: agentsOfZburamoarte,
					what: 'Each **Spawn of Zburamoarte** is set aside, out of play.'
				}
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: riverOfBlood,
				what: 'Only 3x **Burning Daylight** enter the encounter deck. Remaining **Waterfront Civilian** not spawned are set aside, out of play.'
			},
			{
				encounterSet: infected,
				what: 'The entire **Infected** encounter set is set aside, out of play.'
			},
			afflictedNote,
			{
				what: 'Shuffle the top 2 cards of the encounter deck with the set-aside **Julia Stern**, then place 1 facedown beneath each **Lair** location.'
			}
		]
	}
};

export const newHorizonsScenario: Scenario = {
	kohakuScenario: KohakuScenario.NewHorizons,
	shortName: 'II',
	setups: [
		{
			name: 'Day',
			shuffles: [
				{ encounterSet: newHorizons, overwriteCount: 2 },
				afflicted,
				bloodBlight,
				bloodthirst,
				hunted,
				sanguineSecrets,
				vermin
			],
			remaining: [infected, flyingTerrors],
			notes: [
				{
					encounterSet: newHorizons,
					what: 'Only the 2x **Factory Worker** not spawned enter the encounter deck. **Night Watchman** is removed from the game.'
				}
			]
		},
		{
			name: 'Night',
			shuffles: [
				{ encounterSet: newHorizons, overwriteCount: 0 },
				afflicted,
				childrenOfBlood,
				preyedUpon,
				sanguineSecrets,
				stalked,
				reekingDecay
			],
			remaining: [infected, flyingTerrors],
			notes: [
				{
					encounterSet: newHorizons,
					what: 'No cards enter the encounter deck. **Javier Rivera** and each **Factory Worker** are removed from the game.'
				}
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: newHorizons,
				what: '**Blighted Worker** and **Echoing in Darkness** are set aside, out of play.'
			},
			{
				encounterSet: infected,
				what: 'The entire **Infected** encounter set is set aside, out of play.'
			},
			{
				encounterSet: flyingTerrors,
				what: 'The entire **Flying Terrors** encounter set is set aside, out of play.'
			}
		]
	}
};

export const bloodMoneyScenario: Scenario = {
	kohakuScenario: KohakuScenario.BloodMoney,
	shortName: 'III',
	setups: [
		{
			shuffles: [
				{ encounterSet: bloodMoney, overwriteCount: 3 },
				{ encounterSet: agentsOfZburamoarte, overwriteCount: 2 },
				bloodthirst,
				{ encounterSet: childrenOfBlood, overwriteCount: 2 },
				bloodBlight,
				hunted,
				{ encounterSet: sanguineSecrets, overwriteCount: 0 },
				arcaneLock
			],
			remaining: [afflicted, friendsInLowPlaces]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: bloodMoney,
				what: 'Only 3x **Suspicious Guest** enter the encounter deck, after spawning and removing copies by player count.'
			},
			{
				encounterSet: agentsOfZburamoarte,
				what: 'Each **Spawn of Zburamoarte** is set aside, out of play.'
			},
			{
				encounterSet: childrenOfBlood,
				what: 'Each **Child of Blood** is set aside, out of play.'
			},
			{
				encounterSet: sanguineSecrets,
				what: 'Only 3x **Sanguine Cultist** and **Blood-Crazed Zealot** are gathered, set aside out of play.'
			},
			afflictedNote,
			{
				encounterSet: friendsInLowPlaces,
				what: 'If **Charlie Kane** agreed to join you, any one investigator may be his bearer.'
			}
		]
	}
};
