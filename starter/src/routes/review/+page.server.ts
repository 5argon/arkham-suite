import { recentReviews, reviewProductSummaries, rewardReviewSummary } from '$lib/server/reviews';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	summaries: reviewProductSummaries(),
	reward: rewardReviewSummary(),
	recents: recentReviews()
});
