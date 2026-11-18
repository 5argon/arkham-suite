import { toPlainDocument, type DatabaseDocument } from './document';
import { DOCUMENT_STORE, hasIndexedDb, openDb, tx } from './idb';
import type { PersistenceAdapter } from './persistence';

/** The active document lives under this one key. */
const DOC_KEY = 'current';

/** One request on the document store; a no-op resolving `undefined` without IndexedDB. */
async function request<T>(
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> {
	if (!hasIndexedDb()) return undefined;
	const db = await openDb();
	try {
		return await tx(db, DOCUMENT_STORE, mode, run);
	} finally {
		db.close();
	}
}

export class IndexedDbAdapter implements PersistenceAdapter {
	async load(): Promise<unknown> {
		return (await request('readonly', (s) => s.get(DOC_KEY))) ?? null;
	}

	async save(doc: DatabaseDocument): Promise<void> {
		await request('readwrite', (s) => s.put(toPlainDocument(doc), DOC_KEY));
	}

	async clear(): Promise<void> {
		await request('readwrite', (s) => s.delete(DOC_KEY));
	}
}
