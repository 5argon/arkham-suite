import type { ParamMatcher } from '@sveltejs/kit';
import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
import { resolveClassSlug } from '$lib/campaign/profile/profile-slugs';

/** The `[section]` segment under a profile's `cards/` page: a card sub-page slug (`CARD_SUBPAGES`)
 *  or a `CardClass`, so one route serves both. */
export const match = ((param) =>
	resolveCardSubpageSlug(param) !== null ||
	resolveClassSlug(param) !== null) satisfies ParamMatcher;
