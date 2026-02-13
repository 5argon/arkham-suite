import type { PageServerLoad } from './$types';
import {
	Product,
	productChapterOneInvestigatorExpansions,
	productCoreSets,
	productInvestigatorStarterDeck,
	productReturnTo
} from '@5argon/arkham-kohaku';
import { productToExploreRoute } from '$lib/utility/product';

export const load: PageServerLoad = async ({ params }) => {
	const urlPackCode = params.packCode;
	const supportedProducts: Product[] = [
		...productCoreSets,
		...productChapterOneInvestigatorExpansions,
		...productInvestigatorStarterDeck,
		...productReturnTo
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
		product: product
	};
};
