import { error } from '@sveltejs/kit';

import { allPrebuiltTeams, prebuiltTeam } from '$lib/server/prebuilt-teams';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const team = prebuiltTeam(params.slug);
	if (team === undefined) error(404, 'Not found');
	return { team };
};

export const entries: EntryGenerator = () =>
	allPrebuiltTeams().map((team) => ({ slug: team.slug }));
