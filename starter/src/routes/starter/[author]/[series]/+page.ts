import { error, redirect } from '@sveltejs/kit';

import { allStarterAuthors, starterSeries, starterSeriesOf } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

/**
 * A series has no page of its own: its URL lands on the author's page,
 * scrolled to that series, so the author's other series stay discoverable.
 */
export const load: PageLoad = ({ params }) => {
	const series = starterSeries(params.author, params.series);
	if (series === undefined) error(404, 'Not found');
	redirect(308, `/starter/${series.author.slug}#${series.slug}`);
};

export const entries: EntryGenerator = () =>
	allStarterAuthors().flatMap((author) =>
		starterSeriesOf(author.slug).map((series) => ({ author: author.slug, series: series.slug }))
	);
