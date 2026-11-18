import { resolveClassSlug } from '$lib/campaign/profile/profile-slugs';

/** The `[class]` segment under a profile's investigators page: a `CardClass` value. */
export const match = ((param: string): boolean => resolveClassSlug(param) !== null);
