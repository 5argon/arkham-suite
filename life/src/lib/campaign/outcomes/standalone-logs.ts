/**
 * The Campaign Notes a standalone scenario adds when played inside a campaign (Fortune and Folly's
 * "the cell meddled in Abarran's affairs"). The `side` catalogue tags them by scenario; a multi-part
 * standalone (Fortune and Folly's part_1 / part_2 / checkpoint) shares one base id. They are
 * recorded as ordinary log entries, so the standalone is a stop on the campaign's route.
 */
import { getCampaignLog, sectionEntries, type ResolvedLogEntry } from '@5argon/arkham-campaign-data';

/** A standalone scenario id without its `_part_N` / `_checkpoint` suffix. */
export function standaloneBase(id: string): string {
	return id.replace(/_part_\d+$/, '').replace(/_checkpoint$/, '');
}

/** The Campaign Notes entries `standalone` adds, from catalogue `code` (`side`). */
export function standaloneResolvedEntries(code: string, standalone: string): ResolvedLogEntry[] {
	const log = getCampaignLog(code);
	if (!log) return [];
	const base = standaloneBase(standalone);
	return sectionEntries(log, 'campaign_notes').filter(
		(e) => standaloneBase(e.def.scenario ?? '') === base,
	);
}
