/**
 * Public entry for the local database layer.
 * Re-exports the document model, persistence seam, and the reactive store.
 */

export * from './document';
export * from './persistence';
export { IndexedDbAdapter } from './indexeddb-adapter';
export { DatabaseStore, databaseStore, type DatabaseStatus } from './database.svelte';
