import { allPrebuiltTeamSummaries } from '$lib/server/prebuilt-teams';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ teams: allPrebuiltTeamSummaries() });
