import type { PageServerLoad } from './$types';
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
		} catch (error) {
			console.error(`Failed to load deck ${id}:`, error);
			throw new Error(`Failed to load deck: ${id}`);
		}
	}

	return {
		preLoadedDeck
	};
};
