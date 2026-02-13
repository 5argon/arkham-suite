import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet } from '@5argon/arkham-kohaku';

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

export const oneLastJobScenario: Scenario = {
	index: 1,
	representativeSet: KohakuEncounterSet.OneLastJob,
	setups: [
		{
			shuffles: [
				oneLastJob,
				dreams,
				chillingCold,
				lockedDoors,
				{ encounterSet: theMidnightMasks, overwriteCount: 4 },
				rats,
				strikingFear
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theMidnightMasks,
				what: 'Only gather the location cards. Do not gather the acts, agendas, or treacheries from that set.'
			}
		]
	}
};

export const theWesternWallScenario: Scenario = {
	index: 2,
	representativeSet: KohakuEncounterSet.TheWesternWall,
	setups: [
		{
			name: 'Standard Setup',
			shuffles: [
				theWesternWall,
				cosmicLegacy,
				deepOnes,
				flood,
				rlyeh,
				starSpawn,
				theInescapable,
				underseaCreatures,
				agentsOfCthulhu
			]
		},
		{
			name: 'Epic Setup',
			shuffles: [
				theWesternWall,
				cosmicLegacy,
				deepOnes,
				flood,
				rlyeh,
				starSpawn,
				underseaCreatures,
				agentsOfCthulhu
			]
		}
	]
};

export const theDrownedQuarterScenario: Scenario = {
	index: 3,
	representativeSet: KohakuEncounterSet.TheDrownedQuarter,
	setups: [
		{
			shuffles: [
				theDrownedQuarter,
				alienMachinery,
				cosmicLegacy,
				deepOnes,
				elderMist,
				flood,
				rlyeh,
				underseaCreatures
			]
		}
	]
};

export const theApiaryScenario: Scenario = {
	index: 4,
	representativeSet: KohakuEncounterSet.TheApiary,
	setups: [
		{
			name: 'Standard Setup',
			shuffles: [
				theApiary,
				cosmicLegacy,
				elderMist,
				theInescapable,
				pilgrims,
				darkCult,
				strikingFear
			]
		},
		{
			name: 'Epic Setup',
			shuffles: [theApiary, cosmicLegacy, elderMist, starSpawn, stowaways, strikingFear]
		}
	]
};

export const theGrandVaultScenario: Scenario = {
	index: 5,
	representativeSet: KohakuEncounterSet.TheGrandVault,
	setups: [
		{
			shuffles: [theGrandVault, alienMachinery, flood, theInescapable, rlyeh, starSpawn]
		}
	]
};

export const courtOfTheAncientsScenario: Scenario = {
	index: 6,
	representativeSet: KohakuEncounterSet.CourtOfTheAncients,
	setups: [
		{
			shuffles: [courtOfTheAncients, domination, dreams, elderMist, rlyeh, starSpawn]
		}
	]
};

export const obsidianCanyonsScenario: Scenario = {
	index: 7,
	representativeSet: KohakuEncounterSet.ObsidianCanyons,
	setups: [
		{
			name: 'Standard Setup',
			shuffles: [
				obsidianCanyons,
				cosmicLegacy,
				elderMist,
				rlyeh,
				starSpawn,
				ancientEvils,
				chillingCold,
				nightgaunts,
				strikingFear
			]
		},
		{
			name: 'Epic Setup',
			shuffles: [
				obsidianCanyons,
				cosmicLegacy,
				elderMist,
				theInescapable,
				rlyeh,
				starSpawn,
				chillingCold,
				nightgaunts,
				strikingFear
			]
		}
	]
};

export const sepulchreOfTheSleeperScenario: Scenario = {
	index: 8,
	representativeSet: KohakuEncounterSet.SepulchreOfTheSleeper,
	setups: [
		{
			shuffles: [
				sepulchreOfTheSleeper,
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

export const theDoomOfArkhamScenario: Scenario = {
	index: 9,
	representativeSet: KohakuEncounterSet.TheDoomOfArkhamPart1,
	setups: [
		{
			name: 'Part I',
			shuffles: [
				theDoomOfArkhamPt1,
				deepOnes,
				domination,
				dreams,
				starSpawn,
				agentsOfCthulhu,
				{ encounterSet: theMidnightMasks, overwriteCount: 6 }
			]
		},
		{
			name: 'Part II',
			shuffles: [
				theDoomOfArkhamPt2,
				domination,
				elderMist,
				flood,
				starSpawn,
				agentsOfCthulhu,
				{ encounterSet: theMidnightMasks, overwriteCount: 4 }
			]
		}
	],
	commonSetup: {
		notes: [
			{
				encounterSet: theMidnightMasks,
				what: 'Part I: Only gather location and treachery cards. Part II: Only gather location cards.'
			}
		]
	}
};
