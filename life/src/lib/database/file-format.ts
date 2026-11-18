/**
 * arkham.life files: gzip-compressed JSON under a per-kind extension, or plain `.json` for
 * inspection. Reading tells the two apart by the gzip magic bytes, not the file name.
 */
import * as pako from 'pako';

import * as m from '$lib/paraglide/messages.js';
import { saveBinaryFile, saveTextFile } from '$lib/save-file';

export type FileKind = 'db' | 'campaign' | 'profile';
export type FileFormat = 'gzip' | 'json';

export const FILE_EXTENSION: Record<FileKind, string> = {
	db: '.ahlifedb',
	campaign: '.ahlifecam',
	profile: '.ahlifepro'
};

function fileDescription(kind: FileKind): string {
	if (kind === 'db') return m.database_file_db();
	if (kind === 'campaign') return m.database_file_campaign();
	return m.database_file_profile();
}

export function gzipJsonText(text: string): Uint8Array<ArrayBuffer> {
	// pako types the result as Uint8Array<ArrayBufferLike>; it is always ArrayBuffer-backed.
	return pako.gzip(text) as Uint8Array<ArrayBuffer>;
}

/** A filesystem-safe fragment of a user-typed name. */
export function safeFileName(name: string): string {
	return name.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40) || 'untitled';
}

/** `<prefix>-<name><suffix>-<YYYY-MM-DD>`, without an extension. */
export function fileStem(prefix: string, name: string, suffix = ''): string {
	return `${prefix}-${safeFileName(name)}${suffix}-${new Date().toISOString().slice(0, 10)}`;
}

/** Offer `text` for saving; false when the user cancelled the dialog. */
export function saveArtifact(
	kind: FileKind,
	stem: string,
	text: string,
	format: FileFormat
): Promise<boolean> {
	const description = fileDescription(kind);
	if (format === 'json') {
		return saveTextFile({
			suggestedName: `${stem}.json`,
			text,
			extension: '.json',
			description: m.database_file_json({ description })
		});
	}
	const extension = FILE_EXTENSION[kind];
	return saveBinaryFile({
		suggestedName: stem + extension,
		data: gzipJsonText(text),
		mime: 'application/gzip',
		extension,
		description
	});
}

/** Parse a picked file, gzipped or plain JSON. Throws on an unreadable file. */
export async function readDataFile(file: File): Promise<unknown> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
	return JSON.parse(
		isGzip ? pako.ungzip(bytes, { toText: true }) : new TextDecoder().decode(bytes)
	);
}
