import type { ParamMatcher } from '@sveltejs/kit';
import { resolveClassSlug } from '$lib/campaign/profile/profile-slugs';

/** `[class]` segment under a profile's cards / investigators pages — a `CardClass`
 *  value (guardian/seeker/…). Gating here 404s an unknown class before the page loads,
 *  with the `CardClass` enum as the single source of validity. */
export const match = ((param) => resolveClassSlug(param) !== null) satisfies ParamMatcher;
