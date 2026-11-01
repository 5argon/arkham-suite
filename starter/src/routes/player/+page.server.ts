import { productChapterTwoInvestigatorExpansions, productDeckbuildingExpansions } from '@5argon/arkham-kohaku';

import { getAllCards } from '$lib/card-data';

import type { PageServerLoad } from './$types';

/**
 * Evaluated when building the site, so this page lists what has cards to show without bringing the
 * whole card data along.
 */
export const load: PageServerLoad = () => {
	const available = new Set(getAllCards().map((card) => card.product));
	return {
		rotatingProducts: [
			...productChapterTwoInvestigatorExpansions,
			...productDeckbuildingExpansions
		].filter((product) => available.has(product))
	};
};
