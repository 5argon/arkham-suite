/**
 * snapshots.ts — invisible per-campaign autosave snapshots.
 *
 * A safety net separate from the live document: whenever the user leaves/closes the
 * campaign editor we stash a gzipped copy of that campaign here. It's a GLOBAL ring
 * buffer of the {@link SNAPSHOT_LIMIT} most-recent snapshots across ALL campaigns, so
 * it can't grow without bound. Snapshots live in their own IndexedDB store (not in the
 * `DatabaseDocument`), so they never bloat the document write path or the exports.
 */

import pako from 'pako';

import type { CampaignRecord } from './document';
import { hasIndexedDb, openDb, SNAPSHOT_STORE } from './indexeddb-adapter';

/** Shared across all campaigns. */
export const SNAPSHOT_LIMIT = 20;

/** Listing shape (everything but the heavy gzipped payload). */
export interface SnapshotMeta {
	id: string;
	campaignId: string;
	campaignTitle: string;
	/** ms-since-epoch when the snapshot was taken. */
	takenAt: number;
}

interface SnapshotRecord extends SnapshotMeta {
	/** gzipped JSON of the `CampaignRecord`. */
	gz: Uint8Array;
}

function snapTx<T>(
	db: IDBDatabase,
	mode: IDBTransactionMode,
	run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	return new Promise((resolve, reject) => {
		const t = db.transaction(SNAPSHOT_STORE, mode);
		const req = run(t.objectStore(SNAPSHOT_STORE));
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
		t.onabort = () => reject(t.error);
	});
}

/** Stash a gzipped snapshot of one campaign, then prune to the global limit. */
export async function recordCampaignSnapshot(campaign: CampaignRecord): Promise<void> {
	if (!hasIndexedDb()) return;
	const record: SnapshotRecord = {
		id: crypto.randomUUID(),
		campaignId: campaign.id,
		campaignTitle: campaign.title,
		takenAt: Date.now(),
		gz: pako.gzip(JSON.stringify(campaign))
	};
	const db = await openDb();
	try {
		await snapTx(db, 'readwrite', (s) => s.put(record));
		await pruneToLimit(db);
	} finally {
		db.close();
	}
}

/** Snapshots for one campaign, newest first (metadata only). */
export async function listSnapshotsFor(campaignId: string): Promise<SnapshotMeta[]> {
	if (!hasIndexedDb()) return [];
	const db = await openDb();
	try {
		const all = await snapTx<SnapshotRecord[]>(db, 'readonly', (s) => s.getAll());
		return all
			.filter((r) => r.campaignId === campaignId)
			.map((r) => ({
				id: r.id,
				campaignId: r.campaignId,
				campaignTitle: r.campaignTitle,
				takenAt: r.takenAt
			}))
			.sort((a, b) => b.takenAt - a.takenAt);
	} finally {
		db.close();
	}
}

/** Decode a snapshot back into a `CampaignRecord` (null if it's gone). */
export async function loadSnapshotCampaign(id: string): Promise<CampaignRecord | null> {
	if (!hasIndexedDb()) return null;
	const db = await openDb();
	try {
		const rec = await snapTx<SnapshotRecord | undefined>(db, 'readonly', (s) => s.get(id));
		if (!rec) return null;
		return JSON.parse(pako.ungzip(rec.gz, { to: 'string' })) as CampaignRecord;
	} finally {
		db.close();
	}
}

/** Keep only the newest {@link SNAPSHOT_LIMIT} snapshots across all campaigns. */
async function pruneToLimit(db: IDBDatabase): Promise<void> {
	const all = await snapTx<SnapshotRecord[]>(db, 'readonly', (s) => s.getAll());
	if (all.length <= SNAPSHOT_LIMIT) return;
	const stale = [...all].sort((a, b) => b.takenAt - a.takenAt).slice(SNAPSHOT_LIMIT);
	for (const r of stale) {
		await snapTx(db, 'readwrite', (s) => s.delete(r.id));
	}
}
