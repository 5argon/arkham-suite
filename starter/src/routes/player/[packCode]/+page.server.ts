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
import { productToExploreRoute } from '$lib/utility/product';

export const load: PageServerLoad = async ({ params }) => {
	const urlPackCode = params.packCode;
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
		backName: stringUtils.productName(product)
	};
};
