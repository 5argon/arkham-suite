import { u as stringUtils } from '@5argon/arkham-string';
import { error } from '@sveltejs/kit';

import * as m from '$lib/paraglide/messages.js';
import {
	recentReviews,
	reviewProductCards,
	reviewProducts,
	reviewProductSummaries,
	rewardReviewCards,
	rewardReviewSummary
} from '$lib/server/reviews';
import { productToExploreRoute } from '$lib/utility/product';
import { rewardRoute } from '$lib/utility/reward';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	if (params.packCode === rewardRoute) {
		const cards = rewardReviewCards();
		if (cards.length === 0) error(404, 'Not found');
		return {
			product: undefined,
			cards,
			recents: recentReviews(rewardRoute),
			backName: m.common_reward_cards()
		};
	}
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

export const entries: EntryGenerator = () => [
	...reviewProductSummaries().map(({ product }) => ({ packCode: productToExploreRoute(product) })),
	...(rewardReviewSummary() === undefined ? [] : [{ packCode: rewardRoute }])
];
