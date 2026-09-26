/** Saving the Database (`.ahlifedb`) and compiled profiles (`.ahlifepro`). */
import type { CompiledProfileFile } from './compiled-profile';
import { rebakeManaged, toPlainDocument, type DatabaseDocument } from './document';
import { fileStem, saveArtifact, type FileFormat } from './file-format';
import { saveStatus } from './save-status.svelte';

/** The saved JSON: managed participants re-baked, derived cache dropped. */
export function serializeDatabase(doc: DatabaseDocument): string {
	const plain = toPlainDocument(doc);
	rebakeManaged(plain);
	return JSON.stringify(plain, null, 2);
}

/** Save the whole Database. A completed `.ahlifedb` save becomes the latest save. */
export async function saveDatabase(doc: DatabaseDocument, format: FileFormat): Promise<boolean> {
	const stem = fileStem('arkham-life', doc.owner.name);
	const saved = await saveArtifact('db', stem, serializeDatabase(doc), format);
	if (saved && format === 'gzip') saveStatus.recordSave(doc);
	return saved;
}

/** Save a stored value the app could not open, verbatim. */
export function saveUnreadableDatabase(value: unknown): Promise<boolean> {
	return saveArtifact(
		'db',
		fileStem('arkham-life', 'unreadable'),
		JSON.stringify(value, null, 2),
		'gzip'
	);
}

export function saveCompiledProfile(
	file: CompiledProfileFile,
	format: FileFormat
): Promise<boolean> {
	// Names repeat and change; the uid identifies the subject.
	const stem = fileStem('arkham-life', file.subject.name, `-${file.subject.uid}-compiled-profile`);
	return saveArtifact('profile', stem, JSON.stringify(file, null, 2), format);
}
