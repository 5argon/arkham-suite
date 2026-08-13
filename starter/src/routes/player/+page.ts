import { browser } from '$app/environment';

import type { PageLoad } from './$types';

// `/player` takes no route params, so the generic `Load<ExploreParam, ...>` did not
// match the params type SvelteKit generates for this route. `PageLoad` carries them.
export const load: PageLoad = () => {
	let q = '';
	if (browser) {
		q = new URL(window.location.href).searchParams.get('q') ?? '';
	}
	const ret: ExploreData = {
		q: q
	};
	return ret;
};

export interface ExploreParam {
	q: string;

	[s: string]: string;
}

export interface ExploreInputData {
	[s: string]: string;
}

export interface ExploreParentData {
	[s: string]: string;
}

export interface ExploreData {
	q: string;

	[s: string]: string;
}
