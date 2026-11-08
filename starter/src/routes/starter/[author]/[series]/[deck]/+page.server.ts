import { error } from '@sveltejs/kit';

import { hoverTextLinkedIn } from '$lib/server/card-text';
import { expandRuleDirectives } from '$lib/server/rules';
import { starterDeck } from '$lib/starter-content';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const entry = starterDeck(params.author, params.series, params.deck);
	if (entry === undefined) error(404, 'Not found');
	// Every version shares the one guide.
	const guide = entry.primary.description_md ?? '';
	const expanded = expandRuleDirectives(guide);
	return {
		// The guide with its rule quotes written out, only when it has any.
		guideMd: expanded === guide ? undefined : expanded,
		mentionedText: hoverTextLinkedIn(entry.introMd, expanded)
	};
};
