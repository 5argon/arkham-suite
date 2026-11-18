import { compoundTagName, type CompoundTagType } from '@5argon/arkham-tags';

import type { PageLoad } from './$types';

// A page for every tag, compound tag, pack and card is too many to prerender, so these render in
// the browser.
export const prerender = false;
export const ssr = false;

export const load: PageLoad = ({ params }) => {
	const type = params.compound as CompoundTagType;
	return { type, backName: compoundTagName(type) };
};
