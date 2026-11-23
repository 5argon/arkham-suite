import { u as stringUtils } from '@5argon/arkham-string';
import { error } from '@sveltejs/kit';

import { chapterOneCardCodes, chapterOneCardPage } from '$lib/server/chapter-one-reviews';
import { chapterOneProductHref } from '$lib/review/paths';
import { productToExploreRoute } from '$lib/utility/product';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const page = chapterOneCardPage(params.code);
	if (page === undefined) error(404, 'Not found');
	const { product } = page.card;
	return {
		...page,
		backName: page.card.name,
		backParent: {
			href: chapterOneProductHref(productToExploreRoute(product)),
			name: stringUtils.productName(product)
		}
	};
};

export const entries: EntryGenerator = () => chapterOneCardCodes().map((code) => ({ code }));
