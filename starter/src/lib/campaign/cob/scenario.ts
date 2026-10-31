import type { EncounterSetItem, Scenario, ScenarioSetup } from '$lib/core/campaign';
import { ChaosToken, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';
import { m } from '@5argon/arkham-string';

import { arcaneLock, deadEnds, flyingTerrors, reekingDecay } from '../boa/encounter';
import {
	afflicted,
	agentsOfZburamoarte,
	bloodBlight,
	bloodMoney,
	bloodMoon,
	bloodthirst,
	childrenOfBlood,
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

/**
 * With 3 or 4 investigators the **Afflicted** set is gathered into the encounter deck too.
 */
function byPlayerCount(
	shuffles: EncounterSetItem[],
	remaining: EncounterSetItem[]
): ScenarioSetup[] {
	return [
		{ name: '1 to 2 Players', shuffles, remaining },
		{ name: '3 to 4 Players', shuffles: [...shuffles, afflicted], remaining }
	];
}

const riverOfBloodNotes = [
	{
		encounterSet: riverOfBlood,
		what: 'Only 3x **Burning Daylight** enter the encounter deck. Remaining **Waterfront Civilian** not spawned are set aside, out of play.'
	},
	{
		encounterSet: infected,
		what: 'The entire **Infected** encounter set is set aside, out of play.'
	},
	{
		what: 'Shuffle the top 2 cards of the encounter deck with the set-aside **Julia Stern**, then place 1 facedown beneath each ***Lair*** location.'
	}
];

export const riverOfBloodStandardScenario: Scenario = {
	kohakuScenario: KohakuScenario.RiverOfBlood,
	overrideName: m.campaignSmallChildrenOfBloodScenarioRiverOfBlood() + ' (Easy, Standard)',
	shortName: 'I',
	setups: byPlayerCount(
		[
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
		[infected]
	),
	commonSetup: {
		notes: [
			...riverOfBloodNotes,
			{
				encounterSet: preyedUpon,
				what: 'Each **Night Feeder** is set aside, out of play.'
			}
		]
	}
};

export const riverOfBloodHardScenario: Scenario = {
	kohakuScenario: KohakuScenario.RiverOfBlood,
	overrideName: m.campaignSmallChildrenOfBloodScenarioRiverOfBlood() + ' (Hard, Expert)',
	shortName: 'I',
	setups: byPlayerCount(
		[
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
		[infected]
	),
	commonSetup: {
		notes: [
			...riverOfBloodNotes,
			{
				encounterSet: agentsOfZburamoarte,
				what: 'Each **Spawn of Zburamoarte** is set aside, out of play.'
			}
		]
	}
};

const newHorizonsNotes = [
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
];

export const newHorizonsDayScenario: Scenario = {
	kohakuScenario: KohakuScenario.NewHorizons,
	overrideName: m.campaignSmallChildrenOfBloodScenarioNewHorizons() + ' (Day)',
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: newHorizons, overwriteCount: 2 },
				afflicted,
				bloodBlight,
				bloodthirst,
				hunted,
				sanguineSecrets,
				vermin
			],
			remaining: [infected, flyingTerrors]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: newHorizons,
				what: 'Only the 2x **Factory Worker** not spawned enter the encounter deck. **Javier Rivera** is set aside, out of play. **Night Watchman** is removed from the game.'
			},
			...newHorizonsNotes
		]
	}
};

export const newHorizonsNightScenario: Scenario = {
	kohakuScenario: KohakuScenario.NewHorizons,
	overrideName: m.campaignSmallChildrenOfBloodScenarioNewHorizons() + ' (Night)',
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: newHorizons, overwriteCount: 0 },
				afflicted,
				childrenOfBlood,
				preyedUpon,
				sanguineSecrets,
				stalked,
				reekingDecay
			],
			remaining: [infected, flyingTerrors]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: newHorizons,
				what: 'No cards enter the encounter deck. **Night Watchman** is set aside, out of play. **Javier Rivera** and each **Factory Worker** are removed from the game.'
			},
			...newHorizonsNotes
		]
	}
};

export const bloodMoneyScenario: Scenario = {
	kohakuScenario: KohakuScenario.BloodMoney,
	shortName: 'III',
	setups: byPlayerCount(
		[
			{ encounterSet: bloodMoney, overwriteCount: 3 },
			{ encounterSet: agentsOfZburamoarte, overwriteCount: 2 },
			bloodthirst,
			{ encounterSet: childrenOfBlood, overwriteCount: 2 },
			bloodBlight,
			hunted,
			arcaneLock
		],
		[sanguineSecrets]
	),
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
				what: 'Only the 3x **Sanguine Cultist** and **Blood-Crazed Zealot** are gathered and set aside, out of play. **Morbid Rituals** is not gathered.'
			}
		]
	}
};
