import { type Scenario } from '$lib/core/campaign';
import { ChaosToken, EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

import { ancientEvils, chillingCold, lockedDoors, strikingFear } from '../notz/encounter';
import {
	agentsOfTheUnknown,
	cityOfTheElderThings,
	creaturesInTheIce,
	deadlyWeather,
	elderThings,
	fatalMirage,
	hazardsOfAntarctica,
	iceAndDeath,
	leftBehind,
	lostInTheNight,
	miasma,
	namelessHorrors,
	penguins,
	seepingNightmares,
	shoggoths,
	silenceAndMystery,
	stirringInTheDeep,
	theCrash,
	theGreatSeal,
	theHeartOfMadness,
	toTheForbiddenPeaks
} from './encounter';
import { m } from '@5argon/arkham-string';

export const iceAndDeathPart1Scenario: Scenario = {
	index: 2,
	shortName: 'I (Pt. I)',
	representativeSet: KohakuEncounterSet.IceAndDeath,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioIceAndDeathPartI(),
	setups: [
		{
			shuffles: [
				{ encounterSet: iceAndDeath, overwriteCount: 4 },
				ancientEvils,
				deadlyWeather,
				hazardsOfAntarctica,
				silenceAndMystery
			],
			remaining: [theCrash, creaturesInTheIce]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: iceAndDeath,
				what: 'Set each **Skittering Nonsense** enemy aside, out of play. (3 cards)'
			},
			{
				encounterSet: creaturesInTheIce,
				what: 'The entire **Creatures in the Ice** encounter set is set aside, out of play.'
			}
		]
	}
};

export const iceAndDeathPart2Scenario: Scenario = {
	index: 3,
	shortName: 'I (Pt. II)',
	representativeSet: KohakuEncounterSet.IceAndDeath,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioIceAndDeathPartII(),
	setups: [
		{
			shuffles: [
				{ encounterSet: iceAndDeath, overwriteCount: 7 },
				ancientEvils,
				leftBehind,
				deadlyWeather,
				hazardsOfAntarctica,
				silenceAndMystery
			],
			remaining: [lostInTheNight]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenFrost]
	}
};

