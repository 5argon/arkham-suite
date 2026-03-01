import { describe, expect, it } from 'vitest';
import {
	COMPILED_PROFILE_VERSION,
	CompiledProfileError,
	makeCompiledProfileFile,
	parseCompiledProfileFile,
	stripCompiledProfile,
} from './compiled-profile';
import type { ProfileSubject } from '$lib/profile/profile-types';
import type { LocalProfilePayload } from './profile-local';

/** A payload with one of every English-bearing structure populated. */
function payload(): LocalProfilePayload {
	return {
		subject: { kind: 'account', uid: '__account__', name: '5argon', iconCardCode: '07005', members: [] },
		summary: {
			totalPlays: 2, totalWins: 0, campaignsPlayed: 1, ownedCampaigns: 1, campaignsClearedAny: 0,
			campaignsClearedByTier: {}, achievementsEarned: 0, achievementsTotal: 1, investigatorsPlayed: 1,
			cardsPlayed: 1, standalonePlays: 1,
		},
		campaigns: [
			{ id: 'c1', title: 'My Edge Run', campaignCode: 'eote', difficulty: 'hard', playerCount: 2, finishDate: 1, startDate: null, draft: false },
		],
		calendar: [
			{ campaignId: 'c1', title: 'My Edge Run', campaignCode: 'eote', family: 'eoe', difficulty: 'hard', date: 1, dateKind: 'finish', state: 'attempted' },
		],
		achievements: {
			families: [
				{
					family: 'eoe',
					name: 'Edge of the Earth',
					earned: 0,
					total: 1,
					achievements: [{ id: 'mad_with_power', title: 'Mad With Power', text: 'Exhaust fifteen…', earned: false, inferred: false, earnCount: 0, earnedTiers: [] }],
				},
			],
			custom: [{ id: 'eoe_memories', title: 'Memories Banished', description: 'Total memories…', scope: 'family', family: 'eoe', value: 4, earned: true }],
			coverage: [
				{
					campaignCode: 'eote',
					family: 'eoe',
					campaignName: 'Edge of the Earth',
					exploredBranches: 1,
					totalBranches: 2,
					exploredPct: 50,
					groups: [{ scenario: 'ice_and_death_part_1', branches: [{ key: 'campaign_notes.camp_icy_wastes', text: 'Camp - Icy Wastes (4)', recorded: true }] }],
				},
			],
		},
		clearGrid: [{ family: 'eoe', name: 'Edge of the Earth', byTier: { hard: 'attempted' }, plays: 2, product: 'eoec', owned: true } as never],
		soloClearGrid: [],
		trueSoloClearGrid: [],
		winLossRecord: [{ family: 'eoe', name: 'Edge of the Earth', plays: 2, wins: 0, losses: 1, special: 0, inProgress: 1, byTier: {} } as never],
		endings: [
			{ family: 'eoe', name: 'Edge of the Earth', endings: [{ key: 'campaign_notes.nameless_madness_escaped', text: 'the nameless madness escaped.', kind: 'loss', reached: true, count: 1, byTier: { hard: 1 } }], reachedCount: 1, bestReached: false },
		],
		collections: [
			{ family: 'eoe', name: 'Edge of the Earth', collections: [{ sectionId: 'mementos', title: 'Mementos', items: [{ id: 'flute', label: 'Mesmerizing Flute', collected: true }], collectedCount: 1 }] } as never,
		],
		scenarioXp: [{ family: 'eoe', name: 'Edge of the Earth', scenarios: [], totalBest: 0 }],
		resolutionCoverage: [
			{
				family: 'eoe',
				name: 'Edge of the Earth',
				scenarios: [
					{
						scenario: 'ice_and_death_part_1',
						all: ['no_resolution', 'R1'],
						visited: ['R1'],
						tallies: { R1: { total: 3, byTier: { standard: 2, hard: 1 } } },
					},
				],
				visitedCount: 1,
				totalCount: 2,
			},
		],
		standaloneUsage: [
			{
				family: 'eoe',
				name: 'Edge of the Earth',
				standalones: [{ scenario: 'carnevale_of_horrors', name: 'Carnevale of Horrors', count: 1, resolutions: ['R1'] }],
				totalPlays: 1,
			},
		],
		traumaTally: {
				killed: 0,
				insane: 1,
				killedNotInsane: 0,
				insaneNotKilled: 1,
				pyrrhic: 0,
				casualties: 0,
				possible: 0,
				perInvestigator: [{ code: '09004', killed: 0, insane: 1 }],
				events: [
					{ family: 'eoe', campaignId: 'c1', scenario: 'the_heart_of_madness_part_2', resolution: 'no_resolution', killed: null, insane: 'yes', targets: ['all'], allKilled: false, allInsane: true, result: 'lose', pyrrhic: false, difficulty: 'hard' },
				],
			},
			eoeCity: [
				{
					family: 'eoe',
					allResolutions: ['no_resolution', 'R1', 'R2'],
					versions: [
						{ version: 'I', plays: 2, playsByTier: { standard: 1, hard: 1 }, vpBest: 5, vpBestByTier: { standard: 5, hard: 3 }, resolutions: { R1: { total: 2, byTier: { standard: 1, hard: 1 } } } },
						{ version: 'II', plays: 0, playsByTier: {}, vpBest: null, vpBestByTier: {}, resolutions: {} },
						{ version: 'III', plays: 0, playsByTier: {}, vpBest: null, vpBestByTier: {}, resolutions: {} },
					],
					totalPlays: 2,
				},
			],
			eoe: [
				{
					family: 'eoe',
					roster: ['kensler', 'dyer'],
					plays: 3,
					killed: { dyer: 2 },
					demons: { kensler: 1 },
					survived: { kensler: 3 },
					rescued: { dyer: 1 },
					supplies: { green_soapstone: 2 },
					camped: { camp_icy_wastes: 1 },
					memoriesBanishedLocations: { airfield: 2 },
					memoriesBanishedEnemies: { hunt_gone_awry: 1 },
					frostMax: 6,
					frostMin: 2,
					miasmaPlan: 2,
					miasmaEludes: 1,
					fatalMiragePlays: [3, 1],
					iceDeathSkipped2: 1,
					iceDeathSkipped3: 0,
					iceDeathFled: 1,
					iceDeathEscaped: 2,
					iceDeathDefeated: 1,
					shelterMax: 4,
					shelterMin: 1,
					memBanishedMost: 5,
					memBanishedLeast: 2,
					memoriesBanishedLocationsCount: 1,
					memoriesBanishedEnemiesCount: 1,
					fatalMiragePlayCounts: { once: 1, twice: 0, thrice: 1 },
					mementosEarned: 0,
				},
			],
			tsk: [],
			specialInteractions: [],
			investigators: [{ code: '09004', count: 1, options: ['guardian · 30 cards'] }],
		cardUsage: { '01087': 1 }, usedOnce: {}, specialistUsage: {}, insightDecks: [], eligibilityInsights: {}, totalDecks: 1, charismaTopDecks: [], relicTopDecks: [], customizableUsage: {},
		playedCardCodes: ['01087'],
		settings: { v: 4, ownedProducts: null, trackedTiers: [], trackedCampaignGroups: [], hideUntrackedDifficultyAchievements: true, defaultArchiveDisplayInProfile: 'visible', panes: {} as never, campaigns: {} },
	};
}

