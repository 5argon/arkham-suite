/**
 * standalone-logs.ts — the loggable entries a standalone scenario contributes when
 * it is played inside a campaign (e.g. Fortune and Folly's "the cell meddled in
 * Abarran's affairs"). The catalogue campaign (`side`) carries these entries tagged
 * by scenario; a multi-part standalone (Fortune and Folly = part_1 / part_2 /
 * checkpoint) spans a family of tags sharing one base id.
 *
 * These are offered in the LOGS tab's Campaign Notes dropdown (once the standalone
 * is recorded in the Extra tab) and stored as ordinary ordered log entries — so a
 * standalone is a stop in the campaign's play sequence (its route), not a separate
 * read-only list.
 */
import { getCampaignLog, sectionEntries, type ResolvedLogEntry } from '@5argon/arkham-campaign-data';

/** Collapse a standalone scenario id to its product base (drops `_part_N` / `_checkpoint`). */
export function standaloneBase(id: string): string {
	return id.replace(/_part_\d+$/, '').replace(/_checkpoint$/, '');
}

/**
 * The recordable Campaign-Notes entries a standalone contributes, resolved with
 * their English text + def (so they can ride the normal notes-editor add flow).
 * `code` is the catalogue campaign code (currently always `side`); `standalone` is
 * the catalogue scenario id.
 */
export function standaloneResolvedEntries(code: string, standalone: string): ResolvedLogEntry[] {
	const log = getCampaignLog(code);
	if (!log) return [];
	const base = standaloneBase(standalone);
	return sectionEntries(log, 'campaign_notes').filter(
		(e) => standaloneBase(e.def.scenario ?? '') === base,
	);
}
