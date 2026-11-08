import { error } from '@sveltejs/kit';

import { allStarterDecks, starterDeck } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

// The card text shown on hover comes from the server load, so it stays out of the bundle.
export const load: PageLoad = ({ params, data }) => {
	const entry = starterDeck(params.author, params.series, params.deck);
	if (entry === undefined) error(404, 'Not found');
	return { ...data, entry };
};

export const entries: EntryGenerator = () =>
	allStarterDecks().map((entry) => ({
		author: entry.series.author.slug,
		series: entry.series.slug,
		deck: entry.slug
	}));
