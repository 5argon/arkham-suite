import { type CardCode, Product } from '@5argon/arkham-kohaku';

import { deckCardPool, type PrebuiltTeam, type StarterDeckEntry } from '$lib/starter-content';
import { decksToEvergreenState } from '$lib/tool/evergreen-team/from-decks';
import type { EvergreenState } from '$lib/tool/evergreen-team/types';
import type { Card } from '@5argon/arkham-kohaku';

export interface StarterFilterValue {
	products: ReadonlySet<Product>;
	investigators: ReadonlySet<CardCode>;
	mustIncludeAll?: boolean;
}

const CORE = Product.CoreSet2026;

/**
 * Buildable from the owned products, whoever the investigator is.
 */
export function deckMatchesProducts(entry: StarterDeckEntry, filter: StarterFilterValue): boolean {
	return deckCardPool(entry.primary).every((p) => p === CORE || filter.products.has(p as Product));
}

export function deckMatches(entry: StarterDeckEntry, filter: StarterFilterValue): boolean {
	return (
		deckMatchesProducts(entry, filter) && filter.investigators.has(entry.primary.investigator_code)
	);
}

/**
 * A random item, avoiding `previous` when there is anything else to show so
 * pressing Randomize again always changes the result.
 */
export function pickRandom<T>(items: T[], previous: T | null): T | null {
	const pool = items.length > 1 ? items.filter((x) => x !== previous) : items;
	if (pool.length === 0) return null;
	return pool[Math.floor(Math.random() * pool.length)];
}

export function matchesInvestigators(
	resultInvestigators: Iterable<CardCode>,
	filter: StarterFilterValue
): boolean {
	if (filter.investigators.size === 0) return false;

	if (filter.mustIncludeAll) {
		const included = new Set(resultInvestigators);
		return [...filter.investigators].every((code) => included.has(code));
	}

	return [...resultInvestigators].some((code) => filter.investigators.has(code));
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

/**
 * Player counts pre-built teams are browsed by.
 */
export const TEAM_SIZES = [2, 3, 4] as const;

export function teamSize(entry: PrebuiltTeamEntry): number {
	return entry.builderState.decks.length;
}

export function teamMatchesProducts(entry: PrebuiltTeamEntry, filter: StarterFilterValue): boolean {
	return entry.builderState.setup.deckProducts.every((p) => p === CORE || filter.products.has(p));
}

export function teamMatches(entry: PrebuiltTeamEntry, filter: StarterFilterValue): boolean {
	const { decks } = entry.builderState;
	return (
		teamMatchesProducts(entry, filter) &&
		matchesInvestigators(
			decks.map((deck) => deck.investigator),
			filter
		)
	);
}
