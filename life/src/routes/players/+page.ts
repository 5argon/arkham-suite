import type { PageLoad } from './$types';

// Managing players (owner + others + UIDs) is a local-build concept.
export const ssr = false;

export const load: PageLoad = async () => {
	return {};
};
