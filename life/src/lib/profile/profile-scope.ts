/**
 * Profiles live at `/p/<vanity>/…`, or under a reserved scope followed by a subject id:
 * `/p/private/<uid>/…` (rebuilt live from this browser's database) and `/p/loaded/<uid>/…`
 * (an opened `.ahlifepro` snapshot). Both forms mount the same subtree.
 */

export const PROFILE_SCOPES = ['private', 'loaded'] as const;
export type ProfileScope = (typeof PROFILE_SCOPES)[number];

export function isProfileScope(s: string): s is ProfileScope {
	return (PROFILE_SCOPES as readonly string[]).includes(s);
}

/** A vanity name may not be a scope word. */
export function isReservedHandle(handle: string): boolean {
	return isProfileScope(handle);
}
