/**
 * indexeddb-adapter.ts — the default, always-on persistence backend.
 *
 * Stores the `DatabaseDocument` (minus the derived profile cache) under a single
 * key in one object store.
 * IndexedDB (unlike localStorage's ~5 MB cap) comfortably holds a lifetime of
 * deck-upgrade history. This is the crash-safe working copy; the user's real
 * backup is the exported / file-system-backed copy.
 *
 * Uses the raw IndexedDB API (no extra dependency). All methods no-op gracefully
 * when IndexedDB is unavailable (e.g. during a prerender pass in Node), returning
 * null / resolving without persisting.
 */

import type { DatabaseDocument } from './document';
import type { AdapterCapabilities, PersistenceAdapter } from './persistence';

const DB_NAME = 'arkham-life-database';
const DB_VERSION = 2;
const STORE = 'documents';
/** Single-document store: the active database lives under this fixed key. */
const DOC_KEY = 'current';
/** Per-campaign autosave snapshots — a global ring buffer keyed by `id` (see snapshots.ts). */
export const SNAPSHOT_STORE = 'snapshots';

export function hasIndexedDb(): boolean {
	return typeof indexedDB !== 'undefined';
}

/** Open (and migrate) the shared app database. Exported so snapshots.ts uses the
 *  same connection/version rather than racing a second `open` at a different version. */
export function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
			if (!db.objectStoreNames.contains(SNAPSHOT_STORE))
				db.createObjectStore(SNAPSHOT_STORE, { keyPath: 'id' });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

function tx<T>(
	db: IDBDatabase,
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE, mode);
		const req = run(transaction.objectStore(STORE));
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

export class IndexedDbAdapter implements PersistenceAdapter {
	readonly capabilities: AdapterCapabilities = { kind: 'indexeddb', backedByFile: false };

	async load(): Promise<DatabaseDocument | null> {
		if (!hasIndexedDb()) return null;
		const db = await openDb();
		try {
			const value = await tx<DatabaseDocument | undefined>(db, 'readonly', (s) => s.get(DOC_KEY));
			return value ?? null;
		} finally {
			db.close();
		}
	}

	async save(doc: DatabaseDocument): Promise<void> {
		if (!hasIndexedDb()) return;
		const db = await openDb();
		try {
			// The in-memory doc is a Svelte $state proxy, which IndexedDB's structured
			// clone can't handle (DataCloneError). The document is pure JSON (dates are
			// stored as ms numbers), so a JSON round-trip is a lossless, proxy-safe copy.
			const plain = JSON.parse(JSON.stringify(doc)) as DatabaseDocument;
			// The derived profile cache is NOT persisted: it bloats every write and, since
			// the whole doc is rewritten to one key on each edit, its churn dominated
			// on-disk usage (LevelDB keeps overwritten bytes until compaction). It is cheap
			// to recompute on load, so it stays in memory only — like the export already does.
			delete plain.profileCache;
			await tx(db, 'readwrite', (s) => s.put(plain, DOC_KEY));
		} finally {
			db.close();
		}
	}

	/** Remove the stored database (used by "start over" / reset flows). */
	async clear(): Promise<void> {
		if (!hasIndexedDb()) return;
		const db = await openDb();
		try {
			await tx(db, 'readwrite', (s) => s.delete(DOC_KEY));
		} finally {
			db.close();
		}
	}
}
