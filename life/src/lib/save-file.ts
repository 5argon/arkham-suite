/**
 * Save a file where the user picks: the native Save dialog (`showSaveFilePicker`, Chromium in a
 * secure context), else a plain download. Resolves false when the user cancelled the dialog.
 */

interface SaveFilePickerOptions {
	suggestedName?: string;
	types?: { description?: string; accept: Record<string, string[]> }[];
}
interface SaveFileHandle {
	createWritable(): Promise<{ write(data: string | Blob): Promise<void>; close(): Promise<void> }>;
}
type SaveFilePicker = (options?: SaveFilePickerOptions) => Promise<SaveFileHandle>;

async function saveBlob(opts: {
	suggestedName: string;
	blob: Blob;
	mime: string;
	extension: string;
	description: string;
}): Promise<boolean> {
	const { suggestedName, blob, mime, extension, description } = opts;

	const picker = (globalThis as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
	if (typeof picker === 'function') {
		try {
			const handle = await picker({ suggestedName, types: [{ description, accept: { [mime]: [extension] } }] });
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return true;
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') return false;
			// Any other failure (SecurityError, …) falls back to a download.
		}
	}

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = suggestedName;
	a.click();
	URL.revokeObjectURL(url);
	return true;
}

export async function saveTextFile(opts: {
	suggestedName: string;
	text: string;
	mime?: string;
	extension?: string;
	description?: string;
}): Promise<boolean> {
	const mime = opts.mime ?? 'application/json';
	return saveBlob({
		suggestedName: opts.suggestedName,
		blob: new Blob([opts.text], { type: mime }),
		mime,
		extension: opts.extension ?? '.json',
		description: opts.description ?? 'JSON file',
	});
}

export async function saveBinaryFile(opts: {
	suggestedName: string;
	data: Uint8Array<ArrayBuffer> | Blob;
	mime?: string;
	extension?: string;
	description?: string;
}): Promise<boolean> {
	const mime = opts.mime ?? 'application/octet-stream';
	const blob = opts.data instanceof Blob ? opts.data : new Blob([opts.data], { type: mime });
	return saveBlob({
		suggestedName: opts.suggestedName,
		blob,
		mime,
		extension: opts.extension ?? '',
		description: opts.description ?? 'File',
	});
}
