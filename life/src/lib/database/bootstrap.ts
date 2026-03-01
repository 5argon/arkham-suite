/**
 * bootstrap.ts — client-side database initialization.
 *
 * Loads the stored database from IndexedDB into the singleton store exactly once.
 * Browser-only (IndexedDB doesn't exist during SSR) and idempotent, so it is safe
 * to call from the root layout on every mount / navigation.
 */
import { browser } from '$app/environment';

import { databaseStore } from './database.svelte';
import { IndexedDbAdapter } from './indexeddb-adapter';

let initPromise: Promise<void> | null = null;

/** Ensure the database store is attached to IndexedDB and hydrated. */
export function ensureDatabaseLoaded(): Promise<void> {
	if (!browser) return Promise.resolve();
	if (!initPromise) initPromise = databaseStore.init(new IndexedDbAdapter());
	return initPromise;
}

/** Routes that must remain reachable before a campaign database exists. */
export const BOOTSTRAP_ROUTES = ['/new'];

/**
 * Ask the browser to keep this origin's storage durable, so the database in
 * IndexedDB isn't evicted under disk pressure. Best-effort; resolves to whether
 * storage is now persisted. (The user's real backup is still the exported file.)
 */
export async function requestPersistentStorage(): Promise<boolean> {
	if (!browser || !navigator.storage?.persist) return false;
	if (await navigator.storage.persisted?.()) return true;
	return navigator.storage.persist();
}

/** Current IndexedDB usage / quota for display, or null when unsupported. */
export async function storageEstimate(): Promise<{ usage: number; quota: number; persisted: boolean } | null> {
	if (!browser || !navigator.storage?.estimate) return null;
	const e = await navigator.storage.estimate();
	const persisted = (await navigator.storage.persisted?.()) ?? false;
	return { usage: e.usage ?? 0, quota: e.quota ?? 0, persisted };
}
