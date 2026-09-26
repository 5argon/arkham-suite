import { zipSync } from 'fflate';

import { saveBinaryFile } from '$lib/save-file';

import { campaignShareEntryName, serializeCampaignShare } from './campaign-share';
import type { DatabaseDocument } from './document';
import { FILE_EXTENSION, fileStem, gzipJsonText } from './file-format';

/**
 * Save the given records (campaigns or standalones) as one `.zip` of gzipped `.ahlifecam` files.
 * `suffix` tags the file name (e.g. `-campaigns`); `description` labels the save dialog.
 */
export async function downloadSharesZip(
	doc: DatabaseDocument,
	ids: Iterable<string>,
	suffix: string,
	description: string
): Promise<void> {
	const ext = FILE_EXTENSION.campaign;
	const files: Record<string, Uint8Array> = {};
	for (const id of ids) {
		const json = serializeCampaignShare(doc, id);
		if (!json) continue;
		const base = campaignShareEntryName(doc, id);
		let name = base;
		for (let i = 2; name in files; i++) name = `${base.slice(0, -ext.length)}-${i}${ext}`;
		files[name] = gzipJsonText(json);
	}
	if (Object.keys(files).length === 0) return;
	// Entries are already gzipped, so the zip only stores them.
	const zipped = zipSync(files, { level: 0 });
	await saveBinaryFile({
		suggestedName: `${fileStem('arkham-life', doc.owner.name, suffix)}.zip`,
		data: new Blob([zipped], { type: 'application/zip' }),
		mime: 'application/zip',
		extension: '.zip',
		description
	});
}
