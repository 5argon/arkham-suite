/**
 * backup-file.ts — the on-disk container for an exported database/campaign.
 *
 * A backup is the user's pretty-printed `DatabaseDocument` (or single-campaign
 * share) JSON, gzip-compressed to raw bytes. The payload is hugely redundant
 * (repeated keys, card codes, and near-identical deck versions), so gzip shrinks
 * it ~5–10×. We use `pako` — already a dependency and the monorepo's compression
 * convention (see `kohaku/src/utility/deck/compress.ts`); unlike the deck-share
 * helpers we write raw bytes (no base64) since this rides in a file, not a URL.
 *
 * `readBackupFile` accepts the gzipped exports (`.ahlifedb` database backups,
 * `.ahlifecam` campaign shares) AND legacy `.arkhamlife` / uncompressed `.json`
 * exports, detected by the gzip magic bytes (not by name), so backups saved
 * before this change keep importing forever.
 */
import pako from 'pako';

/**
 * Extensions/descriptions for the "Save As" dialog and file picker. All gzipped
 * downloads share one MIME; each data type carries its own extension so the user
 * (and the OS) can tell a whole-database backup, a single campaign, and a compiled
 * profile apart. Import detects format by content, so the rename is safe.
 */
export const BACKUP_MIME = 'application/gzip';
/** Whole-database backup (was `.arkhamlife`). */
export const DB_BACKUP_EXTENSION = '.ahlifedb';
export const DB_BACKUP_FILE_DESCRIPTION = 'arkham.life database backup';
/** Single-campaign share file (was `.arkhamlife`). */
export const CAMPAIGN_SHARE_EXTENSION = '.ahlifecam';
export const CAMPAIGN_SHARE_FILE_DESCRIPTION = 'arkham.life campaign';
/** Compiled (render-ready) profile for one subject. */
export const COMPILED_PROFILE_EXTENSION = '.ahlifepro';
export const COMPILED_PROFILE_FILE_DESCRIPTION = 'arkham.life compiled profile';

/** gzip a JSON string to raw bytes for download. */
export function gzipJsonText(text: string): Uint8Array<ArrayBuffer> {
	// pako's types widen to Uint8Array<ArrayBufferLike>; at runtime it's always a
	// plain ArrayBuffer-backed array, so narrow it to satisfy the Blob/File APIs.
	return pako.gzip(text) as Uint8Array<ArrayBuffer>;
}

/**
 * Read an imported backup file into a parsed value. Handles both gzipped backups
 * and legacy plain-JSON exports (the gzip magic bytes `1f 8b` tell them apart),
 * then `JSON.parse`s. Throws on a corrupt/unreadable file — callers catch it.
 */
export async function readBackupFile(file: File): Promise<unknown> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
	const text = isGzip ? pako.ungzip(bytes, { to: 'string' }) : new TextDecoder().decode(bytes);
	return JSON.parse(text);
}
