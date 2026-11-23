import { u as stringUtils } from '@5argon/arkham-string';
import { error } from '@sveltejs/kit';

import * as m from '$lib/paraglide/messages.js';
import { reviewProductHref } from '$lib/review/paths';
import { reviewCardCodes, reviewCardPage, reviewProducts } from '$lib/server/reviews';
import { productToExploreRoute } from '$lib/utility/product';
import { rewardRoute } from '$lib/utility/reward';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const page = reviewCardPage(params.code);
	if (page === undefined) error(404, 'Not found');
	const { product } = page.card;
	// A Reward card from outside the review products is only listed with the other Reward cards.
	const backParent = reviewProducts.includes(product)
		? {
				href: reviewProductHref(productToExploreRoute(product)),
				name: stringUtils.productName(product)
			}
		: {
				href: reviewProductHref(rewardRoute),
				name: m.common_reward_cards()
			};
	return { ...page, backName: page.card.name, backParent };
};

export const entries: EntryGenerator = () => reviewCardCodes().map((code) => ({ code }));
