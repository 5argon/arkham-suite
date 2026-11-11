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

let backLinksCache: Map<string, string> | null = null;

/**
 * The code of the card printed on the back of this one when ArkhamDB lists that side as a card of its
 * own, like the other side of Chosen of Zburamoarte. A double-sided card has `backImageCode` instead.
 */
export function backLinkOf(code: string): string | undefined {
	if (!backLinksCache) {
		backLinksCache = new Map();
		for (const card of cardsData as unknown as { code: string; back_link?: string }[]) {
			if (card.back_link) backLinksCache.set(card.code, card.back_link);
		}
	}
	return backLinksCache.get(code);
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
