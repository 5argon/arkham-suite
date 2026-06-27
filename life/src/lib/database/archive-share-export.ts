/**
 * archive-share-export.ts — bulk "export these records as a zip of share files",
 * shared by the Campaign Archive and Standalone Archive lists. Each id is bundled
 * as its own gzipped `.ahlifecam` inside one outer `.zip`. Works for BOTH campaign
 * and standalone ids, since the share layer resolves either array (findRecord).
 */
import { zipSync } from 'fflate';
import { saveBinaryFile } from '$lib/save-file';
import { campaignShareEntryName, serializeCampaignShare } from './campaign-share';
import { gzipJsonText } from './backup-file';
import { fileStem } from './export';
import type { DatabaseDocument } from './document';

/**
 * Bundle each given record (campaign OR standalone) as its own gzipped `.ahlifecam`
 * inside one `.zip` and prompt to save it. `suffix` tags the filename (e.g.
 * `-campaigns` / `-standalones`); `description` is the save-dialog label.
 */
export async function downloadSharesZip(
	doc: DatabaseDocument,
	ids: Iterable<string>,
	suffix: string,
	description: string,
): Promise<void> {
	const files: Record<string, Uint8Array> = {};
	const used = new Set<string>();
	for (const id of ids) {
		const json = serializeCampaignShare(doc, id);
		if (!json) continue; // record vanished — skip
		const base = campaignShareEntryName(doc, id);
		let name = base;
		let i = 2;
		while (used.has(name)) name = base.replace(/\.ahlifecam$/, `-${i++}.ahlifecam`);
		used.add(name);
		files[name] = gzipJsonText(json);
	}
	if (Object.keys(files).length === 0) return;
	// Entries are already gzipped, so store them uncompressed (level 0) in the zip.
	const zipped = zipSync(files, { level: 0 });
	await saveBinaryFile({
		suggestedName: `${fileStem(doc.owner.name, suffix)}.zip`,
		data: new Blob([zipped], { type: 'application/zip' }),
		mime: 'application/zip',
		extension: '.zip',
		description,
	});
}
