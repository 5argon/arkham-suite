import { error } from '@sveltejs/kit';

import { reviewCardCodes, reviewCardPage } from '$lib/server/reviews';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const page = reviewCardPage(params.code);
	if (page === undefined) error(404, 'Not found');
	return { ...page, backName: page.card.name };
};

export const entries: EntryGenerator = () => reviewCardCodes().map((code) => ({ code }));
