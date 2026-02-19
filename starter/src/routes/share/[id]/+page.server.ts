import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Deck } from '@5argon/arkham-kohaku';
import { loadDeckById } from '$lib/server/deck-loader';

export const prerender = false;
export const load: PageServerLoad = async ({ params, fetch }) => {
	const id = params.id;

	let preLoadedDeck: Deck | null = null;
	if (id) {
		try {
			preLoadedDeck = await loadDeckById(id, fetch, true);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			throw error(404, errorMessage);
		}
	}

	return {
		preLoadedDeck
	};
};
