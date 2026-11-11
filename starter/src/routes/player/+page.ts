import { browser } from '$app/env';
import type { Product } from '@5argon/arkham-kohaku';

import type { PageLoad } from './$types';

export const load: PageLoad<ExploreData> = ({ data }) => {
	let q = '';
	if (browser) {
		q = new URL(window.location.href).searchParams.get('q') ?? '';
	}
	const ret: ExploreData = {
		q: q,
		rotatingProducts: data.rotatingProducts,
		hasRewardCards: data.hasRewardCards
	};
	return ret;
};

export interface ExploreData {
	q: string;
	rotatingProducts: Product[];
	hasRewardCards: boolean;
}
