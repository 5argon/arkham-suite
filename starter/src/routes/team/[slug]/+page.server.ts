import { error } from '@sveltejs/kit';

import { hoverTextLinkedIn } from '$lib/server/card-text';
import { expandRuleDirectives } from '$lib/server/rules';
import { allPrebuiltTeams, prebuiltTeam } from '$lib/server/prebuilt-teams';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const team = prebuiltTeam(params.slug);
	if (team === undefined) error(404, 'Not found');
	const guideMd = expandRuleDirectives(team.guideMd);
	return { team: { ...team, guideMd }, mentionedText: hoverTextLinkedIn(guideMd) };
};

export const entries: EntryGenerator = () =>
	allPrebuiltTeams().map((team) => ({ slug: team.slug }));
