import type { AhdbCard, Card } from '@5argon/arkham-kohaku';
import {
	type AhdbTabooList,
	ahdbTabooListToTabooList,
	CardResolver,
	type TabooLists
} from '@5argon/arkham-kohaku';
import cardsData from './data/cards.json';
import tabooData from './data/taboos.json';

let cardResolverCache: CardResolver | null = null;
let resolvedCardsCache: Card[] | null = null;
let cardsByCodeCache: Map<string, Card> | null = null;
let tabooListsCache: TabooLists | null = null;

export function createCardResolver(): CardResolver {
	if (!cardResolverCache) {
		const ahdbCards = cardsData as unknown as AhdbCard[];
		cardResolverCache = new CardResolver(ahdbCards);
	}
	return cardResolverCache;
}

export function getAllCards(): Card[] {
	if (!resolvedCardsCache) {
		const resolver = createCardResolver();
		resolvedCardsCache = resolver.allResolvedCards();
	}
	return resolvedCardsCache;
}

/** Every resolved card keyed by code, built once per session. */
export function cardsByCode(): ReadonlyMap<string, Card> {
	if (!cardsByCodeCache) {
		cardsByCodeCache = new Map(getAllCards().map((c) => [c.code, c]));
	}
	return cardsByCodeCache;
}

export function cardByCode(code: string): Card | undefined {
	return cardsByCode().get(code);
}

/** Resolve a card code, or `null` when the code is unknown to the bundled database. */
export function resolveCardOrNull(code: string): Card | null {
	try {
		return createCardResolver().resolve(code);
	} catch {
		return null;
	}
}

export function loadAllTabooLists(): TabooLists {
	if (!tabooListsCache) {
		const ahdbTaboos = tabooData as unknown as AhdbTabooList;
		tabooListsCache = ahdbTabooListToTabooList(ahdbTaboos);
	}
	return tabooListsCache;
}
