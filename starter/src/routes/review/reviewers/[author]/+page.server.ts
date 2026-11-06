import { error } from '@sveltejs/kit';

import { prebuiltTeamSummariesOf } from '$lib/server/prebuilt-teams';
import { reviewerSummaries, reviewsBy } from '$lib/server/reviews';
import { contributor, starterSeriesOf } from '$lib/starter-content';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const author = contributor(params.author);
	const reviews = reviewsBy(params.author);
	if (author === undefined || reviews.length === 0) error(404, 'Not found');
	return {
		author,
		reviews,
		hasDecks:
			starterSeriesOf(params.author).length > 0 || prebuiltTeamSummariesOf(params.author).length > 0
	};
};

export const entries: EntryGenerator = () =>
	reviewerSummaries().map(({ slug }) => ({ author: slug }));
