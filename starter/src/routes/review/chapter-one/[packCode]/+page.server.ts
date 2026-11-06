import { u as stringUtils } from '@5argon/arkham-string';
import { error } from '@sveltejs/kit';

import { chapterOneProductCards, chapterOneReviewProducts } from '$lib/server/chapter-one-reviews';
import { productToExploreRoute } from '$lib/utility/product';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const product = chapterOneReviewProducts().find(
		(candidate) => productToExploreRoute(candidate) === params.packCode
	);
	if (product === undefined) error(404, 'Not found');
	return {
		product,
		cards: chapterOneProductCards(product),
		backName: stringUtils.productName(product)
	};
};

export const entries: EntryGenerator = () =>
	chapterOneReviewProducts().map((product) => ({ packCode: productToExploreRoute(product) }));
