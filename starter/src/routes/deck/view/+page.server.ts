import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
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
		try {
			preLoadedDeck = await loadDeckById(id, fetch);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			throw error(404, errorMessage);
		}
	}

	return {
		preLoadedDeck
	};
};
