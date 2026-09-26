/**
 * Autosave history: gzipped copies of a record, taken when the editor is left and before a
 * destructive action, kept in their own IndexedDB store (never in the document or its exports).
 */
import pako from 'pako';
import type { CampaignRecord } from './document';
import { hasIndexedDb, openDb, SNAPSHOT_STORE, tx } from './idb';

export const SNAPSHOTS_PER_RECORD = 10;

export interface SnapshotMeta {
	id: string;
	campaignId: string;
	campaignTitle: string;
	/** ms since epoch. */
	takenAt: number;
	/** The record's `updatedAt` when taken; absent on older snapshots. */
	recordUpdatedAt?: number;
}

interface SnapshotRecord extends SnapshotMeta {
	/** gzipped JSON of the record. */
	gz: Uint8Array;
}

async function withDb<T>(run: (db: IDBDatabase) => Promise<T>): Promise<T> {
	const db = await openDb();
	try {
		return await run(db);
	} finally {
		db.close();
	}
}

/** A record's snapshots, newest first. */
async function snapshotsOf(db: IDBDatabase, campaignId: string): Promise<SnapshotRecord[]> {
	const all = await tx<SnapshotRecord[]>(db, SNAPSHOT_STORE, 'readonly', (s) => s.getAll());
	return all.filter((r) => r.campaignId === campaignId).sort((a, b) => b.takenAt - a.takenAt);
}

/** Store a snapshot unless the newest one already holds this version, then keep only the newest
 *  {@link SNAPSHOTS_PER_RECORD} of this record. */
export async function recordCampaignSnapshot(campaign: CampaignRecord): Promise<void> {
	if (!hasIndexedDb()) return;
	await withDb(async (db) => {
		const existing = await snapshotsOf(db, campaign.id);
		if (existing[0]?.recordUpdatedAt === campaign.updatedAt) return;
		const record: SnapshotRecord = {
			id: crypto.randomUUID(),
			campaignId: campaign.id,
			campaignTitle: campaign.title,
			takenAt: Date.now(),
			recordUpdatedAt: campaign.updatedAt,
			gz: pako.gzip(JSON.stringify(campaign))
		};
		await tx(db, SNAPSHOT_STORE, 'readwrite', (s) => s.put(record));
		for (const stale of existing.slice(SNAPSHOTS_PER_RECORD - 1)) {
			await tx(db, SNAPSHOT_STORE, 'readwrite', (s) => s.delete(stale.id));
		}
	});
}

export async function listSnapshotsFor(campaignId: string): Promise<SnapshotMeta[]> {
	if (!hasIndexedDb()) return [];
	return withDb(async (db) =>
		(await snapshotsOf(db, campaignId)).map(({ gz: _gz, ...meta }) => meta)
	);
}

/** The snapshotted record, or null when the snapshot is gone. */
export async function loadSnapshotCampaign(id: string): Promise<CampaignRecord | null> {
	if (!hasIndexedDb()) return null;
	return withDb(async (db) => {
		const rec = await tx<SnapshotRecord | undefined>(db, SNAPSHOT_STORE, 'readonly', (s) => s.get(id));
		return rec ? (JSON.parse(pako.ungzip(rec.gz, { to: 'string' })) as CampaignRecord) : null;
	});
}
