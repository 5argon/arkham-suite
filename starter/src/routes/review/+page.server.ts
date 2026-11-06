import { recentReviews, reviewProductSummaries } from '$lib/server/reviews';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	summaries: reviewProductSummaries(),
	recents: recentReviews()
});
