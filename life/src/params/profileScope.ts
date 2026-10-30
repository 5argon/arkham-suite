import { isProfileScope } from '$lib/profile/profile-scope';

/** The optional scope of `/p/[[scope=profileScope]]/[handle]/…`: only the reserved words, so any
 *  other first segment is left to `[handle]` as a vanity name. */
export const match = ((param: string): boolean => isProfileScope(param));
