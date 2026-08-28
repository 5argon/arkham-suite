import { error } from '@sveltejs/kit';

import { allPrebuiltTeams, prebuiltTeam } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const team = prebuiltTeam(params.slug);
	if (team === undefined) error(404, 'Not found');
	return { team };
};

export const entries: EntryGenerator = () =>
	allPrebuiltTeams().map((team) => ({ slug: team.slug }));
