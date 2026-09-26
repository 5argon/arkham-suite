/** The app's IndexedDB database: the live document plus the campaign snapshot ring buffer. */
const DB_NAME = 'arkham-life-database';
const DB_VERSION = 2;
export const DOCUMENT_STORE = 'documents';
export const SNAPSHOT_STORE = 'snapshots';

/** False during a prerender pass in Node. */
export function hasIndexedDb(): boolean {
	return typeof indexedDB !== 'undefined';
}

export function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(DOCUMENT_STORE)) db.createObjectStore(DOCUMENT_STORE);
			if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
				db.createObjectStore(SNAPSHOT_STORE, { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

/** Run one request in its own transaction on `store`. */
export function tx<T>(
	db: IDBDatabase,
	store: string,
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	return new Promise((resolve, reject) => {
		const t = db.transaction(store, mode);
		const req = run(t.objectStore(store));
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
		t.onabort = () => reject(t.error);
	});
}
