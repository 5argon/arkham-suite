import { error } from '@sveltejs/kit';

import { allContributors, contributor, starterSeriesOf } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const author = contributor(params.author);
	if (author === undefined) error(404, 'Not found');
	return { author, series: starterSeriesOf(author.slug) };
};

/**
 * Nothing links here from a crawlable anchor on the front page, so the
 * prerenderer is told every contributor explicitly.
 */
export const entries: EntryGenerator = () =>
	allContributors().map((person) => ({ author: person.slug }));
