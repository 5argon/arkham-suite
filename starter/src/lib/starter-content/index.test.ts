import { CardResolver, deck as deckUtility, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards, loadAllTabooLists } from '../card-data';
import { hasUniqueInvestigatorClasses } from '../tool/assembler/filter';
import {
	allPrebuiltTeams,
	allStarterDecks,
	prebuiltTeamsOf,
	starterSeries,
	type PrebuiltTeam
} from '.';

const tagsBySeries = {
	'ch2-core-only': 'starter beginner hc-ch2-core-only',
	'ch2-starter-guide': 'starter beginner hc-ch2-starter-guide',
	'ch2-starters-revisited': 'starter beginner hc-ch2-starters-revisited'
} as const;

describe('starter deck export tags', () => {
	it('gives every listed deck version exactly the two common tags and its series tag', () => {
		const versions = allStarterDecks().flatMap((entry) =>
			entry.versions.map((version) => ({
				deck: version.deck,
				series: entry.series.slug as keyof typeof tagsBySeries
			}))
		);
		expect(versions).toHaveLength(38);
		for (const { deck, series } of versions) {
			expect(deck.tags, `${series}/${deck.id}`).toBe(tagsBySeries[series]);
			expect(deck.tags?.split(/\s+/), `${series}/${deck.id}`).toHaveLength(3);
		}
	});

	it('gives every embedded team deck exactly the same three tags', () => {
		const teams = allPrebuiltTeams();
		const members = teams.flatMap((team) =>
			team.members.map((member) => ({ team, deck: member.deck }))
		);
		expect(members).toHaveLength(186);
		for (const { team, deck } of members) {
			const series = Object.keys(tagsBySeries).find((slug) =>
				team.slug.startsWith(`hc-${slug}-`)
			) as keyof typeof tagsBySeries | undefined;
			expect(series, team.slug).toBeDefined();
			expect(deck.tags, deck.id.toString()).toBe(tagsBySeries[series!]);
			expect(deck.tags?.split(/\s+/), deck.id.toString()).toHaveLength(3);
		}
	});
});

