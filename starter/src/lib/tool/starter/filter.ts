import { type CardCode, Product } from '@5argon/arkham-kohaku';

import { deckCardPool, type PrebuiltTeam, type StarterDeckEntry } from '$lib/starter-content';
import { decksToEvergreenState } from '$lib/tool/evergreen-team/from-decks';
import type { EvergreenState } from '$lib/tool/evergreen-team/types';
import type { Card } from '@5argon/arkham-kohaku';

export interface StarterFilterValue {
	products: ReadonlySet<Product>;
	investigators: ReadonlySet<CardCode>;
}

const CORE = Product.CoreSet2026;

export function deckMatches(entry: StarterDeckEntry, filter: StarterFilterValue): boolean {
	return (
		deckCardPool(entry.primary).every((p) => p === CORE || filter.products.has(p as Product)) &&
		filter.investigators.has(entry.primary.investigator_code)
	);
}

export interface PrebuiltTeamEntry {
	team: PrebuiltTeam;
	builderState: EvergreenState;
}

/**
 * Builds each team's Team Builder state from its deck JSON once; it carries
 * the products and investigators the filter matches against, and the team's
 * name / author / description for the banner.
 */
export function decodeTeams(teams: PrebuiltTeam[], allCards: Card[]): PrebuiltTeamEntry[] {
	return teams.map((team) => ({ team, builderState: teamState(team, allCards) }));
}

export function teamState(team: PrebuiltTeam, allCards: Card[]): EvergreenState {
	return decksToEvergreenState(
		team.members.map((member) => member.deck),
		allCards,
		{
			name: team.name,
			author: team.author,
			description: team.description
		}
	);
}

export function teamMatches(entry: PrebuiltTeamEntry, filter: StarterFilterValue): boolean {
	const { setup, decks } = entry.builderState;
	return (
		setup.deckProducts.every((p) => p === CORE || filter.products.has(p)) &&
		decks.every((deck) => filter.investigators.has(deck.investigator))
	);
}
