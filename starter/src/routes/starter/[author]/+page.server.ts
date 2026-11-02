import { prebuiltTeamSummariesOf } from '$lib/server/prebuilt-teams';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => ({
	teams: prebuiltTeamSummariesOf(params.author)
});
