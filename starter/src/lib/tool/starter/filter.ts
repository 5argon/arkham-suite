import { type AhdbDeck, card as cardUtils, type CardCode, Product } from '@5argon/arkham-kohaku';

import {
	deckCardPool,
	type PrebuiltTeam,
	type PrebuiltTeamSummary,
	type PrebuiltTeamSummaryMember,
	type StarterDeckEntry,
	starterDeckFromRef,
	toCore2026Code
} from '$lib/starter-content';
import { decksToEvergreenState } from '$lib/tool/evergreen-team/from-decks';
import { protoStringRestore } from '$lib/tool/script/export/proto-string-restore';

import { applyDeckChanges } from './deck-changes';
import type { EvergreenState } from '$lib/tool/evergreen-team/types';
import type { Card } from '@5argon/arkham-kohaku';

export interface StarterFilterValue {
	products: ReadonlySet<Product>;
	investigators: ReadonlySet<CardCode>;
	/**
	 * What to look for: decks and teams of the picked investigators, or ones
	 * playing the picked cards. Only the chosen one applies.
	 */
	pickBy?: 'investigators' | 'cards';
	cards?: ReadonlySet<CardCode>;
	mustIncludeAll?: boolean;
}

/**
 * Whether the reader has yet to pick anything to look for.
 */
export function pickedNothing(filter: StarterFilterValue): boolean {
	return filter.pickBy === 'cards'
		? (filter.cards?.size ?? 0) === 0
		: filter.investigators.size === 0;
}

/**
 * The cards a deck plays, including its upgrades. A reprint counts as its Core
 * Set printing, so picking a card finds every deck playing either one.
 */
export function deckCardCodes(deck: Pick<AhdbDeck, 'slots' | 'sideSlots'>): CardCode[] {
	const codes = Object.keys({ ...deck.slots, ...deck.sideSlots }).map(toCore2026Code);
	return [...new Set(codes)];
}

const plannedCopiesOf = new WeakMap<StarterDeckEntry, Map<CardCode, number[]>>();

/**
 * Cards a deck's upgrade plan adds, as Core Set printings where one exists: the
 * running XP total at which each copy arrives. Includes upgrades beyond the
 * deck's last listed version.
 */
export function plannedCopies(entry: StarterDeckEntry): Map<CardCode, number[]> {
	const known = plannedCopiesOf.get(entry);
	if (known !== undefined) return known;
	const copies = new Map<CardCode, number[]>();
	if (entry.upgradePlan !== undefined) {
		for (const row of protoStringRestore(decodeURIComponent(entry.upgradePlan)).rows) {
			if (row.divider || !row.right) continue;
			const code = toCore2026Code(row.right);
			copies.set(code, [...(copies.get(code) ?? []), row.carryoverXp]);
		}
	}
	plannedCopiesOf.set(entry, copies);
	return copies;
}

/**
 * Every card a hosted deck plays or plans to, to search it by.
 */
export function entryCardCodes(entry: StarterDeckEntry): CardCode[] {
	return [...new Set([...deckCardCodes(entry.primary), ...plannedCopies(entry).keys()])];
}

interface PlayableCards {
	deck: Pick<AhdbDeck, 'slots' | 'sideSlots'>;
	planned: Map<CardCode, number[]>;
}

const memberCardsOf = new WeakMap<PrebuiltTeamSummaryMember, PlayableCards>();

/**
 * A team member's cards: its source deck with the changes applied, and what that
 * source plans to add. Tailor-made decks have no plan.
 */
function memberCards(member: PrebuiltTeamSummaryMember): PlayableCards {
	const known = memberCardsOf.get(member);
	if (known !== undefined) return known;
	let cards: PlayableCards;
	if ('deck' in member) {
		cards = { deck: member.deck, planned: new Map() };
	} else {
		const entry = starterDeckFromRef(member.source);
		if (entry === undefined) throw new Error(`Pre-built team source missing: ${member.source}`);
		cards = {
			deck: applyDeckChanges(entry.primary, member.changes ?? [], member.source),
			planned: plannedCopies(entry)
		};
	}
	memberCardsOf.set(member, cards);
	return cards;
}

const teamCardCodesOf = new WeakMap<PrebuiltTeamSummary, CardCode[]>();

/**
 * Every card anyone on a team plays or plans to, to search it by.
 */
