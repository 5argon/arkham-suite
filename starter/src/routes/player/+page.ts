import { browser } from '$app/env';

import type { PageLoad } from './$types';

export const load: PageLoad<ExploreData> = () => {
	let q = '';
	if (browser) {
		q = new URL(window.location.href).searchParams.get('q') ?? '';
	}
	const ret: ExploreData = {
		q: q
	};
	return ret;
};

export interface ExploreData {
	q: string;

	[s: string]: string;
}
