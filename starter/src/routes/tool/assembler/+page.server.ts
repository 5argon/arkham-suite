import type { PageServerLoad } from './$types';
import { createCardResolver, loadAllTabooLists } from '$lib/server/card-data';
import { type Deck, linkedAhdbDeckToDeck, service } from '@5argon/arkham-kohaku';

export const prerender = false;
export const load: PageServerLoad = async ({ url, fetch }) => {
	// Check for p1-p20 parameters to pre-load decks (allowing up to 20 decks)
	const deckParams: string[] = [];
	for (let i = 1; i <= 20; i++) {
		const param = url.searchParams.get(`p${i}`);
		if (param) {
			deckParams.push(param);
		}
	}

	// Load decks from URL if present
	let preLoadedDecks: Deck[] = [];
	if (deckParams.length > 0) {
		const noCacheFetch = (input: string | URL | Request, init?: RequestInit) => {
			return fetch(input, { ...init, cache: 'no-store' });
		};

		const tabooLists = loadAllTabooLists();
		const cardResolver = await createCardResolver(fetch);

		const deckPromises = deckParams.map(async (param) => {
			try {
				const linkedDeck = await service.fetchDeckRecursive(noCacheFetch, param);
				const deck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, tabooLists);
				return deck;
			} catch (error) {
				console.error(`Failed to load deck ${param}:`, error);
				return null;
			}
		});

		const results = await Promise.all(deckPromises);
		preLoadedDecks = results.filter((deck): deck is Deck => deck !== null);
	}

	return {
		preLoadedDecks
	};
};
