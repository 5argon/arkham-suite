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
let tabooListsCache: TabooLists | null = null;

/**
 * Create a CardResolver from bundled cards.json.
 */
export function createCardResolver(): CardResolver {
	if (!cardResolverCache) {
		const ahdbCards = cardsData as unknown as AhdbCard[];
		cardResolverCache = new CardResolver(ahdbCards);
	}
	return cardResolverCache;
}

/**
 * Get all resolved cards.
 */
export function getAllCards(): Card[] {
	if (!resolvedCardsCache) {
		const resolver = createCardResolver();
		resolvedCardsCache = resolver.allResolvedCards();
	}
	return resolvedCardsCache;
}

/**
 * Load all taboo lists.
 */
export function loadAllTabooLists(): TabooLists {
	if (!tabooListsCache) {
		const ahdbTaboos = tabooData as unknown as AhdbTabooList;
		tabooListsCache = ahdbTabooListToTabooList(ahdbTaboos);
	}
	return tabooListsCache;
}

/**
 * Clear all caches.
 */
export function clearCache(): void {
	cardResolverCache = null;
	resolvedCardsCache = null;
	tabooListsCache = null;
}
