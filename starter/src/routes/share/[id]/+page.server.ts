import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { createCardResolver, loadAllTabooLists } from '$lib/server/card-data';
import { type Deck, linkedAhdbDeckToDeck, service } from '@5argon/arkham-kohaku';

export const prerender = false;
export const load: PageServerLoad = async ({ params, fetch }) => {
	const id = params.id;

	let preLoadedDeck: Deck | null = null;
	if (id) {
		const noCacheFetch = (input: string | URL | Request, init?: RequestInit) => {
			return fetch(input, { ...init, cache: 'no-store' });
		};

		try {
			const tabooLists = loadAllTabooLists();
			const cardResolver = await createCardResolver(fetch);
			const linkedDeck = await service.fetchDeckRecursive(noCacheFetch, id);
			preLoadedDeck = linkedAhdbDeckToDeck(linkedDeck, cardResolver, tabooLists);
		} catch (err) {
			console.error(`Failed to load deck ${id}:`, err);
			const errorMessage = err instanceof Error ? err.message : String(err);
			throw error(404, `Failed to load deck ${id}: ${errorMessage}`);
		}
	}

	return {
		preLoadedDeck
	};
};
