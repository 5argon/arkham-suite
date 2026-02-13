import type { Load } from '@sveltejs/kit';

import { browser } from '$app/environment';

export const load: Load<ExploreParam, ExploreInputData, ExploreParentData, ExploreData> = () => {
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
