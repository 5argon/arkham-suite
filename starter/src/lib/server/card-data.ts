import type { AhdbCard } from '@5argon/arkham-kohaku';
import {
	type AhdbTabooList,
	ahdbTabooListToTabooList,
	CardResolver,
	type TabooLists
} from '@5argon/arkham-kohaku';
import { PUBLIC_CARD_CDN_URL } from '$env/static/public';
import tabooData from '../data/taboos.json'; // Constant for cards.json URL

// Constant for cards.json URL
const CARDS_JSON_URL = `${PUBLIC_CARD_CDN_URL}/cards.json`;

// In-memory cache for cards data
let cardsCache: AhdbCard[] | null = null;

/**
 * Server-side only: Create a CardResolver by fetching cards from CDN.
 * Caches the cards in memory after first fetch for fast subsequent requests.
 * Uses SvelteKit's fetch for optimized server-side requests.
 * This ensures the large JSON doesn't get bundled with the worker code.
 */
export async function createCardResolver(fetch: typeof globalThis.fetch): Promise<CardResolver> {
	// Return cached cards if available
	if (cardsCache) {
		return new CardResolver(cardsCache);
	}

	const response = await fetch(CARDS_JSON_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch cards.json from ${CARDS_JSON_URL}: ${response.statusText}`);
	}
	const ahdbCards = (await response.json()) as AhdbCard[];

	// Cache for future requests
	cardsCache = ahdbCards;

	return new CardResolver(ahdbCards);
}

/**
 * Server-side only: Load all taboo lists.
 */
export function loadAllTabooLists(): TabooLists {
	const ahdbTaboos = tabooData as unknown as AhdbTabooList;
	return ahdbTabooListToTabooList(ahdbTaboos);
}
