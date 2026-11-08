import type { AhdbDeck } from '@5argon/arkham-kohaku';
import { error } from '@sveltejs/kit';

import { allStarterDecks, starterDeck } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

// The card text shown on hover and the rules the guide quotes come from the server load, so they
// stay out of the bundle.
export const load: PageLoad = ({ params, data }) => {
	const found = starterDeck(params.author, params.series, params.deck);
	if (found === undefined) error(404, 'Not found');
	const { guideMd, mentionedText } = data;
	const withGuide = (deck: AhdbDeck): AhdbDeck =>
		guideMd === undefined ? deck : { ...deck, description_md: guideMd };
	const versions = found.versions.map((version) => ({ ...version, deck: withGuide(version.deck) }));
	const entry = { ...found, versions, primary: versions[0].deck };
	return { mentionedText, entry };
};

export const entries: EntryGenerator = () =>
	allStarterDecks().map((entry) => ({
		author: entry.series.author.slug,
		series: entry.series.slug,
		deck: entry.slug
	}));
