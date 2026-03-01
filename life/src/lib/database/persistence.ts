/**
 * persistence.ts — the storage seam.
 *
 * A `PersistenceAdapter` is the only boundary between the in-memory database store
 * and where the bytes actually live. Implementations:
 *   - IndexedDbAdapter  — always-on working copy / crash-safe autosave (default).
 *   - FileSystemAdapter — a real file on disk via the File System Access API
 *                         (Chromium desktop); falls back to download/upload.
 *
 * The whole document is loaded/saved as one unit. It is small (a lifetime of
 * campaigns is tens of MB at most), so per-entity persistence is unnecessary; the
 * file model is whole-document anyway.
 */

import type { DatabaseDocument } from './document';

export interface AdapterCapabilities {
	/** Which backend this adapter talks to. */
	kind: 'indexeddb' | 'filesystem';
	/**
	 * True when the document is backed by a user-visible file on disk that the
	 * user safekeeps directly (FileSystemAdapter). IndexedDB is durable but
	 * browser-managed, so this is false there.
	 */
	backedByFile: boolean;
}

export interface PersistenceAdapter {
	readonly capabilities: AdapterCapabilities;
	/** Returns the stored document, or null if nothing has been saved yet. */
	load(): Promise<DatabaseDocument | null>;
	/** Persist the whole document. */
	save(doc: DatabaseDocument): Promise<void>;
	/** Permanently remove the stored document (the "delete database" flow). */
	clear?(): Promise<void>;
}
