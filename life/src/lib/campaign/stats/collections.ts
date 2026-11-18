/**
 * Lifetime completion of each fixed-roster item section (TDC glyphs, TSK Scarlet Keys, FHV areas
 * surveyed, …): which items were ever recorded across a family's plays.
 */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { buildUnionState } from '../achievements/achievement-aggregate';
import type { CampaignRecord } from '../records/campaign-record';
import { recordsByFamily } from '../records/campaign-family';

const COLLECTION_TYPES = new Set([
	'cards',
	'scarletKeys',
	'glyphs',
	'checklist',
	'investigatorChecklist'
]);

export interface CollectionItem {
	id: string;
	label: string;
	collected: boolean;
}
export interface Collection {
	sectionId: string;
	title: string;
	items: CollectionItem[];
	collectedCount: number;
}
export interface CampaignCollections {
	family: string;
	name: string;
	collections: Collection[];
}

export function buildCollections(
	records: CampaignRecord[],
	mergeReturnTo = true
): CampaignCollections[] {
	const out: CampaignCollections[] = [];
	for (const [family, { log: familyLog, recs, codes }] of recordsByFamily(records, mergeReturnTo)) {
		const union = buildUnionState(recs);
		const collections: Collection[] = [];
		const seen = new Set<string>();
		for (const code of codes) {
			const log = getCampaignLog(code);
			if (!log) continue;
			for (const sec of log.db.sections) {
				if (!COLLECTION_TYPES.has(sec.type) || !sec.items?.length || seen.has(sec.id)) continue;
				seen.add(sec.id);
				const collected = union.recordedSectionItems[sec.id] ?? new Set<string>();
				const items: CollectionItem[] = sec.items.map((it) => ({
					id: it.id,
					// TDC glyphs have no `en.items` label, only the composite entry text.
					label: log.en.items?.[it.id] ?? log.en.entries?.[`${sec.id}.${it.id}`]?.text ?? it.id,
					collected: collected.has(it.id)
				}));
				collections.push({
					sectionId: sec.id,
					title: log.en.sections[sec.id] ?? sec.id,
					items,
					collectedCount: items.filter((i) => i.collected).length
				});
			}
		}
		if (collections.length) out.push({ family, name: familyLog.db.name, collections });
	}
	return out;
}
