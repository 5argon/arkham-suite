import type { PageServerLoad } from './$types';
import { createCardResolver, loadAllTabooLists } from '$lib/server/card-data';
import { type Deck, linkedAhdbDeckToDeck, service, deck } from '@5argon/arkham-kohaku';
import { decompressDeckProtobuf } from '$lib/utility/deck-compress';

export const prerender = false;
export const load: PageServerLoad = async ({ url, fetch }) => {
	const id = url.searchParams.get('id');
	const json = url.searchParams.get('json');

	let preLoadedDeck: Deck | null = null;
	
	if (json) {
		// Decompress deck from JSON parameter (protobuf format from QR code)
		try {
			const tabooLists = loadAllTabooLists();
			const cardResolver = await createCardResolver(fetch);
			const ahdbDeck = decompressDeckProtobuf(json);
			const linkedDeck = { deck: ahdbDeck };
			preLoadedDeck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, tabooLists);
			// compressedJson is already set by ahdbDeckToDeck, but we need to set it for QR-loaded decks
			preLoadedDeck.compressedJson = deck.compressDeck(ahdbDeck);
		} catch (error) {
			console.error('Failed to decompress deck from json parameter:', error);
		}
	} else if (id) {
		// Fetch deck by ID from database
		const noCacheFetch = (input: string | URL | Request, init?: RequestInit) => {
			return fetch(input, { ...init, cache: 'no-store' });
		};

		try {
			const tabooLists = loadAllTabooLists();
			const cardResolver = await createCardResolver(fetch);
			const linkedDeck = await service.fetchDeckRecursive(noCacheFetch, id);
			preLoadedDeck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, tabooLists);
			// compressedJson is already set by ahdbDeckToDeck
		} catch (error) {
			console.error(`Failed to load deck ${id}:`, error);
		}
	}

	return {
		preLoadedDeck
	};
};
