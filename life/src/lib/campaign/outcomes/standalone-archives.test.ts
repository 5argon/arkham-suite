import { describe, expect, it } from 'vitest';
import type { StandaloneRecord } from '$lib/database/document';
import { buildStandaloneArchives, type InsertedStandalonePlay } from './standalone-archives';

function archive(scenario: string, resolution: string, finishDate: number): StandaloneRecord {
	return {
		id: `a-${finishDate}`,
		title: scenario,
		campaignCode: 'side',
		scenario,
		source: 'pack',
		difficulty: 'standard',
		draft: false,
		startDate: null,
		finishDate,
		createdAt: 0,
		updatedAt: 0,
		participants: [],
		decks: [],
		logs: [
			{
				section: '__resolution',
				key: scenario,
				args: [{ type: 'string', value: resolution }]
			}
		],
		manualAchievements: []
	};
}

const inserted = (
	hostFamily: string,
	resolution: string,
	date: number
): InsertedStandalonePlay => ({
	scenario: 'curse_of_the_rougarou',
	tier: 'hard',
	date,
	resolution,
	victoryDisplay: 7,
	investigators: ['01001'],
	hostFamily
});

describe('buildStandaloneArchives', () => {
	const [stat] = buildStandaloneArchives([archive('curse_of_the_rougarou', 'R1', 100)], new Map(), [
		inserted('dwl', 'R2', 300),
		inserted('ptc', 'no_resolution', 200),
		inserted('dwl', 'R1', 400)
	]);

	it('folds side stories played inside campaigns into the scenario', () => {
		expect(stat.plays).toBe(4);
		expect(stat.archivePlays).toBe(1);
		expect(stat.insertions).toEqual([
			{ family: 'dwl', plays: 2 },
			{ family: 'ptc', plays: 1 }
		]);
		// Curse of the Rougarou's Resolution 1 (it still haunts the bayou) is a curated loss.
		expect(stat.won).toBe(1);
		expect(stat.lost).toBe(3);
		expect(stat.bestVictoryDisplay).toBe(7);
		expect(stat.playsByTier).toEqual({ standard: 1, hard: 3 });
	});

	it('lists every play newest first with its host campaign', () => {
		expect(stat.history.map((h) => [h.date, h.hostFamily])).toEqual([
			[400, 'dwl'],
			[300, 'dwl'],
			[200, 'ptc'],
			[100, null]
		]);
	});

	it('creates a page for a side story never recorded as its own archive', () => {
		const only = buildStandaloneArchives([], new Map(), [inserted('tic', 'R1', 1)]);
		expect(only).toHaveLength(1);
		expect(only[0]).toMatchObject({ source: 'pack', catalogueCode: 'side', archivePlays: 0 });
	});
});