describe('stripCompiledProfile', () => {
	const out = stripCompiledProfile(payload());
	const json = JSON.stringify(out);

	it('drops every re-derivable English string', () => {
		// A representative sample of each English-bearing field is gone from the artifact.
		for (const s of [
			'Edge of the Earth', // family/campaign names (clearGrid/winLossRecord/endings/coverage/collections/families)
			'Mad With Power', 'Exhaust fifteen', // achievement title/text
			'Memories Banished', 'Total memories', // custom achievement title/description
			'Camp - Icy Wastes', // coverage branch text
			'the nameless madness escaped', // ending text
			'Mementos', 'Mesmerizing Flute', // collection title + item label
			'Carnevale of Horrors', // standalone scenario name (re-derivable from its id)
		]) {
			expect(json).not.toContain(s);
		}
	});

	it('keeps keys, user data, stats, and non-re-derivable derived data', () => {
		expect(json).toContain('5argon'); // user name
		expect(json).toContain('My Edge Run'); // user campaign title
		expect(json).toContain('eoe'); // family key
		expect(json).toContain('mad_with_power'); // achievement id
		expect(json).toContain('campaign_notes.nameless_madness_escaped'); // ending key
		expect(json).toContain('mementos'); // collection sectionId
		expect(json).toContain('guardian · 30 cards'); // investigator options (deck-derived, kept)
		expect(json).toContain('01087'); // card code
		// structure + numbers preserved
		expect(out.achievements).toBeTruthy();
		expect(out.clearGrid[0].plays).toBe(2);
		// resolution coverage is included, with the per-difficulty tally counts kept
		// (numbers, not re-derivable) but the family name stripped (re-derivable).
		expect(out.resolutionCoverage[0].family).toBe('eoe');
		expect(out.resolutionCoverage[0]).not.toHaveProperty('name');
		// Standalone usage is included: ids + counts kept, family + scenario names stripped.
		expect(out.standaloneUsage[0].family).toBe('eoe');
		expect(out.standaloneUsage[0]).not.toHaveProperty('name');
		expect(out.standaloneUsage[0].standalones[0]).toEqual({
			scenario: 'carnevale_of_horrors',
			count: 1,
			resolutions: ['R1'],
		});
		// The Scarlet Keys aggregate is included (array present; pure user stats).
		expect(Array.isArray(out.tsk)).toBe(true);
		// The cross-family summary block + precomputed blob aggregates are carried whole
		// (pure numbers — the public-contract headline fields).
		expect(out.summary.totalPlays).toBe(2);
		expect(out.summary.achievementsTotal).toBe(1);
		expect(out.eoe[0].memoriesBanishedLocationsCount).toBe(1);
		expect(out.eoe[0].fatalMiragePlayCounts).toEqual({ once: 1, twice: 0, thrice: 1 });
		expect(out.resolutionCoverage[0].scenarios[0].tallies.R1).toEqual({
			total: 3,
			byTier: { standard: 2, hard: 1 },
		});
		// EotE bespoke tallies are included verbatim (member/item ids + counts, no English).
		expect(out.eoe[0].killed.dyer).toBe(2);
		expect(out.eoe[0].survived.kensler).toBe(3);
		expect(out.eoe[0].camped.camp_icy_wastes).toBe(1);
		// EotE City matrix is included verbatim (no English; all ids/keys/numbers).
		expect(out.eoeCity[0].family).toBe('eoe');
		expect(out.eoeCity[0].versions[0]).toEqual({
			version: 'I',
			plays: 2,
			playsByTier: { standard: 1, hard: 1 },
			vpBest: 5,
			vpBestByTier: { standard: 5, hard: 3 },
			resolutions: { R1: { total: 2, byTier: { standard: 1, hard: 1 } } },
		});
	});
});

