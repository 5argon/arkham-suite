import { u as stringUtils } from '@5argon/arkham-string';
import { error } from '@sveltejs/kit';

import {
	recentReviews,
	reviewProductCards,
	reviewProducts,
	reviewProductSummaries
} from '$lib/server/reviews';
import { productToExploreRoute } from '$lib/utility/product';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const product = reviewProducts.find((p) => productToExploreRoute(p) === params.packCode);
	if (product === undefined) error(404, 'Not found');
	const cards = reviewProductCards(product);
	if (cards.length === 0) error(404, 'Not found');
	return {
		product,
		cards,
		recents: recentReviews(product),
		backName: stringUtils.productName(product)
	};
};

export const entries: EntryGenerator = () =>
	reviewProductSummaries().map(({ product }) => ({ packCode: productToExploreRoute(product) }));
