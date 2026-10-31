import type { Scenario } from '$lib/core/campaign';
import { ChaosToken, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

import {
	arcaneLock,
	arkham,
	ashenPilgrims,
	badWeather,
	bystanders,
	cosmicEvils,
	cultists,
	deadEnds,
	eldritchLore,
	fire,
	flyingTerrors,
	gangsOfArkham,
	hallucinations,
	madScience,
	miskatonicUniversity,
	peopleOfArkham,
	queenOfAsh,
	reekingDecay,
	sewers,
	smokeAndMirrors,
	spreadingFlames,
	torment,
	whippoorwills
} from './encounter';

export const spreadingFlamesScenario: Scenario = {
	kohakuScenario: KohakuScenario.SpreadingFlames,
	shortName: 'I',
	setups: [
		{
			shuffles: [
				{ encounterSet: spreadingFlames, overwriteCount: 0 },
				ashenPilgrims,
				bystanders,
				cosmicEvils,
				eldritchLore,
				{ encounterSet: fire, overwriteCount: 2 },
				hallucinations,
				madScience
			],
			remaining: [miskatonicUniversity]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: spreadingFlames,
				what: '**Dr. Henry Armitage** and **Servant of Flame** are set aside, out of play. Only **Your Friend’s Room** is put into play.'
			},
			{
				encounterSet: fire,
				what: 'All 5 copies of **Fire!** are set aside, out of play. Only 2x **Noxious Smoke** enter the encounter deck.'
			},
			{
				encounterSet: miskatonicUniversity,
				what: 'Each location is set aside, out of play.'
			}
		]
	}
};

export const smokeAndMirrorsScenario: Scenario = {
	kohakuScenario: KohakuScenario.SmokeAndMirrors,
	shortName: 'II',
	setups: [
		{
			shuffles: [
				{ encounterSet: smokeAndMirrors, overwriteCount: 0 },
				arcaneLock,
				badWeather,
				deadEnds,
				flyingTerrors,
				gangsOfArkham,
				whippoorwills
			],
			remaining: [arkham, peopleOfArkham]
		}
	],
	commonSetup: {
		startingDoom: [
			{
				amount: '1 [per_investigator]'
			},
			{
				amount: '+1',
				condition: 'If *the investigators saved Miskatonic University*'
			}
		],
		addChaosToken: [ChaosToken.TokenCultist, ChaosToken.TokenCultist],
		notes: [
			{
				encounterSet: smokeAndMirrors,
				what: '**Servant of Flame** is dealt beneath a location with **People of Arkham**.'
			},
			{
				encounterSet: peopleOfArkham,
				what: 'Set 1 at random aside, out of play. Shuffle the other 5 with **Servant of Flame** and deal 1 facedown beneath Northside, Downtown, Southside, French Hill, Uptown, and Waterfront District.'
			},
			{
				encounterSet: arkham,
				what: 'Choose 1 of each **Downtown** and **Uptown** at random. **Miskatonic University** version depends on the campaign log.'
			}
		]
	}
};

export const queenOfAshScenario: Scenario = {
	kohakuScenario: KohakuScenario.QueenOfAsh,
	shortName: 'III',
	setups: [
		{
			asteriskCount: true,
			shuffles: [
				{ encounterSet: queenOfAsh, overwriteCount: 2 },
				ashenPilgrims,
				cosmicEvils,
				cultists,
				{ encounterSet: fire, overwriteCount: 2 },
				hallucinations,
				reekingDecay,
				torment
			],
			remaining: [sewers],
			notes: [
				{
					what: 'If *the investigators stirred up trouble*, shuffle each ***Cultist*** enemy from **Ashen Pilgrims** and **Cultists**, and put 1 [per_investigator] of them into play, each at a different **Sewer Tunnels**. The encounter deck has 1 [per_investigator] fewer cards.'
				}
			]
		}
	],
	commonSetup: {
		startingDoom: [
			{
				amount: '+1',
				condition: 'With 3 or 4 investigators'
			},
			{
				amount: '+1',
				condition: 'Unless *the investigators discovered the cult’s whereabouts*'
			}
		],
		addChaosTokenPerDifficulty: {
			easy: [ChaosToken.TokenElderThing],
			standard: [ChaosToken.TokenElderThing, ChaosToken.TokenTablet],
			hard: [ChaosToken.TokenElderThing, ChaosToken.TokenTablet, ChaosToken.TokenSkull],
			expert: [
				ChaosToken.TokenElderThing,
				ChaosToken.TokenTablet,
				ChaosToken.TokenCultist,
				ChaosToken.TokenSkull
			]
		},
		notes: [
			{
				encounterSet: queenOfAsh,
				what: 'Only 2x **Ashen Rebirth** enter the encounter deck.'
			},
			{
				encounterSet: fire,
				what: 'All 5 copies of **Fire!** are set aside, out of play. Only 2x **Noxious Smoke** enter the encounter deck.'
			}
		]
	}
};
