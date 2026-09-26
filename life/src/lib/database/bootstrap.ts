import { browser } from '$app/environment';

import { databaseStore } from './database.svelte';
import { IndexedDbAdapter } from './indexeddb-adapter';

let initPromise: Promise<void> | null = null;

/** Load the stored database into the store, once per session. No-op during SSR. */
export function ensureDatabaseLoaded(): Promise<void> {
	if (!browser) return Promise.resolve();
	initPromise ??= databaseStore.init(new IndexedDbAdapter());
	return initPromise;
}

/** Routes that stay reachable before a database exists. */
export const BOOTSTRAP_ROUTES = ['/new'];

/** Ask the browser not to evict this origin's storage under disk pressure (best-effort). */
export async function requestPersistentStorage(): Promise<boolean> {
	if (!browser || !navigator.storage?.persist) return false;
	if (await navigator.storage.persisted?.()) return true;
	return navigator.storage.persist();
}

export async function storageEstimate(): Promise<{
	usage: number;
	quota: number;
	persisted: boolean;
} | null> {
	if (!browser || !navigator.storage?.estimate) return null;
	const e = await navigator.storage.estimate();
	const persisted = (await navigator.storage.persisted?.()) ?? false;
	return { usage: e.usage ?? 0, quota: e.quota ?? 0, persisted };
}
