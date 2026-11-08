import { error } from '@sveltejs/kit';

import { hoverTextLinkedIn } from '$lib/server/card-text';
import { starterDeck } from '$lib/starter-content';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const entry = starterDeck(params.author, params.series, params.deck);
	if (entry === undefined) error(404, 'Not found');
	return {
		mentionedText: hoverTextLinkedIn(
			entry.introMd,
			...entry.versions.map((version) => version.deck.description_md)
		)
	};
};
