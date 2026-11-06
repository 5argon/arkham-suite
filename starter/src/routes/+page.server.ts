import { writtenReviewRows } from '$lib/server/reviews';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	reviews: writtenReviewRows()
});
