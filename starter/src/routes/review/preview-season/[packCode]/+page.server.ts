import { u as stringUtils } from '@5argon/arkham-string';
import { error } from '@sveltejs/kit';

import * as m from '$lib/paraglide/messages.js';
import { previewSeasonGroups, previewSeasonSummaries } from '$lib/server/reviews';
import { productToExploreRoute } from '$lib/utility/product';

import type { EntryGenerator, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const summary = previewSeasonSummaries().find(
		({ product }) => productToExploreRoute(product) === params.packCode
	);
	if (summary === undefined) error(404, 'Not found');
	const { product } = summary;
	return {
		product,
		groups: previewSeasonGroups(product),
		backName: m.review_preview_season_of({ name: stringUtils.productName(product) })
	};
};

export const entries: EntryGenerator = () =>
	previewSeasonSummaries().map(({ product }) => ({ packCode: productToExploreRoute(product) }));
