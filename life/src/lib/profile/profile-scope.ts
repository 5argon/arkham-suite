/**
 * profile-scope.ts — the `/p/<…>` URL namespace's reserved words (client-safe).
 *
 * Every profile lives at `/p/<handle>/…`. A handle is normally a VANITY name (the
 * future public/hosted profile, e.g. `/p/my-name`), but two handles are RESERVED as
 * SCOPES that mean "an explicit subject id follows":
 *   - `/p/private/<uid>/…` — a managed subject rebuilt live from this browser's database.
 *   - `/p/loaded/<uid>/…`  — an externally opened `.ahlifepro`, rendered from its snapshot.
 * The vanity form is exactly one segment shallower (`/p/<vanity>/…`) but mounts the
 * identical "everything inside" subtree (see the `[[scope=profileScope]]/[handle]` route).
 *
 * This is the single source of truth for the reservation: the `profileScope` route
 * matcher consumes these as the optional scope, and vanity registration must reject
 * them (and is why a vanity can never be named `private` or `loaded`).
 */

export const PROFILE_SCOPES = ['private', 'loaded'] as const;
export type ProfileScope = (typeof PROFILE_SCOPES)[number];

/** Whether a URL segment is a reserved profile SCOPE (`private` / `loaded`). */
export function isProfileScope(s: string): s is ProfileScope {
	return (PROFILE_SCOPES as readonly string[]).includes(s);
}

/** Whether `handle` may NOT be used as a vanity name (reserved by the `/p/` namespace).
 *  Currently the two scopes; extend here if more reserved words appear. */
export function isReservedHandle(handle: string): boolean {
	return isProfileScope(handle);
}
