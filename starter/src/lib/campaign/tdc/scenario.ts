import type { Scenario } from '$lib/core/campaign';
import { EncounterSet as KohakuEncounterSet, Scenario as KohakuScenario } from '@5argon/arkham-kohaku';

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
	kohakuScenario: KohakuScenario.OneLastJob,
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
	kohakuScenario: KohakuScenario.TheWesternWall,
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
	kohakuScenario: KohakuScenario.TheDrownedQuarter,
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
	kohakuScenario: KohakuScenario.TheApiary,
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
	kohakuScenario: KohakuScenario.TheGrandVault,
	setups: [
		{
			shuffles: [theGrandVault, alienMachinery, flood, theInescapable, rlyeh, starSpawn]
		}
	]
};

export const courtOfTheAncientsScenario: Scenario = {
	kohakuScenario: KohakuScenario.CourtOfTheAncients,
	setups: [
		{
			shuffles: [courtOfTheAncients, domination, dreams, elderMist, rlyeh, starSpawn]
		}
	]
};

export const obsidianCanyonsScenario: Scenario = {
	kohakuScenario: KohakuScenario.ObsidianCanyons,
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
	kohakuScenario: KohakuScenario.SepulchreOfTheSleeper,
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
	kohakuScenario: KohakuScenario.TheDoomOfArkham,
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
