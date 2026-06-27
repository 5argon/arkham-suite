import type { ParamMatcher } from '@sveltejs/kit';
import { isProfileScope } from '$lib/profile/profile-scope';

/**
 * The OPTIONAL scope segment of `/p/[[scope=profileScope]]/[handle]/…`. It matches
 * ONLY the reserved scope words `private` / `loaded`; any other first segment is left
 * for `[handle]` to consume as a vanity name (so `/p/my-name/…` works one level
 * shallower than `/p/private/<uid>/…`, sharing the same subtree). Reserved words live
 * in {@link isProfileScope}.
 */
export const match = ((param) => isProfileScope(param)) satisfies ParamMatcher;