describe('Chapter 2 Starter Guide pre-built teams', () => {
	const resolver = new CardResolver(getAllCards());
	const tabooLists = loadAllTabooLists();
	const allTeams = prebuiltTeamsOf('hungry-colquhoun');
	const teams = allTeams.filter((team) => team.slug.startsWith('hc-ch2-starter-guide-'));
	const sourceEntries = starterSeries('hungry-colquhoun', 'ch2-starter-guide')!.entries;
	const sourceDecks = sourceEntries.map((entry) =>
		linkedAhdbDeckToDeck({ deck: entry.primary }, resolver, tabooLists)
	);

	function rosterKey(team: PrebuiltTeam): string {
		return team.members
			.map((member) => member.deck.investigator_code)
			.sort()
			.join('|');
	}

	function eligibleRosterKeys(playerCount: 2 | 3): string[] {
		return deckUtility
			.findTeamOverlaps(sourceDecks, playerCount)
			.filter(
				(combination) =>
					combination.overlaps.length === 0 && hasUniqueInvestigatorClasses(combination.decks)
			)
			.map((combination) =>
				combination.decks
					.map((deck) => deck.investigator.code)
					.sort()
					.join('|')
			)
			.sort();
	}

	function expectFullySourced(team: PrebuiltTeam, playerCount: number) {
		expect(team.members, team.slug).toHaveLength(playerCount);
		expect(team.exclusive, team.slug).toBe(false);
		expect(
			team.members.every((member) => member.source !== undefined),
			team.slug
		).toBe(true);
	}

	it('uses full investigator names and card-code order in team names and slugs', () => {
		for (const team of allTeams) {
			expect(team.guideMd, team.slug).not.toContain('Izzie Barnes');
			if (team.members.some((member) => member.deck.investigator_code === '12013')) {
				expect(team.guideMd, team.slug).toContain('Isabelle Barnes');
			}
			const investigators = [...team.members]
				.sort((a, b) => Number(a.deck.investigator_code) - Number(b.deck.investigator_code))
				.map((member) => resolver.resolve(member.deck.investigator_code).name.split(' ')[0]);
			const investigatorSlugs = investigators
				.map((name) =>
					name
						.normalize('NFD')
						.replace(/\p{Diacritic}/gu, '')
						.toLowerCase()
				)
				.join('-');
			expect(team.name.split(' : ')[1], team.slug).toBe(investigators.join(', '));
			expect(team.slug, team.name).toMatch(new RegExp(`-${investigatorSlugs}$`));
			expect(
				team.members.every((member) => member.deck.id.startsWith(`${team.slug}/`)),
				team.slug
			).toBe(true);
		}
	});

	it('loads all fourteen resolved 4P teams with a hosted source for every member', () => {
		const fourPlayerTeams = teams.filter((team) => team.slug.includes('-4p-'));
		expect(fourPlayerTeams).toHaveLength(14);
		for (const team of fourPlayerTeams) expectFullySourced(team, 4);
	});

	it('includes exactly the twelve untouched 3P combinations from Team Assembler', () => {
		const threePlayerTeams = teams.filter((team) => team.slug.includes('-3p-'));
		expect(threePlayerTeams).toHaveLength(12);
		expect(threePlayerTeams.map(rosterKey).sort()).toEqual(eligibleRosterKeys(3));
		for (const team of threePlayerTeams) expectFullySourced(team, 3);
	});

	it('includes the thirty-two untouched 2P combinations plus Trish–Joe', () => {
		const twoPlayerTeams = teams.filter((team) => team.slug.includes('-2p-'));
		const untouched = twoPlayerTeams.filter(
			(team) => team.slug !== 'hc-ch2-starter-guide-2p-joe-trish'
		);
		expect(twoPlayerTeams).toHaveLength(33);
		expect(untouched).toHaveLength(32);
		expect(untouched.map(rosterKey).sort()).toEqual(eligibleRosterKeys(2));
		for (const team of twoPlayerTeams) expectFullySourced(team, 2);
	});

	it('keeps every final team within its physical card pool', () => {
		for (const team of teams) {
			const decks = team.members.map(({ deck }) =>
				linkedAhdbDeckToDeck({ deck }, resolver, tabooLists)
			);
			const combination = deckUtility.findTeamOverlaps(decks, team.members.length)[0];
			expect(combination.overlaps, team.slug).toHaveLength(0);
		}
	});

	it('leaves the untouched 2P and 3P source deck card choices unchanged', () => {
		const untouched = teams.filter(
			(team) =>
				(team.slug.includes('-2p-') || team.slug.includes('-3p-')) &&
				team.slug !== 'hc-ch2-starter-guide-2p-joe-trish'
		);
		for (const team of untouched) {
			expect(team.description, team.slug).not.toContain('editor');
			expect(team.guideMd, team.slug).not.toContain('Overlap Resolution');
			for (const member of team.members) {
				expect(member.deck.slots, team.slug).toEqual(member.source!.primary.slots);
				expect(member.deck.sideSlots, team.slug).toEqual(member.source!.primary.sideSlots);
			}
		}
	});

	it('preserves separate Deduction printings in the resolved teams', () => {
		const fourPlayerTeam = teams.find((team) => team.slug.endsWith('joe-trish-marie-miguel'))!;
		const twoPlayerTeam = teams.find((team) => team.slug === 'hc-ch2-starter-guide-2p-joe-trish')!;
		for (const team of [fourPlayerTeam, twoPlayerTeam]) {
			const joe = team.members.find((member) => member.deck.investigator_code === '12004')!;
			const slots = joe.deck.slots ?? {};
			expect(slots['60267'], team.slug).toBe(2);
			expect(slots['12039'], team.slug).toBeUndefined();
		}
		expect(twoPlayerTeam.guideMd).toContain('Deduction');
		expect(twoPlayerTeam.guideMd).not.toContain('Perception');
	});

	it('uses Lie in Wait for Daniela in the Daniela–Isabelle–Carolyn–André team', () => {
		const team = teams.find(
			(team) => team.slug === 'hc-ch2-starter-guide-4p-daniela-isabelle-carolyn-andre'
		)!;
		const daniela = team.members.find((member) => member.deck.investigator_code === '12001')!;
		const isabelle = team.members.find((member) => member.deck.investigator_code === '12013')!;
		expect(daniela.deck.slots?.['60566']).toBe(1);
		expect(daniela.deck.slots?.['12090']).toBeUndefined();
		expect(isabelle.deck.slots?.['12090']).toBe(2);
		expect(isabelle.deck.slots?.['12092']).toBeUndefined();
		expect(team.guideMd).toContain('Lie in Wait');
		expect(team.guideMd).not.toContain('Overpower');
	});
});
