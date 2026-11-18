import { error } from '@sveltejs/kit';

import { cardByCode } from '$lib/tag-browser';

import type { PageLoad } from './$types';

// A page for every tag, compound tag, pack and card is too many to prerender, so these render in
// the browser.
export const prerender = false;
export const ssr = false;

export const load: PageLoad = ({ params }) => {
	const card = cardByCode(params.code);
	if (card === undefined) error(404, 'Not found');
	return { card, backName: card.name };
};
