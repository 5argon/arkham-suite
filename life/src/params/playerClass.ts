import type { ParamMatcher } from '@sveltejs/kit';
import { resolveClassSlug } from '$lib/campaign/profile/profile-slugs';

/** The `[class]` segment under a profile's investigators page: a `CardClass` value. */
export const match = ((param) => resolveClassSlug(param) !== null) satisfies ParamMatcher;
