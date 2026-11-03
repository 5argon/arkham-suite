import { type CardCode, Product } from '@5argon/arkham-kohaku';

import {
	deckCardPool,
	type PrebuiltTeam,
	type PrebuiltTeamSummary,
	type StarterDeckEntry
} from '$lib/starter-content';
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

const COMPOSITION_TAG = /^(\d+)C\+(\d+)ID$/;

function compositionOf(tag: string): { players: number; core: number } | null {
	const match = COMPOSITION_TAG.exec(tag);
	return match === null
		? null
		: { players: Number(match[1]) + Number(match[2]), core: Number(match[1]) };
}

const ADJACENCY_TAGS = ['Adjacent Core', 'Non-Adjacent Core'];

/**
 * Every tag these teams have, in the order to offer them: series first, then
 * Core Set and Investigator Deck mixes by player count, most Core Set first, then
 * whether the Core Set investigators are adjacent.
 */
function teamTags(teams: PrebuiltTeamSummary[]): string[] {
	const groupOf = (tag: string) =>
		ADJACENCY_TAGS.includes(tag) ? 2 : compositionOf(tag) === null ? 0 : 1;
	return [...new Set(teams.flatMap((team) => team.tags))].sort((a, b) => {
		const [mixA, mixB] = [compositionOf(a), compositionOf(b)];
		return (
			groupOf(a) - groupOf(b) ||
			(mixA !== null && mixB !== null
				? mixA.players - mixB.players || mixB.core - mixA.core
				: a.localeCompare(b))
		);
	});
}

export function teamHasTags(team: PrebuiltTeamSummary, tags: readonly string[]): boolean {
	return tags.every((tag) => team.tags.includes(tag));
}

/**
 * The tags of the teams left by those in effect, each with how many teams would
 * be left by adding it.
 */
export function tagChoices(
	teams: PrebuiltTeamSummary[],
	active: readonly string[]
): { label: string; count: number }[] {
	const matching = teams.filter((team) => teamHasTags(team, active));
	return teamTags(matching)
		.filter((tag) => !active.includes(tag))
		.map((label) => ({
			label,
			count: matching.filter((team) => team.tags.includes(label)).length
		}));
}

/**
 * Player counts pre-built teams are browsed by.
 */
export const TEAM_SIZES = [2, 3, 4] as const;

export function teamSize(team: PrebuiltTeamSummary): number {
	return team.display.members.length;
}

export function teamMatchesProducts(
	team: PrebuiltTeamSummary,
	filter: StarterFilterValue
): boolean {
	return team.deckProducts.every((p) => p === CORE || filter.products.has(p));
}

export function teamMatches(team: PrebuiltTeamSummary, filter: StarterFilterValue): boolean {
	return (
		teamMatchesProducts(team, filter) &&
		matchesInvestigators(
			team.display.members.map((member) => member.investigator),
			filter
		)
	);
}
