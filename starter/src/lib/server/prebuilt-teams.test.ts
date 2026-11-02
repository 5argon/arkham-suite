import { describe, expect, it } from 'vitest';

import { getAllCards } from '$lib/card-data';
import { teamDisplay } from '$lib/tool/evergreen-team/team-display';
import { teamMatchesProducts, teamState } from '$lib/tool/starter/filter';

import { allPrebuiltTeams, allPrebuiltTeamSummaries } from './prebuilt-teams';

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

	it('can be matched by owned products without the decks', () => {
		const owned = { products: new Set(summaries[0].deckProducts), investigators: new Set<string>() };
		expect(teamMatchesProducts(summaries[0], owned)).toBe(true);
	});
});