export function teamCardCodes(team: PrebuiltTeamSummary): CardCode[] {
	const known = teamCardCodesOf.get(team);
	if (known !== undefined) return known;
	const codes = [
		...new Set(
			team.members.flatMap((member) => {
				const { deck, planned } = memberCards(member);
				return [...deckCardCodes(deck), ...planned.keys()];
			})
		)
	];
	teamCardCodesOf.set(team, codes);
	return codes;
}

/**
 * One line of how a deck plays a picked card. `addedAtXp` has the running XP
 * total of each copy, empty for copies not on the upgrade plan.
 */
export interface DeckCardMatch {
	code: CardCode;
	quantity: number;
	addedAtXp: number[];
}

/**
 * How a deck plays the picked cards: what it starts with, then what it gets later
 * in the order it arrives. Empty when not looking for cards.
 */
export function deckCardMatches(
	entry: StarterDeckEntry,
	filter: StarterFilterValue
): DeckCardMatch[] {
	return cardMatches({ deck: entry.primary, planned: plannedCopies(entry) }, filter);
}

/**
 * The same for each member of a team, parallel to its members.
 */
export function teamCardMatches(
	team: PrebuiltTeamSummary,
	filter: StarterFilterValue
): DeckCardMatch[][] {
	return team.members.map((member) => cardMatches(memberCards(member), filter));
}

function cardMatches({ deck, planned }: PlayableCards, filter: StarterFilterValue): DeckCardMatch[] {
	if (filter.pickBy !== 'cards') return [];
	const copiesIn = (slots: Record<string, number> | null | undefined, code: CardCode) =>
		Object.entries(slots ?? {}).reduce(
			(sum, [held, quantity]) => (toCore2026Code(held) === code ? sum + quantity : sum),
			0
		);
	const picked = [...new Set([...(filter.cards ?? [])].map(toCore2026Code))];
	const matches = picked.flatMap((code): DeckCardMatch[] => {
		const main = copiesIn(deck.slots, code);
		const addedAtXp = planned.get(code) ?? [];
		const lines: DeckCardMatch[] = [];
		if (main > 0) lines.push({ code, quantity: main, addedAtXp: [] });
		if (addedAtXp.length > 0) lines.push({ code, quantity: addedAtXp.length, addedAtXp });
		if (lines.length === 0) {
			const side = copiesIn(deck.sideSlots, code);
			if (side > 0) lines.push({ code, quantity: side, addedAtXp: [] });
		}
		return lines;
	});
	const arrival = (match: DeckCardMatch) => match.addedAtXp[0] ?? 0;
	return matches.sort((a, b) => arrival(a) - arrival(b));
}

/**
 * The cards to look for decks and teams by: from Core Set 2026 and the chosen
 * products, without signature cards or weaknesses. Each printing of a reprint
 * has its own entry, and picking either finds the same decks.
 */
export function pickableCards(allCards: Card[], products: ReadonlySet<Product>): Card[] {
	return allCards.filter(
		(c) =>
			(c.product === CORE || products.has(c.product)) && cardUtils.deckbuildingPlayerCardsFilter(c)
	);
}

/**
 * @param played Core Set printings where one exists, see {@link deckCardCodes}.
 */
export function matchesCards(played: readonly CardCode[], filter: StarterFilterValue): boolean {
	const picked = [...new Set([...(filter.cards ?? [])].map(toCore2026Code))];
	if (picked.length === 0) return false;
	return filter.mustIncludeAll
		? picked.every((code) => played.includes(code))
		: picked.some((code) => played.includes(code));
}

const CORE = Product.CoreSet2026;

/**
 * Buildable from the owned products, whoever the investigator is.
 */
export function deckMatchesProducts(entry: StarterDeckEntry, filter: StarterFilterValue): boolean {
	return deckCardPool(entry.primary).every((p) => p === CORE || filter.products.has(p as Product));
}

export function deckMatches(entry: StarterDeckEntry, filter: StarterFilterValue): boolean {
	if (!deckMatchesProducts(entry, filter)) return false;
	return filter.pickBy === 'cards'
		? matchesCards(entryCardCodes(entry), filter)
		: filter.investigators.has(entry.primary.investigator_code);
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
	if (!teamMatchesProducts(team, filter)) return false;
	return filter.pickBy === 'cards'
		? matchesCards(teamCardCodes(team), filter)
		: matchesInvestigators(
				team.display.members.map((member) => member.investigator),
				filter
			);
}
