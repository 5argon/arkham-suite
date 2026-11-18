/**
 * One record as a file to hand to another player. Participants travel as baked snapshots, so in
 * the recipient's database their own roster members resolve live and everyone else is a guest.
 * Import always appends a new copy under a fresh id.
 */
import {
	bakeFromRoster,
	findRecord,
	insertRecord,
	rosterByUid,
	type CampaignRecord,
	type DatabaseDocument
} from './document';
import {
	FILE_EXTENSION,
	fileStem,
	safeFileName,
	saveArtifact,
	type FileFormat
} from './file-format';

/** Bumped only on a breaking change to the share file's shape. */
export const CAMPAIGN_SHARE_VERSION = 1;

export interface CampaignShareFile {
	shareVersion: number;
	/** ISO-8601. */
	exportedAt: string;
	/** A campaign or a standalone record, verbatim. */
	campaign: CampaignRecord;
}

export class CampaignShareError extends Error {}

export function serializeCampaignShare(doc: DatabaseDocument, campaignId: string): string | null {
	const c = findRecord(doc, campaignId);
	if (!c) return null;
	const campaign = JSON.parse(JSON.stringify(c)) as CampaignRecord;
	bakeFromRoster([campaign], rosterByUid(doc));
	const file: CampaignShareFile = {
		shareVersion: CAMPAIGN_SHARE_VERSION,
		exportedAt: new Date().toISOString(),
		campaign
	};
	return JSON.stringify(file, null, 2);
}

/** `<Title>.ahlifecam`, the entry name inside a multi-record zip. */
export function campaignShareEntryName(doc: DatabaseDocument, campaignId: string): string {
	return safeFileName(findRecord(doc, campaignId)?.title ?? '') + FILE_EXTENSION.campaign;
}

/** False when the record is missing or the user cancelled the dialog. */
export async function downloadCampaignShare(
	doc: DatabaseDocument,
	campaignId: string,
	format: FileFormat
): Promise<boolean> {
	const json = serializeCampaignShare(doc, campaignId);
	if (!json) return false;
	const stem = fileStem('arkham-campaign', findRecord(doc, campaignId)?.title ?? '');
	return saveArtifact('campaign', stem, json, format);
}

function isShareFile(value: unknown): value is CampaignShareFile {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.shareVersion === 'number' && typeof v.campaign === 'object' && v.campaign !== null
	);
}

/** Append a shared record as a new copy. Throws `CampaignShareError` on a malformed/newer file. */
export function importCampaignShare(doc: DatabaseDocument, value: unknown): CampaignRecord {
	if (!isShareFile(value)) {
		throw new CampaignShareError('This file is not a recognizable shared campaign.');
	}
	if (value.shareVersion > CAMPAIGN_SHARE_VERSION) {
		throw new CampaignShareError(
			`This campaign was shared by a newer version (format ${value.shareVersion}). Please update first.`
		);
	}
	const src = value.campaign;
	if (!Array.isArray(src.participants) || !Array.isArray(src.decks)) {
		throw new CampaignShareError('This shared campaign file is missing required data.');
	}
	const ts = Date.now();
	const imported: CampaignRecord = {
		...(JSON.parse(JSON.stringify(src)) as CampaignRecord),
		id: crypto.randomUUID(),
		createdAt: ts,
		updatedAt: ts
	};
	bakeFromRoster([imported], rosterByUid(doc));
	insertRecord(doc, imported);
	return imported;
}
