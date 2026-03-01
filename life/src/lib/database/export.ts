/**
 * export.ts — download the whole database as a compressed backup file the user
 * keeps themselves.
 *
 * This is the local build's "save file": the same `DatabaseDocument` shape that the
 * bootstrap "Open database file" flow reads back, gzip-compressed (see
 * backup-file.ts). A successful download is the user's real backup, so it records
 * a backup checkpoint (see backup-status.ts), which clears the "you haven't
 * backed up" banner. Managed participants are re-baked from the roster first so
 * the file carries current names/portraits.
 */
import { saveBinaryFile, saveTextFile } from '$lib/save-file';

import {
	BACKUP_MIME,
	COMPILED_PROFILE_EXTENSION,
	COMPILED_PROFILE_FILE_DESCRIPTION,
	DB_BACKUP_EXTENSION,
	DB_BACKUP_FILE_DESCRIPTION,
	gzipJsonText,
} from './backup-file';
import { recordBackup } from './backup-status';
import { rebakeManaged, type DatabaseDocument } from './document';
import { makeCompiledProfileFile } from './compiled-profile';
import type { LocalProfilePayload } from './profile-local';
import type { ProfileSubject } from '$lib/profile/profile-types';

/** Pretty-printed JSON of the whole database, with managed participants re-baked.
 *  The derived profile cache is dropped — it bloats the file, can go stale across
 *  app versions, and is cheaply recomputed once on import. */
export function serializeDatabase(doc: DatabaseDocument): string {
	// JSON round-trip (not structuredClone) so a Svelte $state proxy is handled.
	const clone = JSON.parse(JSON.stringify(doc)) as DatabaseDocument;
	delete clone.profileCache;
	rebakeManaged(clone);
	return JSON.stringify(clone, null, 2);
}

/** A friendly, filesystem-safe filename stem like `arkham-life-Keeper-2026-06-21`.
 *  `name` is whoever the file is about — the database owner, or a profile subject. */
export function fileStem(name: string, suffix = ''): string {
	const date = new Date().toISOString().slice(0, 10);
	const safe = name.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 32) || 'database';
	return `arkham-life-${safe}${suffix}-${date}`;
}

/** A friendly, filesystem-safe filename like `arkham-life-Keeper-2026-06-21.ahlifedb`. */
export function databaseFileName(doc: DatabaseDocument): string {
	return `${fileStem(doc.owner.name)}${DB_BACKUP_EXTENSION}`;
}

/**
 * Save the whole campaign database to a user-chosen file (native "Save As" dialog
 * where supported), gzip-compressed. Records the backup checkpoint only if the
 * user actually saved.
 */
export async function downloadDatabase(doc: DatabaseDocument): Promise<void> {
	const saved = await saveBinaryFile({
		suggestedName: databaseFileName(doc),
		data: gzipJsonText(serializeDatabase(doc)),
		mime: BACKUP_MIME,
		extension: DB_BACKUP_EXTENSION,
		description: DB_BACKUP_FILE_DESCRIPTION,
	});
	if (saved) recordBackup(doc);
}

/**
 * Advanced/inspection export: the raw database as plain (uncompressed, pretty)
 * JSON — the same `serializeDatabase` content as the compressed backup, just
 * human-readable. NOT a backup checkpoint (the compressed export is canonical).
 */
export async function downloadDatabaseJson(doc: DatabaseDocument): Promise<void> {
	await saveTextFile({
		suggestedName: `${fileStem(doc.owner.name)}.json`,
		text: serializeDatabase(doc),
		extension: '.json',
		description: 'arkham.life database (JSON)',
	});
}

/**
 * Export ONE subject's "compiled profile" — the precomputed, render-ready profile
 * artifact (re-derivable English stripped; keys/ids/numbers/states + user data,
 * JSON-pure). `gzip` writes a compact `.ahlifepro` (compact, hostable for a future
 * `?cp=` viewer); `json` writes the same envelope as plain pretty JSON for
 * inspection. NOT a backup — never records a backup checkpoint.
 */
export async function downloadCompiledProfile(
	subject: ProfileSubject,
	payload: LocalProfilePayload,
	format: 'gzip' | 'json',
): Promise<void> {
	const file = makeCompiledProfileFile(subject, payload, new Date().toISOString());
	const text = JSON.stringify(file, null, 2);
	// One .ahlifepro is exactly one subject. The name is for humans, but include the
	// stable UID by default — names can repeat or change; the UID identifies the subject.
	const stem = fileStem(subject.name, `-${subject.uid}-compiled-profile`);
	if (format === 'gzip') {
		await saveBinaryFile({
			suggestedName: `${stem}${COMPILED_PROFILE_EXTENSION}`,
			data: gzipJsonText(text),
			mime: BACKUP_MIME,
			extension: COMPILED_PROFILE_EXTENSION,
			description: COMPILED_PROFILE_FILE_DESCRIPTION,
		});
	} else {
		await saveTextFile({
			suggestedName: `${stem}.json`,
			text,
			extension: '.json',
			description: 'arkham.life compiled profile (JSON)',
		});
	}
}
