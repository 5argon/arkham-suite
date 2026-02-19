import type { PageServerLoad } from './$types';
import type { Deck } from '@5argon/arkham-kohaku';
import { loadDeckFromJson, loadDeckById } from '$lib/server/deck-loader';

export const prerender = false;
export const load: PageServerLoad = async ({ url, fetch }) => {
	const id = url.searchParams.get('id');
	const json = url.searchParams.get('json');

	let preLoadedDeck: Deck | null = null;
	
	if (json) {
		// Decompress deck from JSON parameter (protobuf format from QR code)
		preLoadedDeck = await loadDeckFromJson(json, fetch);
	} else if (id) {
		// Fetch deck by ID from database
		preLoadedDeck = await loadDeckById(id, fetch);
	}

	return {
		preLoadedDeck
	};
};
