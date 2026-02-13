import type { PageServerLoad } from './$types';
import { createCardResolver, loadAllTabooLists } from '$lib/server/card-data';
import { type Deck, linkedAhdbDeckToDeck, service } from '@5argon/arkham-kohaku';

export const prerender = false;
export const load: PageServerLoad = async ({ url, fetch }) => {
	// Check for a1-a8 (campaign A) and b1-b8 (campaign B) parameters to pre-load decks
	const campaignAParams: string[] = [];
	const campaignBParams: string[] = [];
	for (let i = 1; i <= 8; i++) {
		const paramA = url.searchParams.get(`a${i}`);
		const paramB = url.searchParams.get(`b${i}`);
		if (paramA) {
			campaignAParams.push(paramA);
		}
		if (paramB) {
			campaignBParams.push(paramB);
		}
	}

	// Load decks from URL if present
	let preLoadedCampaignA: Deck[] = [];
	let preLoadedCampaignB: Deck[] = [];

	if (campaignAParams.length > 0 || campaignBParams.length > 0) {
		const noCacheFetch = (input: string | URL | Request, init?: RequestInit) => {
			return fetch(input, { ...init, cache: 'no-store' });
		};

		const tabooLists = loadAllTabooLists();
		const cardResolver = await createCardResolver(fetch);

		const loadDecks = async (params: string[]) => {
			const deckPromises = params.map(async (param) => {
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
			return results.filter((deck): deck is Deck => deck !== null);
		};

		if (campaignAParams.length > 0) {
			preLoadedCampaignA = await loadDecks(campaignAParams);
		}
		if (campaignBParams.length > 0) {
			preLoadedCampaignB = await loadDecks(campaignBParams);
		}
	}

	return {
		preLoadedCampaignA,
		preLoadedCampaignB
	};
};
