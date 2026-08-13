import type { PageLoad } from './$types';

// Server-side data loading only - no client-side loading needed
export const load: PageLoad = async ({ data }) => {
	return data;
};
