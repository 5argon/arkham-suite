import type { PageServerLoad } from './$types';
import {
	Product,
	productChapterOneInvestigatorExpansions,
	productChapterTwoInvestigatorExpansions,
	productCoreSetsChapterOne,
	productCoreSetsChapterTwo,
	productDeckbuildingExpansions,
	productInvestigatorDeck,
	productInvestigatorStarterDeck,
	productOther,
	productReturnTo
} from '@5argon/arkham-kohaku';
import { u as stringUtils } from '@5argon/arkham-string';
import { chapterOneReviewProducts } from '$lib/server/chapter-one-reviews';
import * as m from '$lib/paraglide/messages.js';
import { productToExploreRoute } from '$lib/utility/product';
import { rewardRoute } from '$lib/utility/reward';

export const load: PageServerLoad = async ({ params }) => {
	const urlPackCode = params.packCode;
	if (urlPackCode === rewardRoute) {
		return {
			product: undefined,
			hasChapterOneReviews: false,
			backName: m.common_reward_cards()
		};
	}
	const supportedProducts: Product[] = [
		...productCoreSetsChapterOne,
		...productCoreSetsChapterTwo,
		...productChapterOneInvestigatorExpansions,
		...productInvestigatorStarterDeck,
		...productInvestigatorDeck,
		...productDeckbuildingExpansions,
		...productChapterTwoInvestigatorExpansions,
		...productReturnTo,
		...productOther
	];
	const routeToProductMap: Map<string, Product> = new Map();
	supportedProducts.forEach((product) => {
		const route = productToExploreRoute(product);
		routeToProductMap.set(route, product);
	});
	const product = routeToProductMap.get(urlPackCode);
	if (!product) {
		throw new Error(`Unknown product for pack code: ${urlPackCode}`);
	}
	return {
		product: product,
		hasChapterOneReviews: chapterOneReviewProducts().includes(product),
		backName: stringUtils.productName(product)
	};
};
