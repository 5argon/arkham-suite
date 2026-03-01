/**
 * campaign-share.ts — export/import a SINGLE campaign as a file you hand to another
 * player, so they can keep their own copy of a session you recorded together.
 *
 * This is self-contained: it does NOT use `campaign-export-format.ts` (which ships
 * uid-only). Here every participant is a BAKED snapshot `{uid, name, icon}`, so on
 * the recipient's machine:
 *   - participants whose uid is in THEIR roster resolve live (e.g. their own entry
 *     shows their current name/portrait, and the campaign joins their database);
 *   - everyone else is a frozen guest (the recorder included).
 *
 * The file carries no "original owner" field — whoever imports it owns their copy.
 * Import always creates a NEW campaign id and appends (no dedup), so the recipient
 * can freely edit (e.g. reassign a guest to one of their own roster members)
 * before keeping it; re-importing the same file yields a second, independent copy.
 */
import { saveBinaryFile, saveTextFile } from '$lib/save-file';
import { BACKUP_MIME, CAMPAIGN_SHARE_EXTENSION, CAMPAIGN_SHARE_FILE_DESCRIPTION, gzipJsonText } from './backup-file';
import { findCampaign, rebakeManaged, rosterByUid, type CampaignRecord, type DatabaseDocument } from './document';

/** Bumped only on a breaking change to the share file's shape. */
export const CAMPAIGN_SHARE_VERSION = 1;

export interface CampaignShareFile {
	shareVersion: number;
	/** ISO-8601 timestamp of when this file was produced. */
	exportedAt: string;
	campaign: CampaignRecord;
}

export class CampaignShareError extends Error {}

/** Serialize one campaign for sharing, with managed participants re-baked fresh. */
export function serializeCampaignShare(doc: DatabaseDocument, campaignId: string): string | null {
	const c = findCampaign(doc, campaignId);
	if (!c) return null;
	// JSON round-trip (not structuredClone) so a Svelte $state proxy is handled.
	const campaign = JSON.parse(JSON.stringify(c)) as CampaignRecord;
	// Re-bake just this campaign's managed participants from the roster.
	const roster = rosterByUid(doc);
	for (const p of campaign.participants) {
		const m = roster.get(p.uid);
		if (m) {
			p.name = m.name;
			p.iconCardCode = m.iconCardCode;
		}
	}
	const file: CampaignShareFile = {
		shareVersion: CAMPAIGN_SHARE_VERSION,
		exportedAt: new Date().toISOString(),
		campaign,
	};
	return JSON.stringify(file, null, 2);
}

/** Filesystem-safe campaign title fragment (no extension/date). */
function safeCampaignTitle(title: string): string {
	return title.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40) || 'campaign';
}

/** A filesystem-safe filename stem for a single-campaign share (no extension). */
function campaignShareStem(title: string): string {
	const date = new Date().toISOString().slice(0, 10);
	return `arkham-campaign-${safeCampaignTitle(title)}-${date}`;
}

/** A filesystem-safe filename for a single-campaign share. */
export function campaignShareFileName(c: { title: string }): string {
	return `${campaignShareStem(c.title)}${CAMPAIGN_SHARE_EXTENSION}`;
}

/** Inner entry name for a campaign inside a multi-campaign zip — no prefix/date
 *  (the outer zip carries those), just `<Title>.ahlifecam`. */
export function campaignShareEntryName(doc: DatabaseDocument, campaignId: string): string {
	const c = findCampaign(doc, campaignId);
	return `${safeCampaignTitle(c?.title ?? 'campaign')}${CAMPAIGN_SHARE_EXTENSION}`;
}

/**
 * Save one campaign as a share file. `gzip` → compact `.ahlifecam`; `json` → the
 * same envelope as plain pretty JSON for inspection. Returns whether a file was
 * written (false when the campaign is missing or the user cancelled the dialog).
 */
export async function downloadCampaignShare(
	doc: DatabaseDocument,
	campaignId: string,
	format: 'gzip' | 'json',
): Promise<boolean> {
	const json = serializeCampaignShare(doc, campaignId);
	if (!json) return false;
	const c = findCampaign(doc, campaignId);
	const stem = campaignShareStem(c?.title ?? 'campaign');
	if (format === 'gzip') {
		return saveBinaryFile({
			suggestedName: `${stem}${CAMPAIGN_SHARE_EXTENSION}`,
			data: gzipJsonText(json),
			mime: BACKUP_MIME,
			extension: CAMPAIGN_SHARE_EXTENSION,
			description: CAMPAIGN_SHARE_FILE_DESCRIPTION,
		});
	}
	return saveTextFile({
		suggestedName: `${stem}.json`,
		text: json,
		extension: '.json',
		description: 'arkham.life campaign (JSON)',
	});
}

function isShareFile(value: unknown): value is CampaignShareFile {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return typeof v.shareVersion === 'number' && typeof v.campaign === 'object' && v.campaign !== null;
}

/**
 * Import a shared campaign into the document as a NEW campaign (fresh id, always
 * appended). Returns the inserted record (so the UI can open it for editing).
 * Throws `CampaignShareError` on a malformed/newer file.
 */
export function importCampaignShare(doc: DatabaseDocument, value: unknown): CampaignRecord {
	if (!isShareFile(value)) {
		throw new CampaignShareError('This file is not a recognizable shared campaign.');
	}
	if (value.shareVersion > CAMPAIGN_SHARE_VERSION) {
		throw new CampaignShareError(
			`This campaign was shared by a newer version (format ${value.shareVersion}). Please update first.`,
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
		updatedAt: ts,
	};
	doc.campaigns.push(imported);
	doc.updatedAt = ts;
	// Defensive: if any imported participant happens to match the importer's roster
	// (e.g. their own entry), refresh that snapshot to their live identity.
	rebakeManaged(doc);
	return imported;
}
