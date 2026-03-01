import type { PageLoad } from './$types';

// Whole-database backup is a local-build concept. Its import/export is
// campaign-level under /archive.
export const ssr = false;

export const load: PageLoad = async () => {
	return {};
};
