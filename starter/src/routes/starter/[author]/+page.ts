import { error, redirect } from '@sveltejs/kit';

import { allContributors, contributor, contributorHref } from '$lib/starter-content';

import type { EntryGenerator, PageLoad } from './$types';

/**
 * Where someone's page used to be, kept working for links already out there.
 */
export const load: PageLoad = ({ params }) => {
	const person = contributor(params.author);
	if (person === undefined) error(404, 'Not found');
	redirect(308, contributorHref(person));
};

export const entries: EntryGenerator = () =>
	allContributors().map((person) => ({ author: person.slug }));
