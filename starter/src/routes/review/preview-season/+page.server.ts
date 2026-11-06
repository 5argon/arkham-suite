import { previewSeasonSummaries } from '$lib/server/reviews';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ summaries: previewSeasonSummaries() });