describe('compiled profile file (envelope)', () => {
	const subject: ProfileSubject = {
		kind: 'group',
		uid: 'g1',
		name: 'Table A',
		iconCardCode: null,
		members: [
			{ name: 'Anna', iconCardCode: '01001' },
			{ name: 'Bob', iconCardCode: '02001' },
		],
	};
	const exportedAt = '2026-06-24T00:00:00.000Z';

	it('wraps the stripped profile in a versioned, sniffable envelope', () => {
		// In real use the envelope subject IS the payload's subject (downloadCompiledProfile
		// passes payload.subject), so model that here.
		const groupPayload: LocalProfilePayload = { ...payload(), subject };
		const file = makeCompiledProfileFile(subject, groupPayload, exportedAt);
		expect(file.kind).toBe('arkham-life-compiled-profile');
		expect(file.v).toBe(COMPILED_PROFILE_VERSION);
		expect(file.exportedAt).toBe(exportedAt);
		expect(file.subject).toEqual(subject);
		expect(file.profile).toEqual(stripCompiledProfile(groupPayload));
		// Group member names + avatars survive (no anonymization).
		expect(file.subject.members).toEqual(subject.members);
		expect(file.profile.subject.members).toEqual(subject.members);
	});

	it('round-trips through JSON and validates', () => {
		const file = makeCompiledProfileFile(subject, payload(), exportedAt);
		const parsed = parseCompiledProfileFile(JSON.parse(JSON.stringify(file)));
		expect(parsed).toEqual(file);
	});

	it('rejects unrecognizable or newer files', () => {
		expect(() => parseCompiledProfileFile({})).toThrow(CompiledProfileError);
		expect(() => parseCompiledProfileFile({ kind: 'something-else', v: 1, profile: {} })).toThrow(CompiledProfileError);
		expect(() =>
			parseCompiledProfileFile({ kind: 'arkham-life-compiled-profile', v: COMPILED_PROFILE_VERSION + 1, profile: {} }),
		).toThrow(CompiledProfileError);
	});
});
