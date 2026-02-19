import type { PageServerLoad } from './$types';
import type { Deck } from '@5argon/arkham-kohaku';
import { loadDeckById } from '$lib/server/deck-loader';

export const prerender = false;
export const load: PageServerLoad = async ({ params, fetch }) => {
	const id = params.id;

	let preLoadedDeck: Deck | null = null;
	if (id) {
		preLoadedDeck = await loadDeckById(id, fetch, true);
	}

	return {
		preLoadedDeck
	};
};
