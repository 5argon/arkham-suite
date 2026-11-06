import { redirect } from '@sveltejs/kit';

import { reviewerHref } from '$lib/review/paths';
import { prebuiltTeamSummariesOf } from '$lib/server/prebuilt-teams';
import { reviewsBy } from '$lib/server/reviews';
import { starterSeriesOf } from '$lib/starter-content';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const teams = prebuiltTeamSummariesOf(params.author);
	const hasReviews = reviewsBy(params.author).length > 0;
	// Someone with only reviews has nothing to show here, their page is with the reviews.
	if (hasReviews && teams.length === 0 && starterSeriesOf(params.author).length === 0) {
		redirect(308, reviewerHref(params.author));
	}
	return { teams, hasReviews };
};
