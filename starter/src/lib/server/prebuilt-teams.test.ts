import { deck as deckUtility, linkedAhdbDeckToDeck } from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { createCardResolver, getAllCards, loadAllTabooLists } from '$lib/card-data';
import { teamDisplay } from '$lib/tool/evergreen-team/team-display';
import { toCore2026Code } from '$lib/starter-content';
import {
	type StarterFilterValue,
	teamCardCodes,
	teamCardMatches,
	teamMatchesProducts,
	teamState
} from '$lib/tool/starter/filter';

import { allPrebuiltTeams, allPrebuiltTeamSummaries } from './prebuilt-teams';
import { OVERLAP_TABLE_MARKER } from './team-deck-changes';

/**
 * Source decks can change, and every team built on one follows. These fail when
 * that leaves a team or its guide wrong.
 */
describe('pre-built teams built on hosted decks', () => {
	const teams = allPrebuiltTeams();
	const resolver = createCardResolver();

	const sameCards = (a?: Record<string, number> | null, b?: Record<string, number> | null) =>
		JSON.stringify(Object.entries(a ?? {}).sort()) === JSON.stringify(Object.entries(b ?? {}).sort());

	it('leave no overlap unresolved', () => {
		for (const team of teams) {
			const decks = team.members.map(({ deck }) =>
				linkedAhdbDeckToDeck({ deck }, resolver, loadAllTabooLists())
			);
			expect(deckUtility.findDeckOverlaps(decks), team.slug).toHaveLength(0);
		}
	});

	it('explain their class access in their guide', () => {
		for (const team of teams) expect(team.guideMd, team.slug).toContain('### Class Access');
	});

	it('show a table exactly when a main deck differs from its source', () => {
		for (const team of teams) {
			const changed = team.members.some(
				({ deck, source }) => source !== undefined && !sameCards(deck.slots, source.primary.slots)
			);
			expect(team.guideMd.includes('<table>'), team.slug).toBe(changed);
			expect(team.guideMd, team.slug).not.toContain(OVERLAP_TABLE_MARKER);
		}
	});

	it('still mention every replacement in guides that explain them by hand', () => {
		const boilerplate = "The author's original starter decks were slightly modified";
		for (const team of teams) {
			const prose = team.guideMd.split(/### Overlap Resolutions?/)[1]?.split('<table>')[0] ?? '';
			if (prose.trim() === '' || prose.includes(boilerplate)) continue;
			for (const { deck, source } of team.members) {
				for (const code of Object.keys(deck.slots ?? {})) {
					if ((source?.primary.slots?.[code] ?? 0) >= (deck.slots?.[code] ?? 0)) continue;
					expect(prose, `${team.slug} ${code}`).toContain(resolver.resolve(code).name);
				}
			}
		}
	});
});

describe('pre-built team summaries', () => {
	const teams = allPrebuiltTeams();
	const summaries = allPrebuiltTeamSummaries();

	it('stay small, since every listing delivers all of them', () => {
		const average = JSON.stringify(summaries).length / summaries.length;
		expect(average).toBeLessThan(1500);
	});

	it('match what the full team shows', () => {
		teams.forEach((team, i) => {
			const state = teamState(team, getAllCards());
			expect(summaries[i].slug).toBe(team.slug);
			expect(summaries[i].tags).toEqual(team.tags);
			expect(summaries[i].deckProducts).toEqual(state.setup.deckProducts);
			expect(summaries[i].display).toEqual(teamDisplay(state, getAllCards()));
		});
	});

	it('list its members in the same order as the team', () => {
		teams.forEach((team, i) => {
			expect(summaries[i].display.members.map((member) => member.investigator)).toEqual(
				team.members.map((member) => member.deck.investigator_code)
			);
		});
	});

	it('find a reprint by its Core Set printing', () => {
		const printed = teams.find((team) =>
			team.members.some(({ deck }) => deck.slots?.['60267'] !== undefined)
		)!;
		const summary = summaries.find((team) => team.slug === printed.slug)!;
		expect(teamCardCodes(summary)).toContain('12039');
		expect(teamCardCodes(summary)).not.toContain('60267');
	});

	it('rebuild the same cards each member really plays, without the decks', () => {
		teams.forEach((team, i) => {
			const looking = (code: string): StarterFilterValue => ({
				products: new Set(),
				investigators: new Set(),
				pickBy: 'cards',
				cards: new Set([code])
			});
			const matches = (code: string) => teamCardMatches(summaries[i], looking(code));
			team.members.forEach(({ deck }, m) => {
				for (const [code, quantity] of Object.entries(deck.slots ?? {})) {
					const core = toCore2026Code(code);
					const owned = Object.entries(deck.slots ?? {})
						.filter(([held]) => toCore2026Code(held) === core)
						.reduce((sum, [, q]) => sum + q, 0);
					const starting = matches(code)[m].find((match) => match.addedAtXp.length === 0);
					expect(starting?.quantity, `${team.slug} ${code} ${quantity}`).toBe(owned);
				}
			});
		});
	});

	it('can be matched by owned products without the decks', () => {
		const owned = { products: new Set(summaries[0].deckProducts), investigators: new Set<string>() };
		expect(teamMatchesProducts(summaries[0], owned)).toBe(true);
	});
});
