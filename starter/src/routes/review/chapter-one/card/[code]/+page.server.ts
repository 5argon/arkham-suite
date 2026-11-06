import { error } from '@sveltejs/kit';

import { chapterOneCardCodes, chapterOneCardPage } from '$lib/server/chapter-one-reviews';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const page = chapterOneCardPage(params.code);
	if (page === undefined) error(404, 'Not found');
	return { ...page, backName: page.card.name };
};

export const entries: EntryGenerator = () => chapterOneCardCodes().map((code) => ({ code }));