export const iceAndDeathPart3Scenario: Scenario = {
	index: 4,
	shortName: 'I (Pt. III)',
	representativeSet: KohakuEncounterSet.IceAndDeath,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioIceAndDeathPartIII(),
	setups: [
		{
			shuffles: [
				{ encounterSet: iceAndDeath, overwriteCount: 4 },
				{ encounterSet: seepingNightmares, overwriteCount: 2 },
				ancientEvils,
				{ encounterSet: creaturesInTheIce, overwriteCount: 2 },
				deadlyWeather,
				hazardsOfAntarctica,
				silenceAndMystery
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenFrost],
		notes: [
			{
				encounterSet: iceAndDeath,
				what: '3x *Eidolon* enemies from the **Ice and Death** set are under **Seeping Nightmares**.'
			},
			{
				encounterSet: creaturesInTheIce,
				what: '5x *Eidolon* enemies from the **Creatures in the Ice** set are under **Seeping Nightmares**.'
			}
		]
	}
};

export const fatalMirageScenario: Scenario = {
	index: 5,
	shortName: '???',
	representativeSet: KohakuEncounterSet.FatalMirage,
	setups: [
		{
			shuffles: [
				{ encounterSet: fatalMirage, overwriteCount: 9 },
				chillingCold,
				agentsOfTheUnknown,
				leftBehind,
				miasma,
				namelessHorrors,
				silenceAndMystery
			]
		}
	]
};

export const toTheForbiddenPeaksScenario: Scenario = {
	index: 6,
	shortName: 'II',
	representativeSet: KohakuEncounterSet.ToTheForbiddenPeaks,
	setups: [
		{
			shuffles: [
				{ encounterSet: toTheForbiddenPeaks, overwriteCount: 14 },
				deadlyWeather,
				elderThings,
				hazardsOfAntarctica,
				namelessHorrors
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing]
	}
};

export const cityOfTheElderThings1Scenario: Scenario = {
	index: 7,
	shortName: 'III (v. I)',
	representativeSet: KohakuEncounterSet.CityOfTheElderThings,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioCityOfTheElderThings() + ' (v. I)',
	setups: [
		{
			shuffles: [
				{ encounterSet: cityOfTheElderThings, overwriteCount: 9 },
				lockedDoors,
				elderThings,
				miasma,
				namelessHorrors,
				penguins,
				{ encounterSet: shoggoths, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing],
		notes: [
			{
				encounterSet: cityOfTheElderThings,
				what: 'Set the **Terror of the Stars** enemy aside, out of play.'
			},
			{
				encounterSet: cityOfTheElderThings,
				what: 'Remove all 3 copies of the **Benign Elder Thing** enemy from the game.'
			},
			{
				encounterSet: shoggoths,
				what: 'The entire **Shoggoths** encounter set is set aside, out of play.'
			}
		]
	}
};

export const cityOfTheElderThings2Scenario: Scenario = {
	index: 8,
	shortName: 'III (v. II)',
	representativeSet: KohakuEncounterSet.CityOfTheElderThings,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioCityOfTheElderThings() + ' (v. II)',
	setups: [
		{
			shuffles: [
				{ encounterSet: cityOfTheElderThings, overwriteCount: 9 },
				chillingCold,
				{ encounterSet: creaturesInTheIce, overwriteCount: 0 },
				elderThings,
				namelessHorrors,
				penguins,
				silenceAndMystery
			]
		}
	],
	commonSetup: {
		addChaosToken: [ChaosToken.TokenElderThing],
		notes: [
			{
				encounterSet: cityOfTheElderThings,
				what: 'Remove the **Terror of the Stars** enemy from the game.'
			},
			{
				encounterSet: cityOfTheElderThings,
				what: 'Remove all 3 copies of the **Benign Elder Thing** enemy from the game.'
			},
			{
				encounterSet: creaturesInTheIce,
				what: 'The entire **Creatures in the Ice** encounter set is set aside, out of play.'
			}
		]
	}
};

export const cityOfTheElderThings3Scenario: Scenario = {
	index: 9,
	shortName: 'III (v. III)',
	representativeSet: KohakuEncounterSet.CityOfTheElderThings,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioCityOfTheElderThings() + ' (v. III)',
	setups: [
		{
			shuffles: [
				{ encounterSet: cityOfTheElderThings, overwriteCount: 9 },
				chillingCold,
				lockedDoors,
				creaturesInTheIce,
				penguins,
				miasma,
				{ encounterSet: shoggoths, overwriteCount: 0 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: cityOfTheElderThings,
				what: 'Remove the **Terror of the Stars** enemy from the game.'
			},
			{
				encounterSet: cityOfTheElderThings,
				what: 'Remove all 3 copies of the **Reawakened Elder Thing** enemy from the game.'
			},
			{
				encounterSet: shoggoths,
				what: 'The entire **Shoggoths** encounter set is set aside, out of play.'
			}
		]
	}
};

export const theHeartOfMadness1Scenario: Scenario = {
	index: 10,
	shortName: 'IV (Pt. I)',
	representativeSet: KohakuEncounterSet.TheHeartOfMadness,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioTheHeartOfMadnessPartI(),
	setups: [
		{
			shuffles: [
				{ encounterSet: theHeartOfMadness, overwriteCount: 6 },
				{ encounterSet: theGreatSeal, overwriteCount: 4 },
				ancientEvils,
				lockedDoors,
				miasma,
				namelessHorrors,
				penguins,
				shoggoths
			]
		}
	]
};

export const theHeartOfMadness2Scenario: Scenario = {
	index: 11,
	shortName: 'IV (Pt. II)',
	representativeSet: KohakuEncounterSet.TheHeartOfMadness,
	overrideName: m.campaignRegularEdgeOfTheEarthScenarioTheHeartOfMadnessPartII(),
	setups: [
		{
			shuffles: [
				{ encounterSet: theHeartOfMadness, overwriteCount: 6 },
				{ encounterSet: stirringInTheDeep, overwriteCount: 2 },
				agentsOfTheUnknown,
				chillingCold,
				{ encounterSet: strikingFear, overwriteCount: 4 },
				ancientEvils,
				miasma,
				namelessHorrors,
				penguins
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: strikingFear,
				what: 'When gathering the **Striking Fear** encounter set, only gather 2x **Dissonant Voices** and 2x **Frozen in Fear** (do not gather 3x **Rotting Remains**).'
			}
		]
	}
};
