import { error } from '@sveltejs/kit';

import { allStarterAuthors, starterAuthor, starterSeriesOf } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const author = starterAuthor(params.author);
	if (author === undefined) error(404, 'Not found');
	return { author, series: starterSeriesOf(author.slug) };
};

/**
 * Nothing links here from a crawlable anchor on the front page, so the
 * prerenderer is told every author explicitly.
 */
export const entries: EntryGenerator = () =>
	allStarterAuthors().map((author) => ({ author: author.slug }));
