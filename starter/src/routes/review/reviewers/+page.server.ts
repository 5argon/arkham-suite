import { reviewerSummaries } from '$lib/server/reviews';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ reviewers: reviewerSummaries() });
