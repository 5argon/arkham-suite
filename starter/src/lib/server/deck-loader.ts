import { createCardResolver, loadAllTabooLists } from '$lib/server/card-data';
import { type Deck, linkedAhdbDeckToDeck, service, deck } from '@5argon/arkham-kohaku';
import { decompressDeckProtobuf } from '$lib/utility/deck-compress';

/**
 * Load a deck from compressed JSON (protobuf format) - typically from QR code
 * @param json - The compressed JSON string
 * @param fetch - The fetch function to use for resolving cards
 * @returns The loaded Deck or null if loading failed
 */
export async function loadDeckFromJson(
	json: string,
	fetch: typeof globalThis.fetch
): Promise<Deck | null> {
	try {
		const tabooLists = loadAllTabooLists();
		const cardResolver = await createCardResolver(fetch);
		const ahdbDeck = decompressDeckProtobuf(json);
		const linkedDeck = { deck: ahdbDeck };
		const loadedDeck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, tabooLists);
		// compressedJson needs to be set for QR-loaded decks
		loadedDeck.compressedJson = deck.compressDeck(ahdbDeck);
		return loadedDeck;
	} catch (error) {
		console.error('Failed to decompress deck from json parameter:', error);
		return null;
	}
}

/**
 * Load a deck from ArkhamDB by its ID
 * @param id - The deck ID
 * @param fetch - The fetch function to use for API calls
 * @param throwOnError - Whether to throw an error on failure (default: false)
 * @returns The loaded Deck or null if loading failed
 */
export async function loadDeckById(
	id: string,
	fetch: typeof globalThis.fetch,
	throwOnError = false
): Promise<Deck | null> {
	const noCacheFetch = (input: string | URL | Request, init?: RequestInit) => {
		return fetch(input, { ...init, cache: 'no-store' });
	};

	try {
		const tabooLists = loadAllTabooLists();
		const cardResolver = await createCardResolver(fetch);
		const linkedDeck = await service.fetchDeckRecursive(noCacheFetch, id);
		const loadedDeck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, tabooLists);
		return loadedDeck;
	} catch (error) {
		console.error(`Failed to load deck ${id}:`, error);
		if (throwOnError) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to load deck ${id}: ${errorMessage}`);
		}
		return null;
	}
}
